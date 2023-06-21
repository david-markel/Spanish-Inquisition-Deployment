import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SocketService, MessageType, ConnectPayload, SocketListener, CreateSocketConfig } from '../../services/socket.service';
import { LiveQuizState } from '../live-quiz/live-quiz.component';

@Component({
  selector: 'app-live-quiz-student',
  templateUrl: './live-quiz-student.component.html',
  styleUrls: ['./live-quiz-student.component.scss', '../../shared/live-quiz.scss']
})
export class LiveQuizStudentComponent implements OnInit, OnDestroy, SocketListener {
  state: LiveQuizState = LiveQuizState.JOINING;
  @Input() joinCode!: string;
  error: string | null;
  socketSubscription: Subscription | null;
  questionStart: number;
  wasCorrect: boolean;
  lastPoints: number;
  totalPoints: number;

  DEBUG = false;

  constructor(private router: Router, private socketService: SocketService) {
    this.error = null;
    this.socketSubscription = null;
    this.questionStart = 0;
    this.wasCorrect = false;
    this.lastPoints = 0;
    this.totalPoints = 0;
  }

  ngOnInit() {
    // connect!
    const connectPayload: ConnectPayload = {
      token: sessionStorage.getItem("token")!,
      joinCode: this.joinCode,
    };

    const socketConfig: CreateSocketConfig = {
      connectPayload: connectPayload,
      listener: this,
    };

    this.socketSubscription = this.socketService.createSocket(socketConfig).subscribe();
  }

  ngOnDestroy(): void {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
    this.socketService.closeSocket();
  }

  onGoBack(): void {
    this.socketService.closeSocket();
    this.router.navigate(["join-or-create"]);
  }

  onMessage(e_type: MessageType, payload: any): void {
    if (e_type === 'connect-accept') {
      this.state = LiveQuizState.START_WAIT;
    }
    else if (e_type === 'next-prompt') {
      this.state = LiveQuizState.PROMPT;
    }
    else if (e_type === 'next-choices') {
      this.state = LiveQuizState.CHOICES;
      this.questionStart = Date.now();
    }
    else if (e_type === 'next-results') {
      this.state = LiveQuizState.QUESTION_RESULTS;
    }
    else if (e_type === 'final-results') {
      this.state = LiveQuizState.OVERALL_RESULTS;
    }
    else if (e_type === "choice-result") {
      this.wasCorrect = payload.correct; 

      if (this.wasCorrect) {
        this.lastPoints = payload.points;
        this.totalPoints += this.lastPoints;
      }
    }
  }

  onError(error: string): void {
    this.error = error;
    this.state = LiveQuizState.ERROR;
  }

  onClosed(): void {} // for SocketListener compatibility

  onChoice(choice: 'a' | 'b' | 'c' | 'd') {
    const now = Date.now();
    const delta = (now - this.questionStart);

    this.socketService.sendJson("submit-choice", {
      choice,
      millisTaken: delta,
    });

    this.state = LiveQuizState.RESULTS_WAIT;
  }
}


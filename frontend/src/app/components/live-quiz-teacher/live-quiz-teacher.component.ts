import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Question, Quiz } from '../../services/api.service';
import {
  SocketService,
  MessageType,
  ConnectPayload,
  SocketListener,
  CreateSocketConfig,
} from '../../services/socket.service';
import { LiveQuizState } from '../live-quiz/live-quiz.component';
import { debugData } from './debugData';

type Student = {
  username: string;
  score?: number;
  lastPoints?: number;
};

@Component({
  selector: 'app-live-quiz-teacher',
  templateUrl: './live-quiz-teacher.component.html',
  styleUrls: [
    './live-quiz-teacher.component.scss',
    '../../shared/live-quiz.scss',
  ],
})
export class LiveQuizTeacherComponent
  implements OnInit, OnDestroy, SocketListener
{
  state: LiveQuizState = LiveQuizState.JOINING;
  @Input() quizId!: number;
  quiz: Quiz | null;
  students: Student[];
  error: string | null;
  socketSubscription: Subscription | null;
  questions: Question[];
  currentQuestion: Question | null;
  timerMax: number;
  topAll: Student[];
  topLast: Student[];

  DEBUG = false;
  debugData = debugData;

  constructor(private router: Router, private socketService: SocketService) {
    this.quiz = null;
    this.error = null;
    this.socketSubscription = null;
    this.students = [];
    this.questions = [];
    this.currentQuestion = null;
    this.timerMax = 0;
    this.topAll = [];
    this.topLast = [];
  }

  ngOnInit() {
    const connectPayload: ConnectPayload = {
      token: sessionStorage.getItem('token')!,
      quizId: this.quizId,
    };

    const socketConfig: CreateSocketConfig = {
      connectPayload: connectPayload,
      listener: this,
    };

    this.socketSubscription = this.socketService
      .createSocket(socketConfig)
      .subscribe();
  }

  ngOnDestroy(): void {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
    this.socketService.closeSocket();
  }

  onGoBack(): void {
    this.socketService.closeSocket();
    this.router.navigate(['join-or-create']);
  }

  onError(error: string): void {
    this.error = error;
    this.state = LiveQuizState.ERROR;
  }

  onMessage(e_type: MessageType, payload: any) {
    console.log(`Received message from server: ${e_type}`, payload);
    if (e_type === 'connect-accept') {
      this.quiz = payload.quiz;
      this.questions =
        this.quiz?.questions.sort((a, b) => a.sequence - b.sequence) || [];
      this.state = LiveQuizState.START_WAIT;
    } else if (e_type === 'student-connect') {
      this.students.push(payload);
    } else if (e_type === 'student-disconnect') {
      for (let i = 0; i < this.students.length; i++) {
        if (this.students[i].username === payload.username) {
          this.students.splice(i, 1);
          break;
        }
      }
    } else if (e_type === 'server-next-prompt') {
      this.state = LiveQuizState.PROMPT;
      const nextQuestionId = payload.questionId;

      this.currentQuestion =
        this.questions.find((q) => q.id === nextQuestionId) || null;

      this.timerMax = (this.currentQuestion?.promptDisplayTime || 0) * 1000;
      setTimeout(
        () => this.socketService.sendJson('next-choices', null),
        this.timerMax
      );
    } else if (e_type === 'server-next-choices') {
      this.state = LiveQuizState.CHOICES;

      this.timerMax = (this.currentQuestion?.timeLimit || 0) * 1000;
      setTimeout(
        () => this.socketService.sendJson('next-results', null),
        this.timerMax
      );
    } else if (e_type === 'server-next-results') {
      this.topAll = payload.topAll;
      this.topLast = payload.topLast;
      this.state = LiveQuizState.QUESTION_RESULTS;
    } else if (e_type === 'final-results') {
      this.topAll = payload.topAll;
      this.state = LiveQuizState.OVERALL_RESULTS;
    } else if (e_type === 'game-started') {
      this.socketService.sendJson('next-prompt', null);
    }
  }

  onClosed(): void {}

  onStart(): void {
    // start the game here...
    if (this.students.length === 0) return;

    console.log('START GAME CALLED');
    this.socketService.sendJson('start-game', null);
  }

  onNext(): void {
    // go to next prompt
    this.socketService.sendJson('next-prompt', null);
  }

  onEnd(): void {
    this.socketService.closeSocket();
    this.router.navigate(['/join-or-create']);
  }
}

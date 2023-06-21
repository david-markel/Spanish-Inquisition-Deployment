import { Component } from '@angular/core';
import { Router } from '@angular/router';

// these are the states the quiz can be in
export enum LiveQuizState {
  JOINING = "joining",                   // trying to join
  START_WAIT = "start_wait",             // waiting for the game to start
  PROMPT = "prompt",                     // students cannot do anything, but teacher is showing question
  CHOICES = "choices",                   // students can select their choice
  RESULTS_WAIT = "results_wait",         // when a student has already chosen but is waiting for results
  QUESTION_RESULTS = "question_results", // results for a single question
  OVERALL_RESULTS = "overall_results",   // results for the whole game
  ERROR = "error",                       // unable to connect, allow them to go back & retry
};

@Component({
  selector: 'app-live-quiz',
  templateUrl: './live-quiz.component.html',
  styleUrls: ['./live-quiz.component.scss']
})
export class LiveQuizComponent {
  mode: "teacher" | "student" | null = null;
  state: LiveQuizState = LiveQuizState.START_WAIT;
  joinCode: string | null = null;
  quizId: number | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    // check they are logged in
    const maybeToken = sessionStorage.getItem("token");
    if (!maybeToken) {
      this.router.navigate([""]); // they must log in
    }
    else {
      const userType = sessionStorage.getItem("userType");
      this.mode = userType as "teacher" | "student"; // will always be one of these
    }

    const maybeJoinCode = sessionStorage.getItem("gameCode");
    const maybeQuizId = sessionStorage.getItem("quizId");

    // prevent this if the user navigated here manually
    if (!maybeJoinCode && !maybeQuizId)
      this.router.navigate(["join-or-create"]);
    // should never happen, but just in case
    if (maybeJoinCode && maybeQuizId)
      this.router.navigate(["join-or-create"]);

    if (maybeJoinCode) 
      this.joinCode = maybeJoinCode;
    else if (maybeQuizId)
      this.quizId = parseInt(maybeQuizId);
  }
}

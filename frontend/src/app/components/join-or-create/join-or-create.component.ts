import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, Quiz } from '../../services/api.service';

@Component({
  selector: 'app-join-or-create',
  templateUrl: './join-or-create.component.html',
  styleUrls: ['./join-or-create.component.scss']
})
export class JoinOrCreateComponent {
  mode: "teacher" | "student" | null = null;
  gameCode: string = "";
  error: string | null = null;
  quizzes: Quiz[] | null = null;

  constructor(private router: Router, private apiService: ApiService) {}

  async ngOnInit() {
    const maybeToken = sessionStorage.getItem("token");
    if (!maybeToken) {
      this.router.navigate([""]); // they must log in
    }
    else {
      const userType = sessionStorage.getItem("userType");
      this.mode = userType as "teacher" | "student"; // will always be one of these
    }

    if (this.mode === "teacher") {
      const res = await this.apiService.allQuizzes(maybeToken!);

      if (res.ok) {
        this.quizzes = res.ok;
      }
      else if (res.err) {
        this.error = res.err;
      }
    }
  }

  // check it's an appropriate length
  validateGameCode(): boolean {
    return this.gameCode.length === 6;
  }

  // when a student types a code and presses join
  onJoin() {
    if (!this.validateGameCode()) {
      this.error = "please enter a 6-character game code!";
      return;
    }

    sessionStorage.setItem("gameCode", this.gameCode);
    this.router.navigate(["quiz"]);
  }

  // when a teacher clicks the start button of a quiz
  onStart(quizId: number) {
    sessionStorage.setItem("quizId", quizId.toString());
    this.router.navigate(["quiz"]);
  }

  // when a teacher clicks the edit button of a quiz
  onEdit(quizId: number) {
    this.router.navigate(["/create-edit-quiz", quizId]);
  }

  // when a teacher clicks the create quiz button or edit quiz icon
  onCreateOrEditQuiz() {
    this.router.navigate(["create-edit-quiz"]);
  }
}

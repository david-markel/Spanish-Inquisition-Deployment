import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, Question } from '../../services/api.service';

export type EditingQuestion = Question & { isNew: boolean };

@Component({
  selector: 'app-create-edit-quiz',
  templateUrl: './create-edit-quiz.component.html',
  styleUrls: ['./create-edit-quiz.component.scss'],
})
export class CreateEditQuizComponent {
  quizCreated: boolean;

  token: string;
  quizId: number;
  title: string;
  questions: EditingQuestion[];
  nextQuestionId: number = 0;
  error: string | null;

  isNew: boolean;

  answerChoices = ['a', 'b', 'c', 'd'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {
    this.quizCreated = false;

    this.token = '';
    this.quizId = 0;
    this.title = '';
    this.questions = [];
    this.error = null;

    const raw = this.route.snapshot.paramMap.get('id');

    if (raw) {
      this.quizId = parseInt(raw);
      this.isNew = false;
    } else {
      this.isNew = true;
    }
  }

  async ngOnInit() {
    const maybeToken = sessionStorage.getItem('token');

    if (maybeToken) {
      this.token = maybeToken;
    }

    if (!this.isNew) {
      const { ok, err } = await this.apiService.getQuiz(
        this.token,
        this.quizId
      );

      if (err) {
        this.error = err;
      } else if (ok) {
        this.title = ok.title;
        this.quizCreated = true;
        this.questions = ok.questions.map((q) => ({ ...q, isNew: false }));
      }
    }
  }

  onCancel() {
    this.router.navigate(['/join-or-create']);
  }

  validateQuestionInputs() {
    for (let i = 0; i < this.questions.length; i++) {
      if (
        this.questions[i].prompt.length == 0 ||
        this.questions[i].choiceA.length == 0 ||
        this.questions[i].choiceB.length == 0 ||
        this.questions[i].correctChoice.length == 0 ||
        this.questions[i].promptDisplayTime == 0 ||
        this.questions[i].timeLimit == 0
      ) {
        return false;
      }
    }

    return true;
  }

  async onSaveTitle() {
    if (this.title == '') {
      this.error = 'please enter a title!';
      return;
    }

    let res;
    if (this.isNew) {
      console.log('Found token in save title : ', this.token);
      res = await this.apiService.createQuiz(this.token, this.title);
    } else
      res = await this.apiService.updateQuiz(
        this.token,
        this.quizId,
        this.title
      );

    if (res.ok) {
      console.log(res.ok);
      this.quizCreated = true;
      this.quizId = res.ok.id;
    } else {
      this.error = res.err;
    }
  }

  async onSaveQuiz() {
    if (!this.validateQuestionInputs()) {
      this.error = 'please complete all fields!';
      return;
    }

    let success = true;
    for (const question of this.questions) {
      let res;
      if (question.isNew) {
        console.log('Found token in save quiz : ', this.token);
        res = await this.apiService.createQuestion(this.token, question);
      } else {
        const toSave = { ...question, isNew: undefined, id: undefined };
        res = await this.apiService.updateQuestion(
          this.token,
          question.id,
          toSave
        );
      }

      if (res.ok) {
        console.log(res.ok);
        question.isNew = false;
      } else {
        this.error = res.err;
        success = false;
      }
    }

    if (success) this.router.navigate(['/join-or-create']);
  }

  onAddQuestion() {
    const newQuestion: EditingQuestion = {
      prompt: '',
      choiceA: '',
      choiceB: '',
      choiceC: '',
      choiceD: '',
      correctChoice: 'a',
      promptDisplayTime: 0,
      timeLimit: 0,
      quizId: this.quizId,
      sequence: this.questions.length + 1,
      id: this.nextQuestionId,
      isNew: true,
    };

    this.nextQuestionId++;
    this.questions.push(newQuestion);
  }

  onCorrectChoiceChange(question: Question, event: any) {
    question.correctChoice = event.value;
  }

  async onDeleteQuizClicked() {
    // no need to delete questions -- they will be deleted when the quiz is
    // since the foreign key has on delete cascade
    const { err } = await this.apiService.deleteQuiz(this.token, this.quizId);

    if (err) {
      this.error += err;
    } else {
      this.router.navigate(['/join-or-create']);
    }
  }

  handleQuestionChanged(question: any) {
    const idx = this.questions.findIndex((q) => q.id === question.id);
    this.questions[idx] = question;
  }

  async handleQuestionDeleted(question: any) {
    const idx = this.questions.findIndex((q) => q.id === question.id);

    // hit the API if it's not a new question first
    if (!question.isNew) {
      const { err } = await this.apiService.deleteQuestion(
        this.token,
        question.id
      );

      if (err) {
        this.error = err;
        return; // failure, don't remove from the list
      }
    }

    // remove the question
    const deleted = this.questions.splice(idx, 1);
  }
}

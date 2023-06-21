import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Question } from '../../services/api.service';

@Component({
  selector: 'app-create-edit-question',
  templateUrl: './create-edit-question.component.html',
  styleUrls: ['./create-edit-question.component.scss']
})
export class CreateEditQuestionComponent {
  @Input("question") question!: Question;
  @Output() onQuestionChanged = new EventEmitter<any>();
  @Output() onQuestionDeleted = new EventEmitter<any>();

  answerChoices = ["a", "b", "c", "d"];

  public change(): void {
    this.onQuestionChanged.emit(this.question);
  }

  public delete(): void {
    this.onQuestionDeleted.emit(this.question);
  }

  onCorrectChoiceChange(question: Question, event: any) {
    question.correctChoice = event.value;   
  }
}

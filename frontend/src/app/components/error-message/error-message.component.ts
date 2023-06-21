import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.scss'],
  inputs: ["error"]
})
export class ErrorMessageComponent {
  @Input("error") error!: string | null;
}

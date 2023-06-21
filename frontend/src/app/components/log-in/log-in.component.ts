import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorMessageComponent } from '../error-message/error-message.component';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss']
})
export class LogInComponent {
  username: string;
  password: string;
  error: string | null;

  constructor(private router: Router, private authService: AuthService) {
    this.username = "";
    this.password = "";
    this.error = null;
  }

  validateInputs() {
    return this.username.length > 0 && this.password.length > 0;
  }

  async onLogin() {
    if (!this.validateInputs()) {
      this.error = "please complete all fields!";
      return;
    }

    const success = await this.authService.login(this.username, this.password);

    if (success) {
      this.router.navigate(["/join-or-create"]);
    }
    else {
      this.error = "Invalid username or password";
    }
  }

  onCreateUser() {
    console.log('Create User Clicked');
    this.router.navigate(['/create-user']);
  }
}

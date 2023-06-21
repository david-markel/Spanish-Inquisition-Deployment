import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent {
  userType: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  error: string | null;

  userTypes = ["Student", "Teacher"];

  constructor(private router: Router, private apiService: ApiService, private authService: AuthService) {
    this.userType = "";
    this.firstName = "";
    this.lastName = "";
    this.username = "";
    this.password = "";
    this.error = null;
  }

  validateInputs() {
    return this.userType.length > 0 && this.firstName.length > 0 && this.lastName.length > 0 && this.username.length > 0 && this.password.length > 0;
  }

  async onCreateUser() {
    if (!this.validateInputs()) {
      this.error = "please complete all fields!";
      return;
    }

    //Save user
    const payload = {
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      password: this.password,
      userType: this.userType[0].toLowerCase() + this.userType.slice(1),
    };

    const res = await this.apiService.register(payload);

    if (res.ok) {
      // Call AuthService's login() method instead of directly setting sessionStorage items
      const loggedIn = await this.authService.login(this.username, this.password);
      if (loggedIn) {
        this.router.navigate(["/join-or-create"]);
      } else {
        this.error = "Login failed after registering.";
      }
    } else {
      this.error = res.err;
    }
  }
  onCancel() {
    this.router.navigate(['/']);
  }

  onUserTypeChange(event: any) {
    this.userType = event.value;
    console.log(this.userType);
  }

}

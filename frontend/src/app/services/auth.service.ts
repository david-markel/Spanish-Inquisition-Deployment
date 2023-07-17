import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn = false;

  constructor(private apiService: ApiService) {}

  async login(username: string, password: string): Promise<boolean> {
    const res = await this.apiService.login(username, password);

    if (res.ok) {
      sessionStorage.setItem('token', res.ok.token);
      sessionStorage.setItem('userType', res.ok.user_type);
      this.isLoggedIn = true;
      return true;
    } else {
      return false;
    }
  }
}

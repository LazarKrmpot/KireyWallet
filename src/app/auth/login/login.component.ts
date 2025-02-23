import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CardModule,
    InputTextModule,
    ReactiveFormsModule,
    ButtonModule,
    PasswordModule,
    RouterLink,
    NgClass,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/.*[A-Za-z].*/)]],
  });

  #authService = inject(AuthService);
  #messageService = inject(MessageService);

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;
    this.#authService.login(email, password).subscribe({
      next: (response) => {
        if (response.length >= 1) {
          this.#messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Welcome ${response[0].fullName}`,
          });
        } else {
          this.#messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Invalid email or password',
          });
        }
      },
      error: (error) => {
        this.#messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Invalid email or password',
        });
      },
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}

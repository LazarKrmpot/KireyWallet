import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { PasswordModule } from 'primeng/password';
import { passwordMismatchValidator } from '../../shared/directives/password-mismatch.directive';

import { MessageService } from 'primeng/api';
import { map, debounceTime, of, catchError, throwError, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { RegisterPostData } from '../models/auth';

const emailExistsValidator = (authService: AuthService): AsyncValidatorFn => {
  return (control: AbstractControl) => {
    if (!control.value) return of(null);

    return authService.checkEmailExists(control.value).pipe(
      debounceTime(500),
      map((emailExists) => (emailExists ? { emailTaken: true } : null))
    );
  };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    PasswordModule,
    ButtonModule,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  #registerService = inject(AuthService);
  #messageService = inject(MessageService);
  #router = inject(Router);

  registerForm = new FormGroup(
    {
      fullName: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z\s]*$/),
      ]),
      email: new FormControl(
        '',
        [Validators.required, Validators.email],
        [emailExistsValidator(this.#registerService)]
      ),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern(
          /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/
        ),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
      accountAmount: new FormControl(0, [Validators.required]),
    },
    {
      validators: passwordMismatchValidator,
    }
  );

  onRegister() {
    const postData = {
      ...this.registerForm.value,
      role: 'user',
    };
    delete postData.confirmPassword;
    this.#registerService
      .registerUser(postData as RegisterPostData)
      .pipe(
        tap((response) => {
          this.#messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'User registered successfully',
          });
          this.#router.navigate(['/login']);
        }),
        catchError((err) => {
          this.#messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error registering user',
          });
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  get fullName() {
    return this.registerForm.controls['fullName'];
  }

  get email() {
    return this.registerForm.controls['email'];
  }

  get password() {
    return this.registerForm.controls['password'];
  }

  get confirmPassword() {
    return this.registerForm.controls['confirmPassword'];
  }
  get accountAmount() {
    return this.registerForm.controls['accountAmount'];
  }
}

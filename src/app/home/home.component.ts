import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    RouterModule,
    DialogModule,
    ReactiveFormsModule,
    InputNumberModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  #authService = inject(AuthService);
  #messageService = inject(MessageService);
  user$ = this.#authService.user$;

  visible: boolean = false;
  changeAmountForm = new FormGroup({
    accountAmount: new FormControl(0, [Validators.required, Validators.min(1)]),
  });

  onChageAmount() {
    const user = this.#authService.getUser();
    const newAmount = this.accountAmount.value;

    if (newAmount) {
      this.#authService.updateAccountAmount(user.id, newAmount).subscribe({
        next: (updatedUser) => {
          this.#messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'User registered successfully',
          });
          this.visible = false;
        },
        error: (error) => {
          this.#messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update account amount',
          });
        },
      });
    }
  }

  showDialog() {
    this.visible = true;
  }

  get accountAmount() {
    return this.changeAmountForm.controls['accountAmount'];
  }
}

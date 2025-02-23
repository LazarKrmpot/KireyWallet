import { Component, inject, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { MessageService, ConfirmationService } from 'primeng/api';

import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';

import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { User } from '../auth/models/auth';
import { AuthService } from '../auth/services/auth.service';
import { Transaction } from '../shared/models/account.models';
import { TransactionsDialogComponent } from '../transactions/components/transactions-dialog/transactions-dialog.component';
import { TransactionsTableComponent } from '../transactions/components/transactions-table/transactions-table.component';
import { TransactionsService } from '../transactions/services/account/transactions.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    DialogModule,
    ConfirmPopupModule,
    CommonModule,
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
    CardModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    TransactionsTableComponent,
    TransactionsDialogComponent,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  providers: [ConfirmationService],
})
export class AdminComponent implements OnInit {
  #authService = inject(AuthService);
  #transactionsService = inject(TransactionsService);
  #messageService = inject(MessageService);

  users: User[] = [];
  selectedUserTransactions: Transaction[] = [];
  selectedUserId: string = '';
  displayTransactionsDialog: boolean = false;
  displayEditTransactionDialog: boolean = false;
  selectedTransaction!: Transaction;
  displayConfirmDeleteUserDialog: boolean = false;
  displayConfirmDeleteTransactionDialog: boolean = false;
  userToDelete: string = '';
  transactionToDelete: string = '';

  transactionForm = new FormGroup({
    date: new FormControl<Date | string | null>(null, Validators.required),
    item: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    amountSpent: new FormControl({ value: 0, disabled: true }),
  });

  categories = [
    { label: 'Food', value: 'Food' },
    { label: 'Transport', value: 'Transport' },
    { label: 'Shopping', value: 'Shopping' },
    { label: 'Bills', value: 'Bills' },
    { label: 'Other', value: 'Other' },
  ];

  ngOnInit() {
    this.#authService.getUsers().subscribe((users) => {
      this.users = users.filter((user) => user.role !== 'admin');
    });
  }

  logout(): void {
    this.#authService.logout();
  }

  openTransactionsDialog(userId: string): void {
    this.selectedUserId = userId;
    this.#transactionsService.getTransactionsByUserId(userId).subscribe({
      next: (transactions) => {
        this.selectedUserTransactions = transactions;
        this.displayTransactionsDialog = true;
      },
      error: () => {
        this.#messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load transactions',
        });
      },
    });
  }

  closeTransactionsDialog(): void {
    this.displayTransactionsDialog = false;
    this.selectedUserTransactions = [];
  }

  closeEditTransactionDialog(): void {
    this.displayEditTransactionDialog = false;
    this.selectedTransaction = {} as Transaction;
    this.transactionForm.reset();
  }

  openEditTransactionDialog(transaction: Transaction): void {
    this.selectedTransaction = { ...transaction };
    this.transactionForm.patchValue({
      item: transaction.item || '',
      category: transaction.category || '',
      date: transaction.date ? new Date(transaction.date) : null,
      amountSpent: transaction.amountSpent || 0,
    });
    this.displayEditTransactionDialog = true;
  }

  saveTransactionChanges(transaction: Transaction): void {
    if (this.transactionForm.invalid) return;
    this.#transactionsService.updateTransaction(transaction).subscribe({
      next: () => {
        this.selectedUserTransactions = this.selectedUserTransactions.map(
          (prevTransaction) =>
            prevTransaction.id === transaction.id
              ? { ...prevTransaction, ...transaction }
              : prevTransaction
        );

        this.displayEditTransactionDialog = false;

        this.#messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Transaction updated successfully',
        });
      },
      error: () => {
        this.#messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update transaction',
        });
      },
    });
  }

  confirmDeleteUser(userId: string): void {
    this.userToDelete = userId;
    this.displayConfirmDeleteUserDialog = true;
  }

  deleteUser(): void {
    if (!this.userToDelete) return;

    this.#authService.deleteUser(this.userToDelete).subscribe({
      next: () => {
        this.users = this.users.filter((user) => user.id !== this.userToDelete);
        this.displayConfirmDeleteUserDialog = false;
        this.#messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'User deleted successfully',
        });
      },
      error: () => {
        this.#messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete user',
        });
      },
    });
  }

  confirmDeleteTransaction(transaction: Transaction): void {
    this.transactionToDelete = transaction.id as string;
    this.displayConfirmDeleteTransactionDialog = true;
  }

  deleteTransaction(): void {
    if (!this.transactionToDelete) return;
    this.#transactionsService
      .deleteTransaction(this.transactionToDelete)
      .subscribe({
        next: () => {
          this.selectedUserTransactions = this.selectedUserTransactions.filter(
            (transaction) => transaction.id !== this.transactionToDelete
          );
          this.displayConfirmDeleteTransactionDialog = false;
          this.#messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Transaction deleted successfully',
          });
        },
        error: () => {
          this.#messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete transaction',
          });
        },
      });
  }
}

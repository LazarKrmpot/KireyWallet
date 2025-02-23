import { Component, inject, OnInit } from '@angular/core';

import { MessageService } from 'primeng/api';

import { TransactionsDialogComponent } from './components/transactions-dialog/transactions-dialog.component';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TransactionsTableComponent } from './components/transactions-table/transactions-table.component';
import { AuthService } from '../auth/services/auth.service';
import { Transaction } from '../shared/models/account.models';
import { TransactionsService } from './services/account/transactions.service';
import { tap } from 'rxjs';
@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    RouterModule,
    DialogModule,
    TableModule,
    TransactionsTableComponent,
    TransactionsDialogComponent,
  ],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
})
export class TransactionsComponent implements OnInit {
  #authService = inject(AuthService);
  #acountService = inject(TransactionsService);
  #messageService = inject(MessageService);

  userId!: string;
  accountBalance: number = 0;
  transactions: Transaction[] = [];
  selectedTransaction: Transaction | null = null;
  visible: boolean = false;
  confirmDialogVisible: boolean = false;
  transactionToDelete: Transaction | null = null;

  categories = [
    { label: 'Food', value: 'Food' },
    { label: 'Transport', value: 'Transport' },
    { label: 'Shopping', value: 'Shopping' },
    { label: 'Bills', value: 'Bills' },
    { label: 'Other', value: 'Other' },
  ];

  ngOnInit() {
    this.#authService.user$.subscribe((user) => {
      if (user) {
        this.userId = user.id;
        this.accountBalance = user.accountAmount;
        this.loadTransactions();
      }
    });
  }

  loadTransactions() {
    this.#acountService
      .getTransactionsByUserId(this.userId.toString())
      .subscribe({
        next: (data) => (this.transactions = data),
        error: () =>
          this.#messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch transactions',
          }),
      });
  }

  showDialog(transaction?: Transaction) {
    this.selectedTransaction = transaction || null;
    this.visible = true;
  }

  saveTransaction(transaction: Transaction) {
    this.#acountService
      .updateTransaction(transaction)
      .pipe(
        tap(() => {
          this.#messageService.add({
            severity: 'info',
            summary: 'Updated',
            detail: 'Transaction updated successfully',
          });
          this.loadTransactions();
        })
      )
      .subscribe();

    this.visible = false;
  }
  createTransaction(transaction: Transaction) {
    this.#acountService.createTransaction(transaction).subscribe(() => {
      this.#messageService.add({
        severity: 'success',
        summary: 'Added',
        detail: 'Transaction added successfully',
      });

      this.accountBalance -= transaction.amountSpent;
      this.#authService
        .updateAccountAmount(this.userId, this.accountBalance)
        .subscribe();

      this.loadTransactions();
    });

    this.visible = false;
  }

  showDeleteDialog(transaction: Transaction) {
    this.transactionToDelete = transaction;
    this.confirmDialogVisible = true;
  }

  confirmDelete() {
    if (this.transactionToDelete) {
      this.#acountService
        .deleteTransaction(this.transactionToDelete.id!)
        .subscribe(() => {
          this.#messageService.add({
            severity: 'warn',
            summary: 'Deleted',
            detail: 'Transaction removed',
          });
          this.loadTransactions();
        });
    }
    this.confirmDialogVisible = false;
  }

  cancelDelete() {
    this.confirmDialogVisible = false;
    this.transactionToDelete = null;
  }
}

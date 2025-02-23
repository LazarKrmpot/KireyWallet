import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../../shared/models/account.models';

@Component({
  selector: 'app-transactions-table',
  standalone: true,
  imports: [TableModule, ButtonModule, CommonModule],
  templateUrl: './transactions-table.component.html',
  styleUrl: './transactions-table.component.scss',
})
export class TransactionsTableComponent {
  @Input({
    required: true,
  })
  transactions: Transaction[] = [];
  @Input()
  accountBalance: number = 0;

  @Output() editTransaction = new EventEmitter<Transaction>();
  @Output() deleteTransaction = new EventEmitter<Transaction>();
}

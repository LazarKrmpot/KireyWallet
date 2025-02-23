import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';

import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../../shared/models/account.models';

@Component({
  selector: 'app-transactions-dialog',
  standalone: true,
  imports: [
    DialogModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './transactions-dialog.component.html',
  styleUrl: './transactions-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsDialogComponent {
  @Input({
    required: true,
  })
  visible: boolean = false;
  @Input({
    required: true,
  })
  categoryOptions: { label: string; value: string }[] = [];
  @Input({
    required: true,
  })
  set transaction(transaction: Transaction | null) {
    this.#transaction = transaction;
    if (transaction) {
      this.transactionForm.patchValue({
        item: transaction.item,
        category: transaction.category,
        date: transaction.date ? new Date(transaction.date) : null,
        amountSpent: transaction.amountSpent,
      });

      this.transactionForm.controls['amountSpent'].disable();
      this.isEditMode = true;
    } else {
      this.transactionForm.controls['amountSpent'].enable();
    }
  }

  get transaction(): Transaction | null {
    return this.#transaction;
  }

  @Input() accountBalance: number = 0;
  @Input({
    required: true,
  })
  userId!: string;

  @Output() save = new EventEmitter<Transaction>();
  @Output() cancel = new EventEmitter<void>();
  @Output() create = new EventEmitter<Transaction>();

  #transaction: Transaction | null = null;
  transactionForm: FormGroup;
  isEditMode: boolean = false;

  constructor() {
    this.transactionForm = new FormGroup({
      item: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      date: new FormControl<Date | string | null>(
        new Date(),
        Validators.required
      ),
      amountSpent: new FormControl({ value: 0, disabled: false }, [
        Validators.required,
        Validators.min(0),
      ]),
    });
  }

  amountExceedsBalance(): boolean {
    return (this.transactionForm.value.amountSpent || 0) > this.accountBalance;
  }

  isSaveDisabled(): boolean {
    const amountSpent = this.transactionForm.getRawValue().amountSpent || 0;

    if (this.isEditMode) {
      return this.transactionForm.invalid;
    } else {
      return (
        this.transactionForm.invalid ||
        amountSpent <= 0 ||
        amountSpent > this.accountBalance
      );
    }
  }

  onSave() {
    if (!this.isSaveDisabled()) {
      const newTransaction: Transaction = {
        ...this.transactionForm.getRawValue(),
        id: this.transaction?.id,
        userId: this.userId,
      };

      if (this.isEditMode) {
        this.save.emit(newTransaction);
      } else {
        this.create.emit(newTransaction);
      }
    }
  }

  onCancel() {
    this.cancel.emit();
    this.isEditMode = false;
  }
}

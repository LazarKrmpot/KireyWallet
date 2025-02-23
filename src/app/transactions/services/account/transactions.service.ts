import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Transaction } from '../../../shared/models/account.models';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  #apiUrl = 'http://localhost:3000/transactions';
  #http = inject(HttpClient);

  getTransactionsByUserId(userId: string) {
    return this.#http.get<Transaction[]>(`${this.#apiUrl}?userId=${userId}`);
  }

  createTransaction(transaction: Transaction): Observable<Transaction> {
    return this.#http.post<Transaction>(this.#apiUrl, transaction);
  }

  updateTransaction(transaction: Transaction): Observable<Transaction> {
    return this.#http.put<Transaction>(
      `${this.#apiUrl}/${transaction.id}`,
      transaction
    );
  }

  deleteTransaction(transactionId: string): Observable<void> {
    return this.#http.delete<void>(`${this.#apiUrl}/${transactionId}`);
  }
}

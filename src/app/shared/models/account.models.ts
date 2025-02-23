export interface Transaction {
  id?: string;
  userId: string;
  date: string;
  item: string;
  category: string;
  amountSpent: number;
}

export type TransactionDTO = Omit<Transaction, 'id'>;

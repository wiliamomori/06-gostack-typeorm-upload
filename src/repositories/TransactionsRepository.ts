import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = transactions.reduce(
      (total: number, { type, value }: Transaction) => {
        if (type === 'income') return total + value;
        return total;
      },
      0,
    );

    const outcome = transactions.reduce(
      (total: number, { type, value }: Transaction) => {
        if (type === 'outcome') return total + value;
        return total;
      },
      0,
    );

    const balance: Balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;

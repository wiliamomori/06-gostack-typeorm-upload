import path from 'path';
import fs from 'fs';
import parse from 'csv-parse';

import Transaction from '../models/Transaction';

import uploadConfig from '../config/upload';

import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
}

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const transactions: Transaction[] = [];

    const csvFilePath = path.join(uploadConfig.directory, filename);

    const stream = fs.createReadStream(csvFilePath).pipe(
      parse({
        from_line: 2,
        trim: true,
        skip_empty_lines: true,
        columns: ['title', 'type', 'value', 'category'],
      }),
    );

    /* eslint-disable no-await-in-loop */
    /* eslint-disable no-restricted-syntax */
    for await (const chunk of stream) {
      const { title, type, value, category } = chunk as TransactionDTO;

      const createTransaction = new CreateTransactionService();
      const transaction = await createTransaction.execute({
        title,
        value,
        type,
        category,
      });

      transactions.push(transaction);
    }
    /* eslint-disable no-await-in-loop */
    /* eslint-disable no-restricted-syntax */

    return transactions;
  }
}

export default ImportTransactionsService;

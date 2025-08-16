import type { WrongAnswer, SubmitResult } from '../types';

export class WrongAnswerAPI {
  async submit(batch: WrongAnswer[]): Promise<SubmitResult> {
    return { accepted: batch.length, rejected: 0 };
  }
  async getHistory(_userId: string): Promise<WrongAnswer[]> {
    return [];
  }
}
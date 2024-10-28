import { Injectable, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { CodeQuestion } from './schema/code-questions.schema';

@Injectable()
export class CodeQuestionsService implements OnModuleInit {
  constructor(@InjectModel(CodeQuestion.name) private codeQuestModel: Model<CodeQuestion>) {}
  onModuleInit() {}

  async getQuestions(): Promise<Array<CodeQuestion>> {
    const list = await this.codeQuestModel.find({}).exec();

    return list;
  }
}

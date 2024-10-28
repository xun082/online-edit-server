import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CodeQuestionsService } from './code-questions.service';
import { CodeQuestionsController } from './code-questions.controller';
import { CodeQuestion, CodeQuestionSchema } from './schema/code-questions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CodeQuestion.name, schema: CodeQuestionSchema, collection: 'code_questions' },
    ]),
  ],
  exports: [CodeQuestionsService],
  providers: [CodeQuestionsService],
  controllers: [CodeQuestionsController],
})
export class CodeQuestionsModule {}

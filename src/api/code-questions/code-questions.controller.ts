import { Controller, Post } from '@nestjs/common';

import { CodeQuestionsService } from './code-questions.service';

@Controller('/questions')
export class CodeQuestionsController {
  constructor(private readonly codeQuestionsService: CodeQuestionsService) {}

  @Post('/list')
  getQuestions() {
    return this.codeQuestionsService.getQuestions();
  }
}

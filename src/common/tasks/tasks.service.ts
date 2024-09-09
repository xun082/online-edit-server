import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  constructor() {}

  // 任务每15分钟执行一次
  @Cron('0 0/5 * * * *', {
    name: 'calc data visualization',
  })
  async calcDv() {
    console.log(1);
  }

  //   @Cron('* * * * * *', {
  //     name: 'calc data visualization'
  //   })
  //   async test() {
  //     console.log('任务每秒执行一次');
  //   }
}

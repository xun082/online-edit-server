import { Body, Controller, Get, Post } from '@nestjs/common';

import { CollaborateDocService } from './collaborate-doc.service';
import { DetailDto, CreateShareLinkDto, ShareDetailDto } from './dto/collaborate-doc.dto';

@Controller('document')
export class CollaborateDocController {
  constructor(private readonly collaborateDocService: CollaborateDocService) {}

  @Post('/create')
  createDoc(@Body('docName') docName: string) {
    return this.collaborateDocService.createDoc(docName);
  }

  @Get('/list')
  getRecordList() {
    return this.collaborateDocService.getDocList();
  }

  @Post('/detail')
  getRecord(@Body('recordId') detail: DetailDto) {
    const { recordId } = detail;

    return this.collaborateDocService.getDoc(recordId);
  }

  @Post('/share/create')
  shareDoc(@Body() CreateShareLinkDto: CreateShareLinkDto) {
    return this.collaborateDocService.createShareLink(CreateShareLinkDto);
  }

  @Post('/share/detail')
  shareDetail(@Body() ShareDetailDto: ShareDetailDto) {}
}

import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Param,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
  MulterFile,
} from '@webundsoehne/nest-fastify-file-upload';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

import ApiFileUploadDecorate from '@/core/decorate/upload.decorators';
import { MinioService } from '@/common/minio/minio.service';

@ApiTags('文件上传') // Swagger 文档标签
@Controller('upload')
export class UploadController {
  constructor(private readonly minioService: MinioService) {}

  /**
   * 单文件上传
   * @param file 要上传的文件
   * @param body 包含桶名称和文件名称
   * @returns 上传成功后的文件URL
   */
  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  @ApiFileUploadDecorate('上传单个文件', true) // 使用封装的装饰器
  async uploadSingleFile(@UploadedFile() file: MulterFile) {
    const result = await this.minioService.uploadFile(file);

    return { url: result };
  }

  /**
   * 多文件上传
   * @param files 要上传的文件数组
   * @returns 上传成功后的文件URL数组
   */
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiFileUploadDecorate('上传多个文件', false) // 使用封装的装饰器
  async uploadMultipleFiles(@UploadedFiles() files: MulterFile[]) {
    const results = await this.minioService.uploadFiles(files);

    // 提取每个文件的 URL
    const urls = results.map((result) => result.url);

    return { urls };
  }

  /**
   * 生成预签名POST策略
   * @param body 包含桶名称和文件名称
   * @returns 预签名POST策略和上传目标URL
   */
  @Post('presigned-post-policy')
  @ApiOperation({ summary: '生成预签名POST策略' })
  @ApiResponse({
    status: 200,
    description: '生成预签名POST策略成功，返回策略和URL',
  })
  @ApiConsumes('application/json')
  @ApiBody({
    description: '生成预签名POST策略的请求体',
    schema: {
      type: 'object',
      properties: {
        bucketName: { type: 'string', description: '存储桶名称' },
        fileName: { type: 'string', description: '文件名称' },
      },
    },
  })
  async generatePresignedPostPolicy(@Body() body: { bucketName: string; fileName: string }) {
    const { bucketName, fileName } = body;
    const result = await this.minioService.generatePresignedPostPolicy(bucketName, fileName);

    return { postPolicy: result.postPolicy, url: result.url };
  }

  /**
   * 获取文件列表
   * @param query 包含桶名称
   * @returns 文件列表
   */
  @Get('list')
  @ApiOperation({ summary: '获取文件列表' })
  @ApiQuery({ name: 'bucketName', required: true, description: '存储桶名称' })
  @ApiResponse({
    status: 200,
    description: '成功获取文件列表',
  })
  async listObjects(@Query('bucketName') bucketName: string) {
    const objects = await this.minioService.listObjects(bucketName);

    return objects;
  }

  /**
   * 获取文件
   * @param params 包含桶名称和文件名称
   * @returns 文件内容
   */
  @Get(':bucketName/:fileName')
  @ApiOperation({ summary: '获取文件' })
  @ApiParam({ name: 'bucketName', description: '存储桶名称' })
  @ApiParam({ name: 'fileName', description: '文件名称' })
  @ApiResponse({
    status: 200,
    description: '成功获取文件',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async getFile(@Param('bucketName') bucketName: string, @Param('fileName') fileName: string) {
    const fileStream = await this.minioService.getFile(bucketName, fileName);

    return fileStream; // 注意，这通常需要进一步处理以正确返回文件流
  }

  /**
   * 删除文件
   * @param query 包含桶名称和文件名称
   * @returns 删除成功信息
   */
  @Delete()
  @ApiOperation({ summary: '删除文件' })
  @ApiQuery({ name: 'bucketName', required: true, description: '存储桶名称' })
  @ApiQuery({ name: 'fileName', required: true, description: '文件名称' })
  @ApiResponse({
    status: 200,
    description: '文件删除成功',
  })
  async deleteFile(@Query() query: { bucketName: string; fileName: string }) {
    const { bucketName, fileName } = query;
    await this.minioService.deleteFile(bucketName, fileName);

    return { message: 'File deleted successfully' };
  }
}

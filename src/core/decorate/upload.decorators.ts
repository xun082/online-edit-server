// custom-decorators.ts
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';

export default function ApiFileUploadDecorate(description: string, single: boolean = true) {
  return applyDecorators(
    ApiOperation({ summary: `${single ? '单' : '多'}文件上传`, description }),
    ApiResponse({
      status: HttpStatus.OK,
      description: '文件上传成功，返回文件信息。',
      schema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: '上传成功后的文件URL' },
          urls: {
            type: 'array',
            items: { type: 'string', description: '上传成功后的文件URL数组' },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: '请求不正确，无法处理文件。',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: '没有权限执行此操作。',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: `${single ? '单个' : '多个'}文件上传`,
      required: true,
      schema: {
        type: 'object',
        properties: {
          [single ? 'file' : 'files']: {
            type: single ? 'string' : 'array',
            items: single ? undefined : { type: 'string', format: 'binary' },
            format: single ? 'binary' : undefined,
            description: `要上传的${single ? '文件' : '文件数组'}`,
          },
          bucketName: {
            type: 'string',
            description: '存储桶名称',
          },
          fileName: single
            ? {
                type: 'string',
                description: '文件名称',
              }
            : undefined,
        },
      },
    }),
  );
}

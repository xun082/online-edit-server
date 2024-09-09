import { Inject, Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import sharp from 'sharp'; // 导入 sharp
import * as path from 'path';

import { MiNiOConfigEnum } from '../enum/config.enum';

@Injectable()
export class MinioService {
  private readonly bucketName: string;
  private readonly expiry: number = 24 * 60 * 60; // 预签名URL有效期：24小时

  constructor(
    @Inject('MINIO_CLIENT') private readonly minioClient: Minio.Client,
    protected configService: ConfigService,
  ) {
    this.bucketName = this.configService.get(MiNiOConfigEnum.MINIO_BUCKET);
  }

  async getBuckets() {
    return await this.minioClient.listBuckets();
  }

  async uploadFile(file: MulterFile) {
    const fileName = await this.processAndUploadFile(file);

    return this.getPresignedUrl(fileName);
  }

  async uploadFiles(files: MulterFile[]) {
    const uploadResults = [];

    for (const file of files) {
      const fileName = await this.processAndUploadFile(file);
      const presignedUrl = await this.getPresignedUrl(fileName);
      uploadResults.push({
        url: presignedUrl,
        fileName,
      });
    }

    return uploadResults;
  }

  async generatePresignedPostPolicy(
    bucketName: string,
    fileName: string,
    expiry: number = this.expiry,
  ) {
    const policy = new Minio.PostPolicy();
    policy.setBucket(bucketName);
    policy.setKey(fileName);
    policy.setExpires(new Date(Date.now() + expiry * 1000));

    const postPolicy = await this.minioClient.presignedPostPolicy(policy);

    return {
      postPolicy,
      url: `localhost/${bucketName}`,
    };
  }

  async listObjects(bucketName: string) {
    const stream = this.minioClient.listObjectsV2(bucketName, '', true);
    const objects = [];

    for await (const obj of stream) {
      objects.push(obj);
    }

    return objects;
  }

  async getFile(bucketName: string, fileName: string) {
    return await this.minioClient.getObject(bucketName, fileName);
  }

  async deleteFile(bucketName: string, fileName: string) {
    await this.minioClient.removeObject(bucketName, fileName);
  }

  private async processAndUploadFile(file: MulterFile): Promise<string> {
    try {
      let buffer = file.buffer;
      let fileExtension = this.getFileExtension(file.originalname);

      // 检查文件类型，并转换为 WebP 格式
      if (file.mimetype.startsWith('image/')) {
        buffer = await sharp(buffer)
          .webp({ quality: 80 }) // 转换为 WebP 格式
          .toBuffer();
        fileExtension = 'webp'; // 设置新的文件扩展名
      }

      const etag = this.generateEtag(buffer);
      const fileName = `${etag}.${fileExtension}`; // 使用 etag 和后缀生成文件名

      await this.minioClient.putObject(this.bucketName, fileName, buffer);

      return fileName;
    } catch (error) {
      // 可以根据需要添加更多详细的错误处理
      throw new Error(`文件上传失败: ${error.message}`);
    }
  }

  private async getPresignedUrl(fileName: string): Promise<string> {
    return await this.minioClient.presignedUrl('GET', this.bucketName, fileName, this.expiry);
  }

  private generateEtag(buffer: Buffer): string {
    const hash = createHash('md5'); // 使用 MD5 哈希算法
    hash.update(buffer);

    return hash.digest('hex'); // 以十六进制字符串形式返回哈希值
  }

  private getFileExtension(filename: string): string {
    return path.extname(filename).slice(1); // 提取文件后缀并去掉前面的点
  }
}

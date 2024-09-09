import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class CreatePostDto {
  @ApiProperty({
    description: '帖子内容，包含用户发布的文字信息',
    example: '今天的天气真好！',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: '图片数组，包含帖子中的图片链接',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({
    description: '是否公开帖子，默认为false，如果为true则帖子对所有用户可见，否则仅对好友可见',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    description: '发布位置，用户发布帖子的位置信息',
    example: '上海市，黄浦区',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;
}

export class PostDto {
  @ApiProperty({
    description: '帖子ID，唯一标识帖子',
    example: '60d5ec49f1e7b6236c1a06a8',
  })
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @ApiProperty({
    description: '作者ID，发布该帖子的用户ID',
    example: '60d5ec49f1e7b6236c1a06a7',
  })
  @Transform(({ value }) => value.toString())
  author: Types.ObjectId;

  @ApiProperty({
    description: '帖子内容，包含用户发布的文字信息',
    example: '今天的天气真好！',
  })
  content: string;

  @ApiProperty({
    description: '图片数组，包含帖子中的图片链接',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    type: [String],
  })
  images: string[];

  @ApiProperty({
    description: '是否公开帖子，如果为true则帖子对所有用户可见，否则仅对好友可见',
    example: true,
  })
  isPublic: boolean;

  @ApiProperty({
    description: '发布位置，用户发布帖子的位置信息',
    example: '上海市，黄浦区',
  })
  location: string;

  @ApiProperty({
    description: '创建时间，帖子发布的时间戳（Unix时间）',
    example: 1625558400,
  })
  createdAt: number;
}

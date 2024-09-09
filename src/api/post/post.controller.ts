import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { PostService } from './post.service';
import { CreatePostDto, PostDto } from './dto/index.dto';

import { RequestWithUser } from '@/common/types';
import { ApiResponseWithDto } from '@/core/decorate/api-response.decorator';
import { ResponseDto } from '@/common/dto/response.dto';

@Controller('post')
@ApiTags('Post')
@UseGuards(AuthGuard('jwt'))
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建朋友圈帖子' })
  async createPost(
    @Body() data: CreatePostDto,
    @Request() req: RequestWithUser,
  ): Promise<ResponseDto<void>> {
    const post = await this.postService.createPost(data, req.user._id);

    return post;
  }

  // 删除朋友圈帖子
  @Delete(':id')
  async deletePost(@Param('id') postId: string, @Request() req: RequestWithUser) {
    await this.postService.deletePost(postId, req.user._id);

    return;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取所有朋友圈帖子' })
  @ApiResponseWithDto([PostDto], '获取所有朋友圈帖子', HttpStatus.OK)
  async getAllPosts(@Request() req: RequestWithUser): Promise<ResponseDto<PostDto[]>> {
    const posts = await this.postService.getUserPosts(req.user._id);

    return {
      data: posts.data,
      message: 'All posts retrieved successfully',
    };
  }
}

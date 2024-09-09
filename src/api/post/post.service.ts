import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PostDocument, Post } from './schema/post.schema';
import { CreatePostDto, PostDto } from './dto/index.dto';

import { ResponseDto } from '@/common/dto/response.dto';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  // 创建帖子
  async createPost(data: CreatePostDto, userId: string): Promise<ResponseDto<void>> {
    const { content, images, location, isPublic } = data;

    const newPost = new this.postModel({
      author: userId,
      content,
      images,
      isPublic,
      location,
    });

    await newPost.save();

    return;
  }

  async deletePost(postId: string, userId: string): Promise<ResponseDto<void>> {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // 确保当前用户是该帖子的作者
    if (post.author.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }

    await this.postModel.findByIdAndDelete(postId);

    return;
  }

  async getUserPosts(userId: string): Promise<ResponseDto<PostDto[]>> {
    const posts = await this.postModel.find({ author: userId }).lean().exec();

    return {
      data: posts,
    };
  }
}

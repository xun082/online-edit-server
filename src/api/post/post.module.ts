import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PostService } from './post.service';
import { PostController } from './post.controller';
import { CommentSchema, Comment } from './schema/comment.schema';
import { Post, PostSchema } from './schema/post.schema';
import { Like, LikeSchema } from './schema/like.schema';

@Module({
  controllers: [PostController],
  providers: [PostService],
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema, collection: 'comment' },
      { name: Like.name, schema: LikeSchema, collection: 'like' },
      { name: Post.name, schema: PostSchema, collection: 'post' },
    ]),
  ],
})
export class PostModule {}

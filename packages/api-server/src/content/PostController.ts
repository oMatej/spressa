import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';

import { CreatePost } from './dtos';
import { SanitizerPipe } from '../commons/pipes/SanitizerPipe';

@Controller('/posts')
export class PostController {
  @Post('/')
  @UsePipes(ValidationPipe, SanitizerPipe)
  async createPost(@Body() createPost: CreatePost) {
    return createPost;
  }
}

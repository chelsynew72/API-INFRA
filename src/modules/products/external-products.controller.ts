import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HttpClientService } from '../../http-client/http-client.service';

interface ExternalPost {
  id: number;
  title: string;
  body: string;
  userId: number;
}

@ApiTags('External API (Axios Retry + Circuit Breaker demo)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('external')
export class ExternalProductsController {
  constructor(private readonly httpClient: HttpClientService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Fetch posts from external API (with retry + circuit breaker)' })
  getPosts() {
    return this.httpClient.get<ExternalPost[]>('/posts');
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Fetch one post from external API (with retry + circuit breaker)' })
  getPost(@Param('id') id: string) {
    return this.httpClient.get<ExternalPost>(`/posts/${id}`);
  }
}

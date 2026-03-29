import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookGateway } from './book.gateway';

@Module({
  providers: [BookGateway, BookService],
})
export class BookModule {}

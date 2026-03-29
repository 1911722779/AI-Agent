import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@WebSocketGateway()
export class BookGateway {
  constructor(private readonly bookService: BookService) {}

  @SubscribeMessage('createBook')
  create(@MessageBody() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @SubscribeMessage('findAllBook')
  findAll() {
    return this.bookService.findAll();
  }

  @SubscribeMessage('findOneBook')
  findOne(@MessageBody() id: number) {
    return this.bookService.findOne(id);
  }

  @SubscribeMessage('updateBook')
  update(@MessageBody() updateBookDto: UpdateBookDto) {
    return this.bookService.update(updateBookDto.id, updateBookDto);
  }

  @SubscribeMessage('removeBook')
  remove(@MessageBody() id: number) {
    return this.bookService.remove(id);
  }
}

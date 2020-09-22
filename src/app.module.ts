import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { HasuraService } from './hasura/hasura.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [AppController],
  providers: [HasuraService],
})
export class AppModule {}

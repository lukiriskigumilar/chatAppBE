import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userScheme } from './schemas/user.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: userScheme }]),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

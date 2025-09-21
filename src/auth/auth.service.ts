import { Injectable, ConflictException } from '@nestjs/common';
import { UserService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { customAlphabet } from 'nanoid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}
  async register(_registerDto: RegisterDto) {
    //check email if used
    const existingUser = await this.userService.findByEmail(_registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already used');
    }

    //check username if used
    const existingUsername = await this.userService.findByUsername(
      _registerDto.username,
    );
    if (existingUsername) {
      throw new ConflictException('Username already used');
    }
    const nanoid = customAlphabet('0123456789', 5);
    const id = 'Usr' + nanoid();

    //hash password
    const hashedPassword = await bcrypt.hash(_registerDto.password, 10);

    //save user
    const user = await this.userService.create({
      id: id,
      email: _registerDto.email,
      username: _registerDto.username,
      password: hashedPassword,
    });

    return {
      email: user.email,
      username: user.username,
    };
  }
}

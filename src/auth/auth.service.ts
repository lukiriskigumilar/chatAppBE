import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { customAlphabet } from 'nanoid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

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

  async validatorUser(identifier: string, password: string) {
    let user = await this.userService.findByEmail(identifier);
    if (!user) {
      user = await this.userService.findByUsername(identifier);
    }
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return user;
  }

  async login(identifier: string, password: string) {
    const user = await this.validatorUser(identifier, password);
    if (!user) throw new UnauthorizedException('Email or Password not match');
    const payload = {
      sub: user._id,
      username: user.username,
      email: user.email,
    };
    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }
}

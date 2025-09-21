import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register')
  // eslint-disable-next-line @typescript-eslint/require-await
  async register(@Body() registerDto: RegisterDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.authService.register(registerDto);
  }
}

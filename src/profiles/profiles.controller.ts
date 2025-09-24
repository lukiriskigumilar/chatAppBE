import {
  Controller,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
  Body,
  Get,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ProfileService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path, { extname } from 'path';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('api')
export class ProfilesController {
  constructor(private readonly profileService: ProfileService) {}

  //create profile by user
  @UseGuards(JwtAuthGuard)
  @Post('createProfile')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: path.join(__dirname, '..', '..', 'common', 'uploads'),
        filename: function (req: Express.Request, file, callback) {
          const user =
            (req.user as { userId?: string } | undefined)?.userId ||
            'anonymous';
          const uniqueSuffix = `${user}-${Date.now()}`;
          callback(
            null,
            file.fieldname + '_' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
    }),
  )
  async create(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateProfileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    return this.profileService.create(userId, dto, file?.path || '');
  }

  //Get data by user
  @UseGuards(JwtAuthGuard)
  @Get('getProfile')
  async getProfile(@Req() req: { user: { userId: string } }) {
    const userId = req.user.userId;
    return this.profileService.getProfileByUserId(userId);
  }

  // update data by user
  @UseGuards(JwtAuthGuard)
  @Patch('updateProfile')
  async updateProfile(
    @Req() req: { user: { userId: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    const userId = req.user.userId;
    return this.profileService.updateProfile(userId, dto);
  }
}

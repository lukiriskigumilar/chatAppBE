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
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CloudinaryStorageConfig } from 'src/common/utils/cloudinary';

@Controller('api')
export class ProfilesController {
  constructor(private readonly profileService: ProfileService) {}

  //create profile by user
  @UseGuards(JwtAuthGuard)
  @Post('createProfile')
  @UseInterceptors(
    FileInterceptor('image', { storage: CloudinaryStorageConfig }),
  )
  async create(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateProfileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    const imageUrl = file?.path || '';
    return this.profileService.create(userId, dto, imageUrl);
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

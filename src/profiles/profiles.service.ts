import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile } from './schemas/profile.schema';
import { CreateProfileDto } from './dto/create-profile.dto';
import { getZodiacSign, getHoroscope } from 'src/common/utils/horoscope.util';
import { ProfileResponse } from './dto/profile-response.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
  ) {}
  async create(userId: string, dto: CreateProfileDto, imagePath: string) {
    const existing = await this.profileModel.findOne({ userId });
    if (existing) {
      throw new BadRequestException('You already make the profile');
    }
    const birthday = new Date(dto.birthday);
    const zodiac = getZodiacSign(birthday);
    const horoscope = getHoroscope(zodiac);
    const profile = new this.profileModel({
      userId,
      image: imagePath,
      displayName: dto.displayName,
      gender: dto.gender,
      birthday: dto.birthday,
      zodiac,
      horoscope,
      height: dto.height,
      weight: dto.weight,
    });
    return profile.save();
  }

  async getProfileByUserId(userId: string): Promise<ProfileResponse> {
    const profile = await this.profileModel.findOne({ userId }).exec();
    if (!profile)
      throw new NotFoundException(`profile not found for user ${userId}`);
    return {
      message: 'Profile retrieved successfully',
      data: {
        displayname: profile.displayName,
        birthday: profile.birthday,
        gender: profile.gender,
        horoscope: profile.horoscope,
        zodiac: profile.zodiac,
      },
    };
  }
}

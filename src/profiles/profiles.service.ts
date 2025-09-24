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
import { UpdateProfileDto } from './dto/update-profile.dto';

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
    await profile.save();
    return {
      message: 'profile created successfully',
      data: {
        displayname: profile.displayName,
        image: profile.image,
        birthday: profile.birthday,
        gender: profile.gender,
        horoscope: profile.horoscope,
        zodiac: profile.zodiac,
        height: profile.height,
        weight: profile.weight,
      },
    };
  }

  async getProfileByUserId(userId: string): Promise<ProfileResponse> {
    const profile = await this.profileModel.findOne({ userId }).exec();
    if (!profile)
      throw new NotFoundException(`profile not found for user ${userId}`);
    return {
      message: 'Profile retrieved successfully',
      data: {
        displayname: profile.displayName,
        image: profile.image,
        birthday: profile.birthday,
        gender: profile.gender,
        horoscope: profile.horoscope,
        zodiac: profile.zodiac,
        height: profile.height,
        weight: profile.weight,
      },
    };
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ProfileResponse> {
    const profile = await this.profileModel.findOne({ userId }).exec();
    if (!profile) throw new NotFoundException(' Profile not found ');

    if (dto.displayName) profile.displayName = dto.displayName;
    if (dto.gender) profile.gender = dto.gender;
    if (dto.birthday) profile.birthday = dto.birthday;

    const birthday = new Date(dto.birthday);
    const zodiac = getZodiacSign(birthday);
    const horoscope = getHoroscope(zodiac);
    profile.zodiac = zodiac;
    profile.horoscope = horoscope;

    if (dto.height) profile.height = dto.height;
    if (dto.weight) profile.weight = dto.weight;
    await profile.save();
    return {
      message: 'update data successfully',
      data: {
        displayname: profile.displayName,
        image: profile.image,
        birthday: profile.birthday,
        gender: profile.gender,
        horoscope: profile.horoscope,
        zodiac: profile.zodiac,
        height: profile.height,
        weight: profile.weight,
      },
    };
  }
}

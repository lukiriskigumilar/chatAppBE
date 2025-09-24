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
import cloudinary from 'src/common/utils/cloudinary';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
  ) {}
  async create(
    userId: string,
    dto: CreateProfileDto,
    imageUrl?: string,
    publicId?: string,
  ): Promise<ProfileResponse> {
    const existing = await this.profileModel.findOne({ userId });
    if (existing) {
      throw new BadRequestException('You already make the profile');
    }
    const birthday = new Date(dto.birthday);
    const zodiac = getZodiacSign(birthday);
    const horoscope = getHoroscope(zodiac);
    const profile = new this.profileModel({
      userId,
      image: imageUrl || null,
      imagePublicId: publicId || null,
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
    if (!profile) {
      throw new NotFoundException(`profile not found for user ${userId}`);
    }
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
    imageUrl?: string,
    publicId?: string,
  ): Promise<ProfileResponse> {
    const profile = await this.profileModel.findOne({ userId }).exec();
    if (!profile) {
      await cloudinary.uploader.destroy(publicId || ''); //delete uploaded image if profile not found
      throw new NotFoundException(`profile not found for user ${userId}`);
    }

    //if user upload new image
    if (imageUrl) {
      //delete old image from cloudinary
      if (profile.imagePublicId) {
        await cloudinary.uploader.destroy(profile.imagePublicId);
      }
      //update new image
      profile.image = imageUrl;
      profile.imagePublicId = publicId ?? '';
    }
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

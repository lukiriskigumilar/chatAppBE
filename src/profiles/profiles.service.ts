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
import { uploadToCloudinary } from 'src/common/utils/upload_stream';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
  ) {}
  async create(
    userId: string,
    dto: CreateProfileDto,
    file?: Express.Multer.File,
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
      displayName: dto.displayName,
      image: null,
      imagePublicId: null,
      gender: dto.gender,
      birthday: dto.birthday,
      zodiac,
      horoscope,
      height: dto.height,
      weight: dto.weight,
    });
    const saveData = await profile.save();
    if (file && saveData) {
      try {
        const result: any = await uploadToCloudinary(file);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        profile.image = result.secure_url;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        profile.imagePublicId = result.public_id;
        await profile.save();
      } catch (err) {
        await this.profileModel.findByIdAndDelete(profile._id);
        throw new BadRequestException(`image update Failed ${err}`);
      }
    }
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
    file: Express.Multer.File,
  ): Promise<ProfileResponse> {
    const profile = await this.profileModel.findOne({ userId }).exec();
    if (!profile) {
      throw new NotFoundException(`profile not found for user ${userId}`);
    }

    //if user upload new image
    if (file) {
      //delete old image from cloudinary
      if (profile.imagePublicId) {
        await cloudinary.uploader.destroy(profile.imagePublicId);
      }
      try {
        const resultUpdateImage: any = await uploadToCloudinary(file);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        profile.image = resultUpdateImage.secure_url;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        profile.imagePublicId = resultUpdateImage.public_id;
      } catch (err) {
        throw new BadRequestException(`image update fail ${err}`);
      }
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

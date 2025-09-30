import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, userDocument } from './schemas/user.schemas';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<userDocument>) {}

  //create new user
  async create(data: Partial<User>): Promise<User> {
    const createdUser = new this.userModel(data);
    return createdUser.save();
  }
  //find user by email
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findUsernameById(_id: string): Promise<User | null> {
    return this.userModel.findOne({ _id }).exec();
  }

  //find user by username
  async findByUsername(username: string): Promise<User | null> {
    return this.userModel
      .findOne({
        username,
      })
      .exec();
  }
}

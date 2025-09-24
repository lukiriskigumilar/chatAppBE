import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Profile extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop()
  image: string;

  @Prop()
  imagePublicId: string;

  @Prop()
  displayName: string;

  @Prop()
  gender: string;

  @Prop()
  birthday: string;

  @Prop()
  zodiac: string;

  @Prop()
  horoscope: string;

  @Prop()
  height: number;

  @Prop()
  weight: number;
}
export const ProfileSchema = SchemaFactory.createForClass(Profile);

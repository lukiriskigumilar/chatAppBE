import { IsNotEmpty } from 'class-validator';
export class sendMessageDto {
  @IsNotEmpty()
  receiverUsername: string;

  @IsNotEmpty()
  content: string;
}

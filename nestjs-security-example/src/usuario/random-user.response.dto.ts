import { ApiProperty } from '@nestjs/swagger';

class RandomUserNameDto {
  @ApiProperty() title!: string;
  @ApiProperty() first!: string;
  @ApiProperty() last!: string;
}

class RandomUserPictureDto {
  @ApiProperty() large!: string;
  @ApiProperty() medium!: string;
  @ApiProperty() thumbnail!: string;
}

class RandomUserDto {
  @ApiProperty() gender!: string;
  @ApiProperty({ type: RandomUserNameDto }) name!: RandomUserNameDto;
  @ApiProperty() email!: string;
  @ApiProperty({ type: RandomUserPictureDto }) picture!: RandomUserPictureDto;
}

class RandomUserInfoDto {
  @ApiProperty() seed!: string;
  @ApiProperty() results!: number;
  @ApiProperty() page!: number;
  @ApiProperty() version!: string;
}

export class RandomUserResponseDto {
  @ApiProperty({ type: [RandomUserDto] }) results!: RandomUserDto[];
  @ApiProperty({ type: RandomUserInfoDto }) info!: RandomUserInfoDto;
}

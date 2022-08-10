import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateEmailExtensionDto {
  @ApiProperty({
    type: String,
    example: 'chema_013@hotmail.com',
    description:
      'Field email to extract extension and save if does not exist an register in db.',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class CreateEmailExtensionResponseDto {
  @ApiProperty({
    example: {
      id: 3,
      extension: '@hotmail.com',
      is_deleted: 0,
      created_on: '2022-08-10T21:57:11.000Z',
      created_by: 1,
      modified_on: '2022-08-10T21:57:11.000Z',
      modified_by: 1,
    },
  })
  extension: {};
}

export class getAllExtensionResponseDto {
  @ApiProperty({
    example: [
      {
        id: 1,
        extension: '@hotmail.com',
        is_deleted: 0,
        created_on: '2022-08-10T21:57:11.000Z',
        created_by: 1,
        modified_on: '2022-08-10T21:57:11.000Z',
        modified_by: 1,
      },
      {
        id: 2,
        extension: '@octopy.com',
        is_deleted: 0,
        created_on: '2022-08-10T21:57:11.000Z',
        created_by: 1,
        modified_on: '2022-08-10T21:57:11.000Z',
        modified_by: 1,
      },
    ],
  })
  items: [];
}

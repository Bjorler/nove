import { ApiProperty } from '@nestjs/swagger';

export class UsersDeleteYourSelfErrorDto{
    @ApiProperty({
        type:Number,
        example:418
    })
    statusCode: number;

    @ApiProperty({
        type:String,
        example:"You are not allowed to eliminate yourself"
    })
    message:string
}
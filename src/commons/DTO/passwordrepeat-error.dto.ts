import { ApiProperty } from '@nestjs/swagger';
export class PasswordRepatErrorDto{
    @ApiProperty({
        type:Number,
        example:412
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"The password cannot be the same as that of your other user"
    })
    message:string
}
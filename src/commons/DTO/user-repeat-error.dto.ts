import { ApiProperty } from '@nestjs/swagger';
export class UserRepeatError{
    @ApiProperty({
        type:Number,
        example:421
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"User already exist"
    })
    message:string
}
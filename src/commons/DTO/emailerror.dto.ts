import { ApiProperty } from '@nestjs/swagger';
export class EmailErrorDto{
    @ApiProperty({
        type:Number,
        example:410
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"Email already exist"
    })
    message:string
}
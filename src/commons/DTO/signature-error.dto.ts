import { ApiProperty } from '@nestjs/swagger';
export class SignatureErrorDto{
    @ApiProperty({
        type:Number,
        example:417
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"The signature field is mandatory"
    })
    message:string
}
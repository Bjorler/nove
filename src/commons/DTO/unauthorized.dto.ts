import { ApiProperty } from '@nestjs/swagger';

export class UnauthorizedDto{
    @ApiProperty({
        type:Number,
        example:401
    })
    statusCode: number;

    @ApiProperty({
        type:String,
        example:"MISSING token"
    })
    message:string
}
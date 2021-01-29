import { ApiProperty } from '@nestjs/swagger';
export class NotFoundDto{
    @ApiProperty({
        type:Number,
        example:404
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"USER NOT FOUND"
    })
    message:string
}
import { ApiProperty } from '@nestjs/swagger';

export class EventNotFound{
    @ApiProperty({
        type:Number,
        example:404
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"EVENT NOT FOUND"
    })
    message:string
}
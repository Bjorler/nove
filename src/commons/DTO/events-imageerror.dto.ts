import { ApiProperty } from '@nestjs/swagger';
export class EventsImageErrorDto{
    @ApiProperty({
        type:Number,
        example:417
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"The image field is mandatory"
    })
    message:string
}
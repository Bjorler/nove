import { ApiProperty } from '@nestjs/swagger';
export class EvetnDateErrorDto{
    @ApiProperty({
        type:Number,
        example:415
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"You cannot schedule an event on past dates"
    })
    message:string
}
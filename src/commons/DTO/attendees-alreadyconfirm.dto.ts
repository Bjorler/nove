import { ApiProperty } from '@nestjs/swagger';
export class AttendeesAreadyConfirmDto{
    @ApiProperty({
        type:Number,
        example:425
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"The user has previously confirmed their attendance at the event"
    })
    message:string
}
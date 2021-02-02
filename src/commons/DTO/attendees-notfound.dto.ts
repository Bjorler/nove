import { ApiProperty } from '@nestjs/swagger';
export class AttendeesNotFoundDto{
    @ApiProperty({
        type:Number,
        example:404
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"Assistant not found"
    })
    message:string
}
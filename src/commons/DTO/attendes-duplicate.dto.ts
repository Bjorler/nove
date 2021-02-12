import { ApiProperty } from '@nestjs/swagger';
export class AttendeesDuplicateDto{
    @ApiProperty({
        type:Number,
        example:409
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"User already registered"
    })
    message:string
}
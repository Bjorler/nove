import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AttendeesInfoDto{
    @ApiProperty({
        type:String,
        example:1
    })
    @IsString()
    @IsNotEmpty()
    eventId:string;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AttendeesPaginationDto{
    @ApiProperty({
        type:String,
        example:"10",
        description:"Number of row to display",
        required:true
    })
    @IsString()
    page_size:string;

    @ApiProperty({
        type:String,
        example:"1",
        description:"Number of the current page",
        required:true
    })
    @IsString()
    page:string;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export  class EventsPaginationDto{
    @ApiProperty({
        type:String,
        example:1,
        required:true,
        description:"Current page"
    })
    @IsString()
    @IsNotEmpty()
    page:string;

    @ApiProperty({
        type:String,
        example:10,
        required:true,
        description:"Number of rows to display"
    })
    @IsString()
    @IsNotEmpty()
    page_size:string;

    @ApiProperty({
        type:String,
        example:"2021-06-05",
        required:false
    })
    @IsOptional()
    date_init?:string;

    @ApiProperty({
        type:String,
        example:"2021-07-05",
        required:false,
    })
    @IsOptional()
    date_final?:string

    @ApiProperty({
        type:String,
        example:"CDMX, México",
        required:false,
        description:"This filter can be by event name, event location or number of attendees"
    })
    @IsOptional()
    search_item?:string
}
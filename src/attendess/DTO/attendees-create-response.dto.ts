import { ApiProperty } from '@nestjs/swagger';

export class AttendeesCreateResponseDto{
    @ApiProperty({
        type:String,
        example:"http://126.254.6.1:4057/attendees/contract/18",
        description:"URL to download the pdf"
    })
    path:string;

    @ApiProperty({
        type:Number,
        example:1,
        description:"identifier of the new attendance"
    })
    id:number;
}
import { ApiProperty } from '@nestjs/swagger';

export class attendanceResponse{
    @ApiProperty({
        example:1,
        description:"attendee identifier"
    })
    id:number;

    @ApiProperty({
        example:"http://116.24.56.9:8080/attendees/signature/1"
    })
    signature:string;
}
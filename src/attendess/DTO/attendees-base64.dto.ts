import { ApiProperty } from '@nestjs/swagger';

export class AttendeesBase64Dto{
    @ApiProperty({
        type:String,
        description:"PDF file in base 64"
    })
    pdf:string
}
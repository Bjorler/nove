import { ApiProperty } from '@nestjs/swagger';

export  class AttendeesSignatureDto{
    @ApiProperty({
        type:Object,
        description:"Upload a signature file png/jg"
    })
    signature:any
}
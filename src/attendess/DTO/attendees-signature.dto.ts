import { ApiProperty } from '@nestjs/swagger';

export  class AttendeesSignatureDto{
    
    @ApiProperty({
        type:"file",
        description:"Upload a signature file png/jg",
        properties:{
            signature:{
                type:"string",
                format:"binary"
            }
        },
        required:false
    })
    signature:any
}
import { ApiProperty } from '@nestjs/swagger';
export class DatabaseFileDto{
    
    @ApiProperty({
        type:"file",
        description:"Upload an excel file",
        properties:{
            file:{
                type:"string",
                format:"binary"
            }
        },
        required:false
    })
    file:any
}
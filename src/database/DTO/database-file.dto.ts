import { ApiProperty } from '@nestjs/swagger';
export class DatabaseFileDto{
    @ApiProperty({
        type:Object,
        example:"Upload an excel file"
    })
    file:any
}
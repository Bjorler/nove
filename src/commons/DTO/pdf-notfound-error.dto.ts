import { ApiProperty } from '@nestjs/swagger';

export class PDFNotFoundDto{
    @ApiProperty({
        type:Number,
        example:404
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"PDF NOT FOUND"
    })
    message:string
}
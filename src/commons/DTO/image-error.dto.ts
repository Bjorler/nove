import { ApiProperty } from '@nestjs/swagger';
export class ImageErrorDto{
    @ApiProperty({
        type:"number",
        example:413
    })
    statusCode:number;

    @ApiProperty({
        type:"number",
        example:"Only image are allowed jpg/png/gif"
    })
    message:string
}
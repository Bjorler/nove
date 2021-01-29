import { ApiProperty } from '@nestjs/swagger';
export class ImageNotFoundDto{
    @ApiProperty({
        type:Number,
        example:404
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"Cannot GET /users/image/24"
    })
    message:string;

    @ApiProperty({
        type:String,
        example:"Not Found"
    })
    error:string;
}
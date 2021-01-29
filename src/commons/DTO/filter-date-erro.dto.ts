import { ApiProperty } from '@nestjs/swagger';
export class FilterDateErrorDto{
    @ApiProperty({
        type:Number,
        example:416
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"The start date must be less than the end date"
    })
    message:string
}
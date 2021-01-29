import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber ,Min, IsString } from 'class-validator';
export class PaginationDto{
    @ApiProperty({
        type:"number",
        example:10,
        required:false,
        description:"If the limit field is not sent by default it will be 10"
    })
    @IsOptional()
    limit?:number;

    @ApiProperty({
        type:"number",
        example:"1",
        required:true
    })
    @IsString()
    page:number
}
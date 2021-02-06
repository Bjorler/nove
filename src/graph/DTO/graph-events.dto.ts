import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GraphFilterDto{
    @ApiProperty({
        type:String,
        example:"2021",
        description:"Filter by year"
    })
    @IsString()
    @IsOptional()
    year:string;

}
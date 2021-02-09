import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GraphFilterDto{
    @ApiProperty({
        type:String,
        example:"2021",
        description:"Filter by year",
        required:false
    })
    @IsString()
    @IsOptional()
    year:string;

}
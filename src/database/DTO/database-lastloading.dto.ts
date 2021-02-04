import { ApiProperty } from '@nestjs/swagger';

export class DatabaseLastUploadDto{
    @ApiProperty({
        type:Number,
        example:1
    })
    id:number=0;

    @ApiProperty({
        type:String,
        example:"lista_asistencia.xlsx"
    })
    file_name:String="";

    @ApiProperty({
        type:String,
        example:"http://116.24.56.9:8080/database/excel/1"
    })
    download_file:string="";

    @ApiProperty({
        type:String,
        example:"03-02-2021"
    })
    created_on:string="";
}
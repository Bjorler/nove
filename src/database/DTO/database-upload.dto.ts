import { ApiProperty } from '@nestjs/swagger';
import { DatabaseLastUploadDto } from './database-lastloading.dto';

class UploadErrorDto{
    @ApiProperty({
        type:Number,
        example:9,
        description:"row number with the error"
    })
    row:number;

    @ApiProperty({
        type:String,
        example:""
    })
    TherapyArea:string

    @ApiProperty({
        type:String,
        example:"WMXM00000309"
    })
    IMSID:string;

    @ApiProperty({
        type:String,
        example:"Diana"
    })
    FirstName:string;

    @ApiProperty({
        type:String,
        example:"Ruiz Espinosa"
    })
    LastName:string;

    @ApiProperty({
        type:Number,
        example:1234567
    })
    LicenseNumber:number;

    @ApiProperty({
        type:Number,
        example:7654321
    })
    SpecialtyLicense1:number;

    @ApiProperty({
        type:Number,
        example:9876543
    })
    SpecialtyLicense2:number;

    @ApiProperty({
        type:String,
        example:"email.com.mx"
    })
    EMail:string;

    @ApiProperty({
        type:String,
        example:"Endocrinology"
    })
    Specialty:string;

    @ApiProperty({
        type:String,
        example:"Internal medicine"
    })
    Specialty2:string;

}

export class DatabaseUploadDto{
    @ApiProperty({
        type:DatabaseLastUploadDto
    })
    response:DatabaseLastUploadDto;

    @ApiProperty({
        type:[UploadErrorDto]
    })
    errors:UploadErrorDto[]
}
import { ApiProperty } from '@nestjs/swagger';

export class ResultDto{
    @ApiProperty({
        type:"string",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg1ODQwNn0.LOvUxj9FF4JT7cwhd0NcHzmUG_4xzxC7hC6HbRXH0WY"
    })
    token:string;

    @ApiProperty({
        type:"object",
        example:{
            "event":"C"
        }
    })
    permissions:Object;
    
    @ApiProperty({
        type:"number",
        example:1
    })
    role_id:number;

    @ApiProperty({
        type:String,
        example:"Miguel Morales"
    })
    username:string;

    @ApiProperty({
        type:String,
        example:"Master"
    })
    role:string;

    @ApiProperty({
        type:String,
        example:"http://116.24.56.9:8080/users/image/1"
    })
    download_img:string;

    @ApiProperty({
        type:String,
        example:"http://116.24.56.9:8080/users/image/",
        description:"Default image when main image is missing"
    })
    default_img:string;

}



export class ResponseDto{
    @ApiProperty({
        type:"string",
        example:"Token Provided"
    })
    message:string;

    @ApiProperty({
        type:ResultDto
    })
    result:ResultDto
    
}
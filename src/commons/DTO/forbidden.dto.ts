import { ApiProperty } from '@nestjs/swagger';
export class ForbiddenDto{
    @ApiProperty({
        type:"number",
        example:403
    })
    statusCode:number;

    @ApiProperty({
        type:"number",
        example:"ACCESS DENIED"
    })
    message:string
}
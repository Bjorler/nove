import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber, IsNotEmpty, IsObject, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { TypeOfInstitution } from './attedees-institution.dto';
export class AttendeesCreateDto{

    @ApiProperty({
        type:Number,
        example:1
    })
    @IsNumber()
    eventId:number;

    @ApiProperty({
        type:Number,
        example:7345678923,
        required:true
    })
    @IsNumber()
    cedula:number;

    @ApiProperty({
        type:String,
        example:"Jimena",
        required:true
    })
    @IsString()
    @IsNotEmpty()
    name:string;
    

    @ApiProperty({
        type:String,
        example:"Cardiología Intervencionista",
        required:true
    })
    @IsString()
    @IsNotEmpty()
    speciality:string;

    @ApiProperty({
        type:String,
        example:"jimena.alonso@novonordisk.com",
        required:true
    })
    @IsEmail()
    @IsNotEmpty()
    email:string;

    @ApiProperty({
        type:String,
        example:"excel",
        description:"indicates the place where the information was found"
    })
    @IsString()
    @IsNotEmpty()
    register_type:string;

    @ApiProperty({
        type:String,
        example:"001",
        description:"El formato de este atributo esta pendiente de validación"
    })
    @IsString()
    idengage:string;



    @ApiProperty({
        type:Boolean,
        example:true,
        description:`¿Tiene usted autoridad en alguna organización para tomar o influenciar decisiones o recomendaciones respecto de los productos de Novo
        Nordisk en cuanto a: precio, reembolso, situación en algún formulario, comercialización, compra institucional, otorgamiento de autorizaciones
        relacionadas con la comercialización de los productos de Novo Nordisk?`
    })
    @IsBoolean()
    question1:boolean;

    @ApiProperty({
        type:Boolean,
        example:true,
        description:` ¿Está usted contratado como servidor público o actúa ejerciendo una función oficial o en representación de una entidad pública como un instituto,
        hospital o universidad del estado, cualquier entidad propiedad de o controlada por el estado, es miembro de un partido político, o candidato para
        puestos públicos, empleado de una organización internacional pública como las Naciones Unidas, el Fondo Monetario Internacional, la Organización
        Mundial de la Salud o similares, con o sin remuneración económica?`
    })
    @IsBoolean()
    question2:boolean;


    @ApiProperty({
        enum:TypeOfInstitution,
        example:TypeOfInstitution.PRIVATE,
    })
    @IsEnum(TypeOfInstitution)
    typeOfInstitution:string

    @ApiProperty({
        type:String,
        example:"Instituto Nacional de Cardiología",
        description:"Nombre de la Entidad Pública"
    })
    @IsString()
    @IsNotEmpty()
    institutionName:string;

    @ApiProperty({
        type:String,
        example:"José Manuel Hernández Melendéz, Director área de cardiología",
        description:"Nombre y Título del representante de la Entidad Pública"
    })
    @IsString()
    @IsNotEmpty()
    nameAndTitle:string;

    @ApiProperty({
        type:Boolean,
        example:true,
        description:"Authorizo a Novo Nordisk utilizr esta informción"
    })
    @IsBoolean()
    authorization:boolean;
    

}
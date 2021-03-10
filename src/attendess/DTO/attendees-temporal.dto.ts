import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNumber,
  IsNotEmpty,
  IsObject,
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { TypeOfInstitution } from './attedees-institution.dto';

enum RegisterType {
  EXCEL = 'excel',
  INTERNET = 'internet',
  REGISTERED = 'registered',
}
export class AttendeesTemporalDto {
  @ApiProperty({
    type: String,
    example: 1,
    description: 'temporary assistant identifier',
  })
  @IsOptional()
  id: string;

  @ApiProperty({
    type: String,
    example: 1,
  })
  @IsNotEmpty()
  @IsString()
  eventId: string;

  @ApiProperty({
    type: String,
    example: 7345678923,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  cedula: string;

  @ApiProperty({
    type: String,
    example: 'Emilie',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    example: 'Ruiz Espinosa',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({
    type: String,
    example: 'Cardiología Intervencionista',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  speciality: string;

  @ApiProperty({
    type: String,
    example: 'jimena.alonso@novonordisk.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email: string;

  @ApiProperty({
    //type:String,
    enum: RegisterType,
    example: RegisterType.EXCEL,
    description: 'indicates the place where the information was found',
  })
  //@IsString()
  //@IsNotEmpty()
  @IsEnum(RegisterType, {
    message:
      'register_type must be a valid enum value [excel, internet, registered] ',
  })
  register_type: string;

  @ApiProperty({
    type: String,
    example: '001',
    description: 'El formato de este atributo esta pendiente de validación',
  })
  @IsString()
  idengage: string;

  @ApiProperty({
    type: String,
    example: true,
    description: `¿Tiene usted autoridad en alguna organización para tomar o influenciar decisiones o recomendaciones respecto de los productos de Novo
        Nordisk en cuanto a: precio, reembolso, situación en algún formulario, comercialización, compra institucional, otorgamiento de autorizaciones
        relacionadas con la comercialización de los productos de Novo Nordisk?`,
  })
  @IsNotEmpty()
  @IsString()
  question1: string;

  @ApiProperty({
    type: String,
    example: true,
    description: ` ¿Está usted contratado como servidor público o actúa ejerciendo una función oficial o en representación de una entidad pública como un instituto,
        hospital o universidad del estado, cualquier entidad propiedad de o controlada por el estado, es miembro de un partido político, o candidato para
        puestos públicos, empleado de una organización internacional pública como las Naciones Unidas, el Fondo Monetario Internacional, la Organización
        Mundial de la Salud o similares, con o sin remuneración económica?`,
  })
  @IsNotEmpty()
  @IsString()
  question2: string;

  @ApiProperty({
    type: String,
    example: true,
    description: `Manifiesto con firma y fecha haber informado y en su caso, contar con autorización de mi superior para atender al Evento:`,
  })
  @IsNotEmpty()
  @IsOptional()
  question3: string;

  /*@ApiProperty({
        enum:TypeOfInstitution,
        example:TypeOfInstitution.PRIVATE,
    })
    @IsEnum(TypeOfInstitution,{
        message:`typeOfInstitution must be a valid enum value [${TypeOfInstitution.PUBLIC}, ${TypeOfInstitution.PRIVATE}]`
    })
    typeOfInstitution:string*/

  @ApiProperty({
    type: String,
    example: 'Instituto Nacional de Cardiología',
    description: 'Nombre de la Entidad Pública',
  })
  @IsString()
  @IsOptional()
  institutionName: string;

  @ApiProperty({
    type: String,
    example: 'José Manuel Hernández Melendéz, Director área de cardiología',
    description: 'Nombre y Título del representante de la Entidad Pública',
  })
  @IsString()
  @IsOptional()
  nameAndTitle: string;

  @ApiProperty({
    type: String,
    example: true,
    description: 'Authorizo a Novo Nordisk utilizr esta informción',
  })
  @IsNotEmpty()
  @IsString()
  authorization: string;

  @ApiProperty({
    type: 'file',
    description: 'Upload a signature file png/jg',
    properties: {
      signature: {
        type: 'string',
        format: 'binary',
      },
    },
    required: false,
  })
  signature: any;
}

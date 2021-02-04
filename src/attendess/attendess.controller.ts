import { Controller, Get, Post, Delete, Put, Body, Param, Query, UsePipes, UseGuards,
         SetMetadata, UseInterceptors, UploadedFile, HttpException, HttpStatus, Response, HttpService   
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiResponse, ApiNotFoundResponse, ApiUnauthorizedResponse,
         ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiBadRequestResponse,
         ApiHeader,
         ApiProperty,
         ApiBody, ApiConsumes, ApiOperation
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as moment from 'moment';
import { MasterGuard, TokenGuard } from '../commons/guards';
import { ValidationPipe } from '../commons/validations/validations.pipe';
import { AttendessService } from './attendess.service';
import { EventsService } from 'src/events/events.service';
import { LogServices } from '../commons/services/log.service';
import { EmailServices } from '../commons/services/email.service';
import { User } from '../commons/decoratos/user.decorator';
import { LogDto, ImageErrorDto, SignatureErrorDto, EventNotFound, UnauthorizedDto,
         ForbiddenDto, InternalServerErrrorDto, ImageNotFoundDto, ErrorDto, AttendeesNotFoundDto,
         PDFNotFoundDto
} from '../commons/DTO';
import { AttendeesCreateDto } from './DTO/attendees-create.dto';
import { AttendeesInfoDto } from './DTO/attendees-info.dto';
import { AttendeesResponseDto } from './DTO/attendees-response.dto';
import { AttendeesPaginationDto } from './DTO/attendees-pagination.dto';
import { AttendeesDetailDto } from './DTO/attendees-detail.dto';
import { AttendeesItemDto } from './DTO/attendess-item.dto';
import { AttendeesCreateResponseDto } from './DTO/attendees-create-response.dto';
import {  METHOD, DOMAIN, PORT  } from '../config';
import { AttendeesSignatureDto } from './DTO/attendees-signature.dto';




@ApiTags("Attendees")
@Controller('attendees')
export class AttendessController {
    private TABLE = "attendees";
    constructor(
        private attendessService: AttendessService,
        private logService: LogServices,
        private eventService: EventsService,
        private emailService: EmailServices
    ){}

    


    @Post()
    @ApiOperation({summary:"Api to register an attendee in an event"})
    @SetMetadata('roles',["MASTER","ADMIN"])
    @SetMetadata('permission',['C'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @ApiResponse({status:200, type:AttendeesCreateResponseDto})
    @ApiBadRequestResponse({type:ErrorDto})
    @ApiNotFoundResponse({type:EventNotFound})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})    
    @UseGuards(TokenGuard, MasterGuard)
    @UsePipes(new ValidationPipe)
    async create( @Body() attendees: AttendeesCreateDto, @User() session ){

        //if(!signature) throw new HttpException("The signature field is mandatory", 417)
        const eventExist = await this.eventService.findById(attendees.eventId);
        if(!eventExist.length) throw new HttpException("EVENT NOT FOUND",HttpStatus.NOT_FOUND);
        
        let questions = {
            question1:attendees.question1,
            question2:attendees.question2,
            typeOfInstitution: attendees.typeOfInstitution,
            institutionName: attendees.institutionName,
            nameAndTitle: attendees.nameAndTitle,
            authorization: attendees.authorization,
            idengage: attendees.idengage
        }
        let schema = Object.assign({},{ 
            cedula: attendees.cedula,
            name: attendees.name,
            speciality: attendees.speciality,
            email:attendees.email,
            created_by: session.id,
            modified_by: session.id,
            event_id:attendees.eventId,
            register_type:attendees.register_type,
            idengage: attendees.idengage,
            questions:JSON.stringify(questions) 
        });
        const newAttendees = await this.attendessService.create(schema);
        const increment = await this.eventService.incrementAttendees(attendees.eventId, session.id);
        const pdf = await this.attendessService.fillPDFFisrtPart(questions,attendees.name, eventExist);
        const updated = await this.attendessService.setPdf(newAttendees[0],pdf, session.id);
        

        let response = new AttendeesCreateResponseDto();
        response.id = newAttendees[0];
        response.path = `${METHOD}://${DOMAIN}:${PORT}/attendees/contract/${newAttendees[0]}`

        /** CREATE LOG */
        let log = new LogDto();
        log.new_change = "create";
        log.type = "create";
        log.element = newAttendees[0];
        log.db_table = this.TABLE;
        log.created_by = session.id;
        log.modified_by = session.id;
        await this.logService.createLog(log);

        /** CREATE LOG EVENTS - INCREMENT ASSISTANTS */
        log.new_change = "update";
        log.type = "update";
        log.element = updated;
        log.db_table = "events";
        log.created_by = session.id;
        log.modified_by = session.id;
        await this.logService.createLog(log);

        return response;
    }

    
    @Get("/assists/list/:eventId")
    @ApiOperation({summary:"Api to generate the attendance list of an event"})
    @ApiResponse({status:200, description:"Download the list of attendees in pdf"})
    @ApiNotFoundResponse({type:PDFNotFoundDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    async buildPdf( @Response() res, @Param() eventId:AttendeesInfoDto ){
        const existEvent = await this.eventService.findById(parseInt(eventId.eventId));
        if(!existEvent.length) throw new HttpException("EVENT NOT FOUND", HttpStatus.NOT_FOUND);
        


        const pdfDoc = await PDFDocument.create();
        

        const array = await this.attendessService.findAttendessByEvent(parseInt(eventId.eventId));
        if(!array.length) throw new HttpException("EVENT NOT FOUND", HttpStatus.NOT_FOUND);

        let result = [];

        for(let item of array){
            //if(item.path){
                let info = {
                    cedula:`${item.cedula}`,
                    name:`${item.name}`,
                    signature:item.path
                }
                result.push(info)
            //}
        }
        
        const arrayPage = [];
        let numberOfPages = Math.ceil(result.length /30)
        for(let i=0; i<numberOfPages; i++){
            let newPage =  await  this.attendessService.preparePDF(pdfDoc, existEvent[0].name) //pdfDoc.addPage();
            
            arrayPage.push(newPage);
        }
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        const RGB_PARSE = 1/255;
        const DARK_GRAY = rgb((RGB_PARSE*217),(RGB_PARSE*217),(RGB_PARSE*217));
        const LIGHT_GRAY = rgb((RGB_PARSE*242),(RGB_PARSE*242),(RGB_PARSE*242));
        const BLUE = rgb((RGB_PARSE*53),(RGB_PARSE*71),(RGB_PARSE*140));
        const BLACK_GARY = rgb((RGB_PARSE*115),(RGB_PARSE*115),(RGB_PARSE*115));
        
       const MAX_ROW_TO_DISPLAY = 25;
       let pagina = 1;
        for(let page of arrayPage){
            const { width, height } = page.getSize()
            const TABLE_HEADER_Y = height-180;
            const CEDULA_X = 40;
            const NAME_X = (width/2)-40;
            const FIRMA_X = width-75;
            let INIT_POSITION_Y = TABLE_HEADER_Y - 30;
            
            let current_row = 0
            for(let item of result){
                try{
                    page.drawText(item.cedula,{y:INIT_POSITION_Y, x:CEDULA_X, size:11, font:helveticaBold, color:BLUE})    
                    page.drawText(item.name,{y:INIT_POSITION_Y, x:NAME_X-10, size:11, font:helveticaBold, color:BLUE})  
                    if(item.signature){
                    const SIGNATURE = fs.readFileSync(item.signature);
                    let mimetype = item.signature.split(".")
                    mimetype = mimetype[mimetype.length-1]
                    const EMBEDDED_SIGNATURE =  mimetype == "jpg" ? await pdfDoc.embedJpg(SIGNATURE): pdfDoc.embedPng(SIGNATURE)  
                    page.drawImage(EMBEDDED_SIGNATURE,{y:INIT_POSITION_Y, x:FIRMA_X-25, width:60, height:15})
                    }   
                    INIT_POSITION_Y -= 20;
                    if(current_row == MAX_ROW_TO_DISPLAY){
                        break;
                    }
                    current_row++;
                }catch(err){
                    console.log(err)
                }
            }
            page.drawText(`Página ${pagina} de ${arrayPage.length}`,{y:height-height+50, x:40, size:10, font:helveticaBold, color:DARK_GRAY})
            page.drawText(`Total de asistentes ${array.length}`,{y:height-height+50, x:width-145, size:10, font:helveticaBold, color:DARK_GRAY})
            pagina++;
        }

        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync('./pdf/lista_de_asistencia.pdf', pdfBytes);
        res.download('./pdf/lista_de_asistencia.pdf');
        
    }  


    @Get("/all/:eventId")
    @ApiOperation({summary:"Api to download all the PDF files of the event attendees"})
    @ApiResponse({status:200, description:"Donwload attendee bundle in pdf"})
    @ApiNotFoundResponse({type:AttendeesNotFoundDto})
    async findAllPdfByEvent(@Param() eventId: AttendeesInfoDto, @Response() res){
        const attendees = await this.attendessService.findAttendessByEvent(parseInt(eventId.eventId));
        if(!attendees.length) res.status(404).send({statusCode:404, message:"ATTENDEES NOT FOUND"})

        await this.attendessService.pdfBundle(attendees);
        const RUTA = "./pdf/bundle.pdf";
        res.download(RUTA);
    }


    @Get("/contract/:id")
    @ApiOperation({summary:"Api to download the pdf file of conditions of attendance to the event and hospitality"})
    @ApiResponse({status:200, description:"PDF donwload"})
    @ApiNotFoundResponse({type:PDFNotFoundDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    async prepareContract(@Param() id: AttendeesDetailDto, @Response() res){
        
        const attendess = await this.attendessService.getById(id.id);
        if(!attendess.length) throw new  HttpException("PDF NOT FOUND", HttpStatus.NOT_FOUND)
        
        res.download(attendess[0].pdf_path)
    }
    

    @Put('/sign/:id')
    @ApiOperation({summary:"Api to assign the signature to the PDF file"})
    @SetMetadata('roles',["MASTER","ADMIN"])
    @SetMetadata('permission',['U'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({type:AttendeesSignatureDto})
    @ApiResponse({status:200, type:AttendeesCreateResponseDto})
    @ApiNotFoundResponse({type: PDFNotFoundDto})
    @ApiNotFoundResponse({type:AttendeesNotFoundDto})
    @ApiResponse({status:413,type:ImageErrorDto})
    @ApiResponse({status:417,type:SignatureErrorDto})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})    
    @UseGuards(TokenGuard, MasterGuard)
    @UsePipes(new ValidationPipe)
    @UseInterceptors(FileInterceptor("signature",{
        storage:diskStorage({
            destination:path.join(__dirname,'../signatures'),//Si esta ruta presenta agun error remplazarla por ./images
            filename: (req, file, callback)=>{
                const name = new Date().getTime()
                callback(null, `${name}_${file.originalname}`)
            }
        }),
        fileFilter:(req, file ,callback)=>{
            const authorized = new Set(["image/png","image/jpeg", 'image/gif'])
            if(authorized.has(file.mimetype)) return callback(null, true)
            callback( new HttpException("Only image are allowed jpg/png/gif",413), false)
        }
    }))
    async signContract(@UploadedFile() signature,@Param() id:AttendeesDetailDto, @User() session ){
        if(!signature) throw new HttpException("The signature field is mandatory", 417); 
        
        const existAttendees = await this.attendessService.getById(id.id);
        if(!existAttendees.length) throw new HttpException("ATTENDEES NOT FOUND",HttpStatus.NOT_FOUND)

        const hasPDF = existAttendees[0].pdf_path;
        if(!hasPDF) throw new HttpException("PDF NOT FOUND", HttpStatus.NOT_FOUND)
        await this.attendessService.signPdf(existAttendees[0].pdf_path, signature.path)
        await this.attendessService.setSinature(existAttendees[0].id, signature.path, session.id)
        await this.emailService.sendEmail(`Registro de asistencia`,
        existAttendees[0].email,{filename:"registro_asistencia.pdf",path:existAttendees[0].pdf_path})
        /** CREATE LOG */
        let log = new LogDto();
        log.new_change = "sign_pdf";
        log.type = "sign_pdf";
        log.element = 0;
        log.db_table = this.TABLE;
        log.created_by = session.id;
        log.modified_by = session.id;
        await this.logService.createLog(log);


        let response = new AttendeesCreateResponseDto()
        response.id = id.id;
        response.path = `${METHOD}://${DOMAIN}:${PORT}/attendees/contract/${id.id}`;
        return response;

    }

    @Get('/signature/:id')
    @ApiOperation({summary:"Api to download the image containing the user's signature"})
    @ApiResponse({status:200, description:"Download signature"})
    @ApiNotFoundResponse({type:ImageNotFoundDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    async download(@Response() res ,@Param('id') id:number){
        const attendees = await this.attendessService.findByid(id)
        if(!attendees.length) throw new HttpException('IMAGE NOT FOUND', HttpStatus.NOT_FOUND);
        
        const path = attendees[0].path;
        res.download(path)
    }


    @Get("/detail/:id")
    @ApiOperation({summary:"Api to obtain the information of the user who will attend the event"})
    @SetMetadata('roles',["MASTER"])
    @SetMetadata('permission',['R'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @ApiResponse({status:200, type:AttendeesItemDto})
    @ApiBadRequestResponse({type:ErrorDto})
    @ApiNotFoundResponse({type:AttendeesNotFoundDto})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})    
    @UseGuards(TokenGuard, MasterGuard)
    @UsePipes(new ValidationPipe)
    async findById(@Param() id:AttendeesDetailDto){
        const attendees = await this.attendessService.getById(id.id);
        if( !attendees.length ) throw new HttpException("Assistant not found", HttpStatus.NOT_FOUND);
        
        let response = new AttendeesItemDto();
        response.id = attendees[0].id;
        response.name = attendees[0].name;
        response.lastname = attendees[0].lastname;
        response.cedula = attendees[0].cedula;
        response.speciality = attendees[0].speciality;
        response.email = attendees[0].email;

        return response;
    }

    


    @Get('/:eventId')
    @ApiOperation({summary:"Api to get the name of the event and the event attendees"})
    @SetMetadata('roles',["MASTER"])
    @SetMetadata('permission',['R'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @ApiResponse({status:200, type:AttendeesResponseDto})
    @ApiBadRequestResponse({type:ErrorDto})
    @ApiNotFoundResponse({type:EventNotFound})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})    
    @UseGuards(TokenGuard, MasterGuard)
    @UsePipes(new ValidationPipe)
    async findEvent(@Param() eventId:AttendeesInfoDto, @Query() pagination:AttendeesPaginationDto ){
        
        const existEvent = await this.eventService.findById(parseInt(eventId.eventId));
        if(!existEvent.length) throw new HttpException("EVENT NOT FOUND", HttpStatus.NOT_FOUND);

        const attendees = await this.attendessService.findByEvent(parseInt(eventId.eventId), pagination);
        const { pages, total } = await this.attendessService.totalPages(pagination, parseInt(eventId.eventId));
        
        let response = new AttendeesResponseDto();
        response.eventId = existEvent[0].id;
        response.event_name = existEvent[0].name;
        response.items = attendees;
        response.pages = pages;
        //@ts-ignore
        response.totalFound = parseInt(total);
        return response;
    }
}

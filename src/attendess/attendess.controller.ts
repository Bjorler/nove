import { Controller, Get, Post, Delete, Put, Body, Param, Query, UsePipes, UseGuards,
         SetMetadata, UseInterceptors, UploadedFile, HttpException, HttpStatus, Response   
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiResponse, ApiNotFoundResponse, ApiUnauthorizedResponse,
         ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiBadRequestResponse,
         ApiHeader
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
import { User } from '../commons/decoratos/user.decorator';
import { LogDto, ImageErrorDto, SignatureErrorDto, EventNotFound, UnauthorizedDto,
         ForbiddenDto, InternalServerErrrorDto, ImageNotFoundDto, ErrorDto, AttendeesNotFoundDto
} from '../commons/DTO';
import { AttendeesCreateDto } from './DTO/attendees-create.dto';
import { AttendeesInfoDto } from './DTO/attendees-info.dto';
import { AttendeesResponseDto } from './DTO/attendees-response.dto';
import { AttendeesPaginationDto } from './DTO/attendees-pagination.dto';
import { AttendeesDetailDto } from './DTO/attendees-detail.dto';
import { AttendeesItemDto } from './DTO/attendess-item.dto';



@ApiTags("Attendees")
@Controller('attendees')
export class AttendessController {
    private TABLE = "attendees";
    constructor(
        private attendessService: AttendessService,
        private logService: LogServices,
        private eventService: EventsService
    ){}

    @Post()
    @SetMetadata('roles',["MASTER","ADMIN"])
    @SetMetadata('permission',['C'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @ApiResponse({status:413,type:ImageErrorDto})
    @ApiResponse({ status:417, type:SignatureErrorDto })
    @ApiBadRequestResponse({type:ErrorDto})
    @ApiNotFoundResponse({type:EventNotFound})
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
    async create( @UploadedFile() signature ,@Body() attendees: AttendeesCreateDto, @User() session ){
        if(!signature) throw new HttpException("The signature field is mandatory", 417)
        
        const eventExist = await this.eventService.findById(parseInt(attendees.eventId));
        if(!eventExist.length) throw new HttpException("EVENT NOT FOUND",HttpStatus.NOT_FOUND);

        let path = "";
        path = signature.path;
        let schema = Object.assign({}, attendees,{ 
            path, 
            cedula: parseInt(attendees.cedula),
            created_by: session.id,
            modified_by: session.id,
            event_id:attendees.eventId 
        });
        delete schema.eventId;
        const newAttendees = await this.attendessService.create(schema);
        
        /** CREATE LOG */
        let log = new LogDto();
        log.new_change = "create";
        log.type = "create";
        log.element = newAttendees[0];
        log.db_table = this.TABLE;
        log.created_by = session.id;
        log.modified_by = session.id;
        await this.logService.createLog(log);

        return attendees;
    }

    

    @Get("/contract")
    async prepareContract(){
        const RUTA = "./pdf/nordisk.pdf";
        //carga el archivo
        const pdfDoc = await PDFDocument.load(fs.readFileSync(RUTA));
        const pages = pdfDoc.getPages();
        const page = pages[0];

        //carga los campos llenables
        const form = pdfDoc.getForm()
        
        for(let item of form.getFields()){
            console.log(item.getName())
            
        }
        const NAME = "Campo de texto 2";
        const EVENT = "Campo de texto 4";
        const EVENT_DATE = "Campo de texto 5";
        const QUESTION_1_YES = "Casilla de verificación 1";
        const QUESTION_1_NO = "Casilla de verificación 2";
        const QUESTION_2_YES = "Casilla de verificación 3";
        const QUESTION_2_NO = "Casilla de verificación 4";
        const EXPLANATION = "Campo de texto 6";
        const PUBLIC_ENTITY = "Campo de texto 7";
        const REPRESENTATIVE = "Campo de texto 8";
        const EVENT_NAME_2 = "Campo de texto 9";
        const DATE = "Campo de texto 10";
        const SIGNATURE = "Campo de firma 1";

        let nameField = form.getTextField(NAME);
        nameField.setText("David Arellano Corona");
        
        let eventnameField = form.getTextField(EVENT);
        eventnameField.setText("Avances Tecnologicos de genética humana");

        let dateField = form.getTextField(EVENT_DATE);
        dateField.setText(moment().format("DD-MM-YYYY"));

        let question1yesField = form.getCheckBox(QUESTION_1_YES);
        question1yesField.check();

        let date2Field = form.getTextField(DATE);
        date2Field.setText(moment().format("DD-MM-YYYY"));

        let signatureFild = form.getSignature(SIGNATURE);
        

        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync('./pdf/pruebas_nuevas.pdf', pdfBytes);        

        
    }

    @Get('/signature/:id')
    @ApiResponse({status:200, description:"Download image"})
    @ApiNotFoundResponse({type:ImageNotFoundDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})
    async download(@Response() res ,@Param('id') id:number){
        const attendees = await this.attendessService.findByid(id)
        if(!attendees.length) throw new HttpException('IMAGE NOT FOUND', HttpStatus.NOT_FOUND);
        
        const path = attendees[0].path;
        res.download(path)
    }


    @Get("/detail/:id")
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

    @Get("/pdf/:eventId")
    async buildPdf( @Response() res, @Param() eventId:AttendeesInfoDto ){
        const existEvent = await this.eventService.findById(parseInt(eventId.eventId));
        if(!existEvent.length) throw new HttpException("EVENT NOT FOUND", HttpStatus.NOT_FOUND);
        


        const pdfDoc = await PDFDocument.create();

        const array = await this.attendessService.findAttendessByEvent(parseInt(eventId.eventId));
        const arrayPage = [];
        let numberOfPages = Math.ceil(array.length /30)
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
            for(let item of array){
                try{
                    page.drawText(item.cedula,{y:INIT_POSITION_Y, x:CEDULA_X, size:11, font:helveticaBold, color:BLUE})    
                    page.drawText(item.name,{y:INIT_POSITION_Y, x:NAME_X-10, size:11, font:helveticaBold, color:BLUE})  
                    const SIGNATURE = fs.readFileSync(item.signature);
                    let mimetype = item.signature.split(".")
                    mimetype = mimetype[mimetype.length-1]
                    const EMBEDDED_SIGNATURE =  mimetype == "jpg" ? await pdfDoc.embedJpg(SIGNATURE): pdfDoc.embedPng(SIGNATURE)  
                    page.drawImage(EMBEDDED_SIGNATURE,{y:INIT_POSITION_Y, x:FIRMA_X-25, width:60, height:15})
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


    @Get('/:eventId')
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

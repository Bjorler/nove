import { Controller, Get, Post, Delete, Put, Body, Param, Query, 
          UseInterceptors, UploadedFile, HttpException, HttpStatus, Response   
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as moment from 'moment';
import { AttendessService } from './attendess.service';
import { EventsService } from 'src/events/events.service';
import { LogServices } from '../commons/services/log.service';
import { EmailServices } from '../commons/services/email.service';
import { User } from '../commons/decoratos/user.decorator';
import { LogDto} from '../commons/DTO';
import { AttendeesCreateDto } from './DTO/attendees-create.dto';
import { AttendeesInfoDto } from './DTO/attendees-info.dto';
import { AttendeesResponseDto } from './DTO/attendees-response.dto';
import { AttendeesPaginationDto } from './DTO/attendees-pagination.dto';
import { AttendeesDetailDto } from './DTO/attendees-detail.dto';
import { AttendeesItemDto } from './DTO/attendess-item.dto';
import { AttendeesCreateResponseDto } from './DTO/attendees-create-response.dto';
import { Excel } from '../commons/build-excel/excel';
import { AttendeesCreateDecorator, AttendeesListPdfDecorator, AttendeesListExcelDecorator,
AttendeesAllPdfDecorator, AttendeesContractDecorator, AttendeesSignDecorator, AttendeesSignatureDecorator,
AttendeesDetailDecorator, AttendeesEventsDecorator
} from './decorators';

import {  METHOD, DOMAIN, STATICS_SIGNATURES  } from '../config';


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
    @AttendeesCreateDecorator()
    async create( @Body() attendees: AttendeesCreateDto, @User() session ){

        //if(!signature) throw new HttpException("The signature field is mandatory", 417)
        const eventExist = await this.eventService.findById(attendees.eventId);
        if(!eventExist.length) throw new HttpException("EVENT NOT FOUND",HttpStatus.NOT_FOUND);

        const isAlreadyRegistered = await this.attendessService.isAlreadyRegistered(attendees.cedula, attendees.eventId);
        if(isAlreadyRegistered.length) throw new HttpException("User already registered",HttpStatus.CONFLICT )
        
        let questions = {
            question1:attendees.question1,
            question2:attendees.question2,
            question3: attendees.question3,
            typeOfInstitution: attendees.typeOfInstitution,
            institutionName: attendees.institutionName,
            nameAndTitle: attendees.nameAndTitle,
            authorization: attendees.authorization,
            idengage: attendees.idengage
        }
        let schema = Object.assign({},{ 
            cedula: attendees.cedula,
            name: `${attendees.name} ${attendees.lastname}`,
            firstname: attendees.name,
            lastname: attendees.lastname,
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

        let response = new AttendeesCreateResponseDto();
        response.id = newAttendees[0];
        response.path = `${METHOD}://${DOMAIN}/attendees/contract/${newAttendees[0]}`

        return response;
    }

    
    @Get("/assists/list/:eventId")
    @AttendeesListPdfDecorator()
    async buildPdf( @Response() res, @Param() eventId:AttendeesInfoDto ){
        const existEvent = await this.eventService.findById(parseInt(eventId.eventId));
        if(!existEvent.length) throw new HttpException("EVENT NOT FOUND", HttpStatus.NOT_FOUND);
        


        const pdfDoc = await PDFDocument.create();
        

        const array = await this.attendessService.findAttendessByEvent(parseInt(eventId.eventId));
        
        if(!array.length) throw new HttpException("EVENT NOT FOUND", HttpStatus.NOT_FOUND);

        let result = [];

        for(let item of array){
            let id_string = `000${item.id}`
            let info = {
                id: item.id < 1000 ? id_string.substring(id_string.length-3, id_string.length): `${item.id}`,
                cedula:`${item.cedula}`,
                name:`${item.name}`,
                signature:item.path,
                email: item.email,
                speciality: item.speciality
            }
            result.push(info)
        }
        const arrayPage = [];
        const MAX_ROW_TO_DISPLAY = 14;
        let numberOfPages = Math.ceil(result.length /MAX_ROW_TO_DISPLAY);
        
        
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        const RGB_PARSE = 1/255;
        const DARK_GRAY = rgb((RGB_PARSE*217),(RGB_PARSE*217),(RGB_PARSE*217));
        const LIGHT_GRAY = rgb((RGB_PARSE*242),(RGB_PARSE*242),(RGB_PARSE*242));
        const BLUE = rgb((RGB_PARSE*53),(RGB_PARSE*71),(RGB_PARSE*140));
        const BLACK_GARY = rgb((RGB_PARSE*115),(RGB_PARSE*115),(RGB_PARSE*115));
        const LIGHT_BLUE = rgb((RGB_PARSE*0),(RGB_PARSE*159),(RGB_PARSE*218));
        const DARK_BLUE = rgb((RGB_PARSE*0),(RGB_PARSE*25),(RGB_PARSE*101));
        const AEA99F = rgb((RGB_PARSE*174),(RGB_PARSE*169),(RGB_PARSE*159));
        const WHITE = rgb((RGB_PARSE*255),(RGB_PARSE*255),(RGB_PARSE*255));
       
       let pagina = 1;
       for(let i=0; i<numberOfPages; i++){
           let preparedPDF = await  this.attendessService.preparePDF( existEvent[0].name)
            const [page] = await pdfDoc.copyPages(preparedPDF,[0]);
            
            const { width, height } = page.getSize()
            const TABLE_HEADER_Y = height-123;
            const CEDULA_X = 100 ;
            const NAME_X = 200;
            const FIRMA_X = width-75;
            const ID_X = 50
            const EMAIL_X = 400
            const SPECIALITY_X = 550
            let INIT_POSITION_Y = TABLE_HEADER_Y - 27;
            
            
            let current_row = 0
            const Y_POSITIONS = [INIT_POSITION_Y, INIT_POSITION_Y-27, INIT_POSITION_Y-57, INIT_POSITION_Y-87, INIT_POSITION_Y-114, INIT_POSITION_Y-143,
            INIT_POSITION_Y-174, INIT_POSITION_Y-200, INIT_POSITION_Y-229, INIT_POSITION_Y-261, INIT_POSITION_Y-287, INIT_POSITION_Y-313,
            INIT_POSITION_Y-346, INIT_POSITION_Y-373, INIT_POSITION_Y-401
            ]
            let count = 0;
            for(let item of result){
                try{
                    
                    page.drawText(item.id,{y:Y_POSITIONS[count], x:ID_X, size:8, font:helveticaBold, color:LIGHT_BLUE})
                    page.drawText(item.cedula,{y:Y_POSITIONS[count], x:CEDULA_X, size:8, font:helveticaBold, color:LIGHT_BLUE})    
                    page.drawText(item.name,{y:Y_POSITIONS[count], x:NAME_X-10, size:8,maxWidth:160, lineHeight:37, font:helveticaBold, color:DARK_BLUE})  
                    page.drawText(item.email,{y:Y_POSITIONS[count], x:EMAIL_X-20, maxWidth:100, size:8,  font:helveticaBold, color:DARK_BLUE})
                    page.drawText(item.speciality,{y:Y_POSITIONS[count], x:SPECIALITY_X, maxWidth:200, lineHeight:37 ,size:6, font:helveticaBold, color:DARK_BLUE})
                    if(item.signature){
                        const SIGNATURE = fs.readFileSync(item.signature);
                        let mimetype = item.signature.split(".")
                        mimetype = mimetype[mimetype.length-1]
                        const EMBEDDED_SIGNATURE =  mimetype == "jpg" ? await pdfDoc.embedJpg(SIGNATURE): await pdfDoc.embedPng(SIGNATURE)  
                        page.drawImage(EMBEDDED_SIGNATURE,{y:Y_POSITIONS[count], x:FIRMA_X-25, width:60, height:15})
                    }   
                    INIT_POSITION_Y -= 35;
                    if(current_row == MAX_ROW_TO_DISPLAY){
                        break;
                    }
                    current_row++;
                }catch(err){
                    console.log(err)
                }
                count++;
            }
            page.drawCircle({y:height-height+25 , x:width-38, color:WHITE, size:5})
            page.drawText(`${pagina}`,{y:height-height+21, x:width-40, size:10, font:helveticaBold, color:AEA99F})
            page.drawText(`${numberOfPages}`,{y:height-height+21, x:width-26, size:10, font:helveticaBold, color:AEA99F})
            pdfDoc.addPage(page);
            pagina++;
        }

        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync('./pdf/lista_de_asistencia.pdf', pdfBytes);
        //res.download('./pdf/lista_de_asistencia.pdf');
        res.status(200).send({pdf:fs.readFileSync('./pdf/lista_de_asistencia.pdf',{encoding:'base64'})})
    }  

    @Get('/assists/list-excel/:eventId')
    @AttendeesListExcelDecorator()
    async buildExcel(@Response() res, @Param() eventId:AttendeesInfoDto){
        const existEvent = await this.eventService.findById(parseInt(eventId.eventId));
        if(!existEvent.length) throw new HttpException("EVENT NOT FOUND", HttpStatus.NOT_FOUND);
        const array = await this.attendessService.findAttendessByEvent(parseInt(eventId.eventId));
        if(!array.length) throw new HttpException("EVENT NOT FOUND", HttpStatus.NOT_FOUND);
        let dir = fs.readdirSync(path.join(__dirname,'../../excel'))
        /** DELETE OLD FILES */
        let isTemplate = 'plantilla_excel.xlsx';
        for(let file of dir){
            if(isTemplate != file ){
                await fs.unlinkSync(path.join(__dirname,`../../excel/${file}`))
            }
        }
        /** OPEN EXCEL */
        let workbook = new Excel();
        const PATH = path.join(__dirname,'../../excel/plantilla_excel.xlsx') 
        await workbook.openExcel(PATH);
        /** GET SHEET 1 */
        let SHEET = await workbook.getSheet(1);

        /** SET EVENT DATE */
        let EVENT_DATE_ROW = workbook.getRow(2,SHEET);
        let EVENT_DATE_CELL = workbook.getCell(1, EVENT_DATE_ROW);
        workbook.setValue(EVENT_DATE_CELL,moment(existEvent[0].event_date).format('DD-MM-YYYY'));
        workbook.saveChanges(EVENT_DATE_ROW);

        /** SET EVENT NAME */
        const EVENT_NAME_ROW = workbook.getRow(4,SHEET);
        const EVENT_NAME_CELL = workbook.getCell(1, EVENT_NAME_ROW);
        workbook.setValue(EVENT_NAME_CELL,existEvent[0].name)
        workbook.saveChanges(EVENT_NAME_ROW);


        

        /** BUILD INFORMATION */
        let INITIAL_ROW = 8;
        for(let item of array){
            /** ID SECTION */
            const ID_CELL_POSITION= 1;
            const ID_ROW = workbook.getRow(INITIAL_ROW,SHEET);
            const ID_CELL = workbook.getCell(ID_CELL_POSITION,ID_ROW);
            let id_string = `000${item.id}`
            let id_to_display = item.id < 1000 ? id_string.substring(id_string.length-3, id_string.length): `${item.id}`
            workbook.setValue(ID_CELL,id_to_display);
            workbook.setColor("009FDA",ID_CELL);
            workbook.saveChanges(ID_ROW);

            /** CEDULA SECTION */
            const CEDULA_CELL_POSITION = 2;
            const CEDULA_ROW = workbook.getRow(INITIAL_ROW,SHEET);
            const CEDULA_CELL = workbook.getCell(CEDULA_CELL_POSITION,CEDULA_ROW);
            workbook.setValue(CEDULA_CELL, item.cedula);
            workbook.setColor("009FDA",CEDULA_CELL);
            workbook.saveChanges(CEDULA_ROW);

            /** SECTION DOCTOR'S NAME  */
            const DOCTOR_NAME_CELL_POISITION = 3;
            const DOCTOR_NAME_ROW = workbook.getRow(INITIAL_ROW, SHEET);
            const DOCTOR_NAME_CELL = workbook.getCell(DOCTOR_NAME_CELL_POISITION, DOCTOR_NAME_ROW);
            workbook.setValue(DOCTOR_NAME_CELL, item.name);
            workbook.setColor("001965",DOCTOR_NAME_CELL);
            workbook.saveChanges(DOCTOR_NAME_ROW);

            /** EMAIL SECTION  */
            const EMAIL_CELL_POSITION = 4;
            const EMAIL_ROW = workbook.getRow(INITIAL_ROW, SHEET);
            const EMAIL_CELL = workbook.getCell(EMAIL_CELL_POSITION, EMAIL_ROW);
            workbook.setValue(EMAIL_CELL, item.email);
            workbook.setColor("001965",EMAIL_CELL);
            workbook.saveChanges(EMAIL_ROW)

            /** SPECIALITY SECTION */
            const SPECIALITY_CELL_POSITION = 5;
            const SPECILAITY_ROW = workbook.getRow(INITIAL_ROW, SHEET);
            const SPECIALITY_CELL = workbook.getCell(SPECIALITY_CELL_POSITION, SPECILAITY_ROW);
            workbook.setValue(SPECIALITY_CELL, item.speciality);
            workbook.setColor("001965",SPECIALITY_CELL);
            workbook.saveChanges(SPECILAITY_ROW);

            /** SIGNATURE SECTION  */
            if(item.path){
                const SINGATURE_CELL_POSITION = 6;
                const SIGNATURE_ROW = workbook.getRow(INITIAL_ROW, SHEET);
                const SIGNATURE_CELL = await workbook.getCell(SINGATURE_CELL_POSITION,SIGNATURE_ROW);
                
                await workbook.addImage(item.path,SHEET,INITIAL_ROW,SINGATURE_CELL_POSITION);
                
                workbook.saveChanges(SIGNATURE_ROW)
            }

            INITIAL_ROW++;
        }

        /** WRITE FINAL EXCEL */
        let name = `${new Date().getTime()}${existEvent[0].name.substr(0,2)}${existEvent[0].id}`
        const PATH_NEW_EXCEL = path.join(__dirname,`../../excel/${name}.xlsx`)
        await workbook.writeFile(PATH_NEW_EXCEL)
        res.download(PATH_NEW_EXCEL);
        
    }

    @Get('/img-template')
    async imgTemplate(@Response() res){
        res.download(path.join(__dirname,'../../src/commons/html-templates/logodash.png'))
    }

    @Get("/all/:eventId")
    @AttendeesAllPdfDecorator()
    async findAllPdfByEvent(@Param() eventId: AttendeesInfoDto, @Response() res){
       
        const attendees = await this.attendessService.findAttendessByEvent(parseInt(eventId.eventId));
        
        if(!attendees.length) res.status(404).send({statusCode:404, message:"ATTENDEES NOT FOUND"})
        if (!fs.existsSync('./pdf/bundle')){
            fs.mkdirSync('./pdf/bundle');
        }
        
        let dir = fs.readdirSync('./pdf/bundle')
        

        
        /** DELETE OLD FILES */
        for(let file of dir){
            await fs.unlinkSync(`./pdf/bundle/${file}`)
        }
        
        let name = `l${eventId.eventId}_${new Date().getTime()}`
        const RUTA = `./pdf/bundle/${name}.pdf`;
        await this.attendessService.pdfBundle(attendees,RUTA);
        res.status(200).send({pdf:fs.readFileSync(RUTA,{encoding:'base64'})});
        //res.download(RUTA);
    }


    @Get("/contract/:id")
    @AttendeesContractDecorator()
    async prepareContract(@Param() id: AttendeesDetailDto, @Response() res){
        
        const attendess = await this.attendessService.getById(id.id);
        if(!attendess.length) throw new  HttpException("PDF NOT FOUND", HttpStatus.NOT_FOUND)
        
        //res.download(attendess[0].pdf_path)
        res.status(200).send({pdf:fs.readFileSync(attendess[0].pdf_path,{encoding:'base64'})})
    }
    

    @Put('/sign/:id')
    @AttendeesSignDecorator()
    @UseInterceptors(FileInterceptor("signature",{
        storage:diskStorage({
            destination:path.join(__dirname,STATICS_SIGNATURES),//Si esta ruta presenta agun error remplazarla por ./images
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
        
        const event = await this.eventService.findById(existAttendees[0].event_id)
        
        let email_template = await this.emailService.readTemplate(path.join(__dirname,'../../src/commons/html-templates/email-attendees.html'));
        let event_time = `${moment(event[0].hour_init,"HH:mm").format("HH:mm")} - ${moment(event[0].hour_end,"HH:mm").format("HH:mm")} Hrs`;
        let logo = `${METHOD}://${DOMAIN}/attendees/img-template`
        
        email_template = this.emailService.prepareTemplate([
            {key:"event_name", value:event[0].name},
            {key:"event_date", value:moment(event[0].event_date).format("YYYY-MM-DD")},
            {key:"logo", value:`<img src="${logo}" style="width: 100%; height: 100px; ">`},
            {key:"event_time", value:event_time},
            {key:"event_location", value:event[0].address}
        ],email_template);
        await this.emailService.sendEmail(`Registro de asistencia`,
        existAttendees[0].email,{filename:"registro_asistencia.pdf",path:existAttendees[0].pdf_path}, email_template)
        
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
        response.path = `${METHOD}://${DOMAIN}/attendees/contract/${id.id}`;
        return response;

    }

    @Get('/signature/:id')
    @AttendeesSignatureDecorator()
    async download(@Response() res ,@Param('id') id:number){
        const attendees = await this.attendessService.findByid(id)
        if(!attendees.length) throw new HttpException('IMAGE NOT FOUND', HttpStatus.NOT_FOUND);
        
        const path = attendees[0].path;
        res.download(path)
    }


    @Get("/detail/:id")
    @AttendeesDetailDecorator()
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
    @AttendeesEventsDecorator()
    async findEvent(@Param() eventId:AttendeesInfoDto, @Query() pagination:AttendeesPaginationDto ){
        
        const existEvent = await this.eventService.findById(parseInt(eventId.eventId));
        if(!existEvent.length) throw new HttpException("EVENT NOT FOUND", HttpStatus.NOT_FOUND);

        const attendees = await this.attendessService.findByEvent(parseInt(eventId.eventId), pagination);
        const { pages, total } = await this.attendessService.totalPages(pagination, parseInt(eventId.eventId));
        
        let response = new AttendeesResponseDto();
        response.eventId = existEvent[0].id;
        response.event_name = existEvent[0].name;
        response.event_date = moment(existEvent[0].event_date).format("DD-MM-YYYY");
        response.items = attendees;
        response.pages = pages;
        //@ts-ignore
        response.totalFound = parseInt(total);
        return response;
    }
}

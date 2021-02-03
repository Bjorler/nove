import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import * as moment from 'moment';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { AttendeesCreateDto } from './DTO/attendees-create.dto';
import { AttendeesListDto } from './DTO/attendees-list.dto';
import { AttendeesPaginationDto } from './DTO/attendees-pagination.dto';
import { METHOD, DOMAIN, PORT } from '../config';


@Injectable()
export class AttendessService {
    
    private TABLE = "attendees";
    constructor(
        @InjectKnex() private knex: Knex
    ){}


    async create(attendees){
        const attendee = await this.knex.table(this.TABLE).insert(attendees);
        return attendee;
    }

    async findByEvent(eventId:number, pagination: AttendeesPaginationDto){
        let page = parseInt(pagination.page)
        let limit = parseInt(pagination.page_size)
        const offset = page == 1 ? 0 : (page-1)*limit
        
        const attendees = await this.knex
        .select(`${this.TABLE}.id`,`${this.TABLE}.cedula`,
        `${this.TABLE}.name`,`${this.TABLE}.lastname`,`${this.TABLE}.speciality`,
        `${this.TABLE}.register_type`
        )
        .table(this.TABLE)
        .limit(limit).offset(offset)
        .where('attendees.event_id','=', eventId);

        let result = [];
        for(let item of attendees){
            let info = new AttendeesListDto();
            info.cedula = item.cedula,
            info.name = `${item.name} ${item.lastname}`;
            info.download_signature = `${METHOD}://${DOMAIN}:${PORT}/attendees/signature/${item.id}`;
            info.id = item.id;
            info.register_type = item.register_type;
            result.push(info)
        }

        return result;
    }

    async findByid(id:number){
        const attendees = await this.knex.table(this.TABLE).where({is_deleted:0})
        return attendees;
    }

    async totalPages(pagination:AttendeesPaginationDto, eventId:number){
        const limit = parseInt(pagination.page_size);
        const count = await this.knex.table(this.TABLE).count("id",{as:'total'}).where({is_deleted:0})
        .andWhere({event_id:eventId})
        const total = count[0].total;
        //@ts-ignore
        let module = total % limit;
        //@ts-ignore
        let div = Math.floor(total/limit)
        let pages = div + ( module > 0 ? 1: 0 )
        return {pages, total}
    }


    async getById(id:number){
        const attendees = await this.knex.table(this.TABLE).where({is_deleted:0})
        .andWhere({id})
        return attendees;
    }

    async findAttendessByEvent(eventId:number){
        const attendees = await this.knex
        .table(this.TABLE)
        .where('attendees.event_id','=', eventId).andWhere({is_deleted:0})
        let result = [];

        for(let item of attendees){
            let info = {
                cedula:`${item.cedula}`,
                name:`${item.name} ${item.lastname}`,
                signature:item.path
            }
            result.push(info)
        }
        return result;
    }

    async preparePDF(pdfDoc, event_name:string){
        let page = pdfDoc.addPage();
        const { width, height } = page.getSize()
        const PATH_RESOURCE = "./pdf/resources";
        
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        const RGB_PARSE = 1/255;
        const DARK_GRAY = rgb((RGB_PARSE*217),(RGB_PARSE*217),(RGB_PARSE*217));
        const LIGHT_GRAY = rgb((RGB_PARSE*242),(RGB_PARSE*242),(RGB_PARSE*242));
        const BLUE = rgb((RGB_PARSE*53),(RGB_PARSE*71),(RGB_PARSE*140));
        const BLACK_GARY = rgb((RGB_PARSE*115),(RGB_PARSE*115),(RGB_PARSE*115));

        /** HEADER */
        const HEADER_Y = (height-70)
        
        const logo = fs.readFileSync(`${PATH_RESOURCE}/2396.png`);
        const embedLogo = await pdfDoc.embedPng(logo);
        page.drawImage(embedLogo,{x:40, y: HEADER_Y , width:50, height:50})
        page.drawText("LISTA DE ASISTENCIA",{font:helveticaBold ,x:width-170, y:height-50, size:12, color:DARK_GRAY});
        page.drawLine({
            start: { x: 40, y: height-80 },
            end: { x: width-40, y:height-80},
            color: LIGHT_GRAY
        })
        page.drawLine({
            start: { x: 41, y: height-80 },
            end: { x: width-41, y:height-80},
            color: LIGHT_GRAY
        })

        /** INFORMACIÓN DEL EVENTO */
        const EVENT_NAME = event_name;
        const DATE = moment().format("DD-MM-YYYY")
        page.drawText(EVENT_NAME,{ y:height-110, x:40, size: 14, maxWidth:400,
            font:helveticaBold, color: BLUE })
        page.drawText(DATE,{y:height-110, x:width-100, size: 12, maxWidth:400,
            font:helveticaBold, color:DARK_GRAY})    
        


        /** TABLE HEADER */
        const TABLE_HEADER_Y = height-180;
        const CEDULA_X = 40;
        const NAME_X = (width/2)-40;
        const FIRMA_X = width-75;
        const CEDULA = "# Cédula Profesional";
        const NAME = "Nombre del médico";
        const FIRMA = "Firma";
        page.drawText(CEDULA,{y:TABLE_HEADER_Y, x:CEDULA_X, size:12, font:helveticaBold, color:DARK_GRAY})    
        page.drawText(NAME,{y:TABLE_HEADER_Y, x:NAME_X, size:12, font:helveticaBold, color:DARK_GRAY})    
        page.drawText(FIRMA,{y:TABLE_HEADER_Y, x:FIRMA_X, size:12, font:helveticaBold, color:DARK_GRAY})  
        page.drawLine({
            start: { x: 41, y: height-190 },
            end: { x: width-38, y:height-190},
            color: BLACK_GARY
        })    

        return page;
    }


    async setPdf(attendeesId:number, pdf_path:string){
        const result = await this.knex.table(this.TABLE).update({pdf_path}).where({id:attendeesId})
        return result;
    }

    async fillPDFFisrtPart(questions,doctor_name:string, event){
        const RUTA = "./pdf/nordisk.pdf";
        //carga el archivo
        const pdfDoc = await PDFDocument.load(fs.readFileSync(RUTA));
        const pages = pdfDoc.getPages();
        const page = pages[0];

        //carga los campos llenables
        const form = pdfDoc.getForm()

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
        

        let nameField = form.getTextField(NAME);
        nameField.setText(doctor_name);
        
        let eventnameField = form.getTextField(EVENT);
        eventnameField.setText(event[0].name);

        let dateField = form.getTextField(EVENT_DATE);
        dateField.setText(moment(event[0].event_date).format("DD-MM-YYYY"));

        if(questions.question2){
            let question1yesField = form.getCheckBox(QUESTION_1_YES);
            question1yesField.check();
        }else{
            let question1noField = form.getCheckBox(QUESTION_1_NO);
            question1noField.check();
        }

        if(questions.question1){
            let question2yesField = form.getCheckBox(QUESTION_2_YES);
            question2yesField.check();
        }else{
            let question2noField = form.getCheckBox(QUESTION_2_NO);
            question2noField.check();
        }

        if(questions.explication){
            let explanationField = form.getTextField(EXPLANATION);
            explanationField.setText(questions.explication)
        }

        if(questions.question2){
            let publicField = form.getTextField(PUBLIC_ENTITY);
            publicField.setText(questions.institutionName)

            let representativeField = form.getTextField(REPRESENTATIVE);
            representativeField.setText(questions.nameAndTitle)

            
        }
        let eventname2Field = form.getTextField(EVENT_NAME_2);
        eventname2Field.setText(event[0].name);

        let date2Field = form.getTextField(DATE);
        date2Field.setText(moment().format("DD-MM-YYYY"));

        //let signatureFild = form.getSignature(SIGNATURE);
        
        const pdf_name = new Date().getTime();
        const pdfBytes = await pdfDoc.save();
        let path_result = `./pdf/${pdf_name}${doctor_name.substr(0,2).toUpperCase()}${event[0].name.substr(0,2).toUpperCase()}.pdf`
        fs.writeFileSync(path_result, pdfBytes);
        return path.resolve(path_result)
    }

    async signPdf(pdf_path, pdf_signature){
        const pdfDoc = await PDFDocument.load(fs.readFileSync(pdf_path));
        const pages = pdfDoc.getPages();
        const page = pages[0];
        const form = pdfDoc.getForm()

        const SIGNATURE = "Campo de firma 1";
        let img = fs.readFileSync(pdf_signature);
        const isJPG = pdf_signature.split(".")[pdf_signature.split('.').length-1];
        
        let imgEmbed = isJPG == "jpg"  ?  await pdfDoc.embedJpg(img):await pdfDoc.embedPng(img)  ;
        const { width, height } = page.getSize();
        page.drawImage(imgEmbed, {
            x: width-274,
            y: height-height+73,
            width:238,
            height:67
        });

        const signatureForm = form.getSignature(SIGNATURE);
        signatureForm.disableExporting()
        signatureForm.disableRequired()
        signatureForm.enableReadOnly()
        fs.writeFileSync(pdf_path, await pdfDoc.save());
        return true

    }
}

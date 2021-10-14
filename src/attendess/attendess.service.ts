import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import * as moment from 'moment';
import * as fs from 'fs';
import * as path from 'path';
import { degrees, PDFNumber } from 'pdf-lib';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { EventsService } from '../events/events.service';
import { AttendeesCreateDto } from './DTO/attendees-create.dto';
import { AttendeesListDto } from './DTO/attendees-list.dto';
import { AttendeesPaginationDto } from './DTO/attendees-pagination.dto';
import { AttendanceSignature } from './DTO/attendance-signature.dto';
import { METHOD, DOMAIN, PORT } from '../config';

@Injectable()
export class AttendessService {
  private TABLE = 'attendees';
  constructor(
    @InjectKnex() private knex: Knex,
    @Inject(forwardRef(() => EventsService))
    private eventService: EventsService,
  ) {}

  async create(attendees) {
    const attendee = await this.knex.table(this.TABLE).insert(attendees);
    return attendee;
  }

  async createTemporal(attendees) {
    const attendee = await this.knex
      .table('temporal_attendees')
      .insert(attendees);
    return attendee;
  }
  async updateTemporal(attendees, id) {
    await this.knex.table('temporal_attendees').delete().where({ id });
    const attendee = await this.knex
      .table('temporal_attendees')
      .insert({ id, ...attendees });
    return attendee;
  }

  prepareSignatures(event_dates) {
    let result = [];
    for (let date of event_dates) {
      result.push({
        event_date: date.event_date || '',
        download_signature: `${METHOD}://${DOMAIN}/attendees/signature/${date.id}`,
      });
    }
    return result;
  }
  async getEventDateEventAndAttendees(event_id: number, attendess_id: number) {
    const event_dates = await this.knex
      .table('attendees_sign')
      .where({ attendees_id: attendess_id, event_id, is_deleted: 0 });
    return event_dates;
  }
  async findByEvent(eventId: number, pagination: AttendeesPaginationDto) {
    let page = parseInt(pagination.page);
    let limit = parseInt(pagination.page_size);
    const offset = page == 1 ? 0 : (page - 1) * limit;

    const attendees = await this.knex
      .select(
        `${this.TABLE}.id`,
        `${this.TABLE}.cedula`,
        `${this.TABLE}.name`,
        `${this.TABLE}.speciality`,
        `${this.TABLE}.register_type`,
        `${this.TABLE}.speciality`,
        `${this.TABLE}.email`,
        `${this.TABLE}.idengage`,
      )
      .table(this.TABLE)
      .limit(limit)
      .offset(offset)
      .where('attendees.event_id', '=', eventId)
      .andWhere({ is_deleted: 0 });

    let result = [];
    for (let item of attendees) {
      let event_dates = await this.getEventDateEventAndAttendees(
        eventId,
        item.id,
      );
      let signatures = this.prepareSignatures(event_dates);

      let info = new AttendeesListDto();
      (info.cedula = item.cedula || 'sin cédula'), (info.name = `${item.name}`);
      info.download_signature = signatures; //`${METHOD}://${DOMAIN}/attendees/signature/${item.id}`;
      info.id = item.id;
      info.register_type = item.register_type;
      info.speciality = item.speciality;
      info.email = item.email || '';
      info.idengage = item.register_type != 'excel' ? '' : item.idengage;
      let id_string = `00${item.id}`;
      info.id_to_display =
        item.id < 1000
          ? id_string.substr(id_string.length - 3, id_string.length)
          : item.id;
      result.push(info);
    }

    return result;
  }

  async findByid(id: number) {
    const attendees = await this.knex
      .table(this.TABLE)
      .where({ is_deleted: 0 })
      .andWhere({ id });
    return attendees;
  }

  async totalPages(pagination: AttendeesPaginationDto, eventId: number) {
    const limit = parseInt(pagination.page_size);
    const count = await this.knex
      .table(this.TABLE)
      .count('id', { as: 'total' })
      .where({ is_deleted: 0 })
      .andWhere({ event_id: eventId });
    const total = count[0].total;
    //@ts-ignore
    let module = total % limit;
    //@ts-ignore
    let div = Math.floor(total / limit);
    let pages = div + (module > 0 ? 1 : 0);
    return { pages, total };
  }

  async getById(id: number) {
    const attendees = await this.knex
      .table(this.TABLE)
      .where({ is_deleted: 0 })
      .andWhere({ id });
    return attendees;
  }
  async getTempoalById(id: number) {
    const attendees = await this.knex
      .table('temporal_attendees')
      .where({ is_deleted: 0 })
      .andWhere({ id });
    return attendees;
  }

  async findAttendessByEvent(eventId: number) {
    const attendees = await this.knex
      .table(this.TABLE)
      .where('attendees.event_id', '=', eventId)
      .andWhere({ is_deleted: 0 });

    return attendees;
  }

  async preparePDF(
    event_name: string,
    event_id: number,
    address: string,
    sede: string,
  ) {
    const RUTA = './pdf/Formato_asistencia_template008.pdf';
    const pdfDoc = await PDFDocument.load(fs.readFileSync(RUTA));
    //carga el archivo
    const pages = pdfDoc.getPages();
    let page = pages[0];
    //let page = pdfDoc.addPage();
    //page.setRotation(degrees(90))

    const { width, height } = page.getSize();
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const RGB_PARSE = 1 / 255;
    const DARK_BLUE = rgb(RGB_PARSE * 0, RGB_PARSE * 25, RGB_PARSE * 101);
    const AEA99F = rgb(RGB_PARSE * 174, RGB_PARSE * 169, RGB_PARSE * 159);

    const WIDTH = width - width;
    const HEIGHT = height;
    let event_dates = await this.eventService.getEventDates(event_id);
    event_dates = event_dates
      .sort((a, b) => moment(a).diff(moment(b)))
      .map((e, i) => {
        if (i < 3) {
          return moment(e).format('DD-MM-YYYY');
        }
      })
      .filter((e) => e);
    const DATE = event_dates.join(', '); //moment().format('DD-MM-YYYY');
    const EVENT_NAME = event_name;
    const ADDRESS = address;
    const SEDE = sede;
    page.drawText(DATE, {
      x: WIDTH + 50,
      y: HEIGHT - 60,
      size: 10,
      maxWidth: 400,
      font: helvetica,
      color: AEA99F,
    });

    // NOMBRE DEL EVENTO
    page.drawText(EVENT_NAME, {
      x: WIDTH + 50,
      y: HEIGHT - 80,
      size: 12,
      maxWidth: 507,
      font: helveticaBold,
      color: DARK_BLUE,
    });

    page.drawText(ADDRESS, {
      x: WIDTH + 50,
      y: HEIGHT - 120,
      size: 10,
      maxWidth: 507,
      font: helvetica,
      color: DARK_BLUE,
    });

    page.drawText(SEDE, {
      x: WIDTH + 50,
      y: HEIGHT - 135,
      size: 10,
      maxWidth: 507,
      font: helvetica,
      color: DARK_BLUE,
    });

    const pdf_signature = path.resolve(__dirname, '../../defaults/logo.png');
    console.log(pdf_signature);
    let img = fs.readFileSync(pdf_signature);

    let imgEmbed = await pdfDoc.embedPng(img);
    const WHITE = rgb(RGB_PARSE * 255, RGB_PARSE * 255, RGB_PARSE * 255);
    //const DARK_BLUE = rgb(RGB_PARSE * 0, RGB_PARSE * 25, RGB_PARSE * 101);
    page.drawRectangle({
      y: WIDTH + 533,
      x: HEIGHT + 55,
      color: WHITE,
      //size: 40,
      width: 100,
      height: 60,
    });
    page.drawImage(imgEmbed, {
      x: WIDTH + 687,
      y: HEIGHT - 80,
      width: 70,
      height: 60,
    });

    return pdfDoc;
  }

  async setPdf(attendeesId: number, pdf_path: string, modified_by: number) {
    const result = await this.knex
      .table(this.TABLE)
      .update({ pdf_path, modified_by })
      .where({ id: attendeesId });
    return result;
  }

  async setTemporalPdf(
    attendeesId: number,
    pdf_path: string,
    modified_by: number,
  ) {
    const result = await this.knex
      .table('temporal_attendees')
      .update({ pdf_path, modified_by })
      .where({ id: attendeesId });
    return result;
  }

  async setSinature(attendeesId: number, path: string, modified_by: number) {
    const result = await this.knex
      .table(this.TABLE)
      .update({ path, modified_by })
      .where({ id: attendeesId });
    return result;
  }
  async setconfirmSinature(
    attendeesId: number,
    path: string,
    modified_by: number,
  ) {
    const result = await this.knex
      .table(this.TABLE)
      .update({ confirm_signature: path, modified_by })
      .where({ id: attendeesId });
    return result;
  }
  async fillPDFFisrtPart(questions, doctor_name: string, event, currentEvent) {
    const RUTA = './pdf/new_template.pdf';
    //carga el archivo
    const pdfDoc = await PDFDocument.load(fs.readFileSync(RUTA));
    const pages = pdfDoc.getPages();
    const page = pages[0];

    //carga los campos llenables
    const form = pdfDoc.getForm();

    const NAME = 'Campo de texto 2';
    const ID_ONE_KEY = 'Campo de texto 3';
    const EVENT = 'Campo de texto 4';
    const EVENT_DATE = 'Campo de texto 5';
    const QUESTION_1_YES = 'Casilla de verificación 1';
    const QUESTION_1_NO = 'Casilla de verificación 2';
    const QUESTION_2_YES = 'Casilla de verificación 3';
    const QUESTION_2_NO = 'Casilla de verificación 4';
    const EXPLANATION = 'Campo de texto 6';
    const PUBLIC_ENTITY = 'Campo de texto 7';
    const REPRESENTATIVE = 'Campo de texto 8';
    const EVENT_NAME_2 = 'Campo de texto 9';
    const DATE = 'Campo de texto 10';

    let nameField = form.getTextField(NAME);
    nameField.setText(doctor_name);

    let engageField = form.getTextField(ID_ONE_KEY);
    engageField.setText(questions.idengage);

    let eventnameField = form.getTextField(EVENT);
    eventnameField.setText(event[0].name);

    let dateField = form.getTextField(EVENT_DATE);
    let event_dates = await this.eventService.getEventDates(
      currentEvent.event_id,
    );

    event_dates = event_dates
      .sort((a, b) => moment(a).diff(moment(b)))
      .map((e, i) => {
        if (i < 3) {
          return moment(e).format('DD-MM-YYYY');
        }
      })
      .filter((e) => e);
    const date = event_dates.join(', '); //moment().format('DD-MM-YYYY');

    //dateField.setText(moment(currentEvent.event_date).format('DD-MM-YYYY'));
    dateField.setText(date);

    if (questions.question2.toLowerCase() == 'true') {
      let question1yesField = form.getCheckBox(QUESTION_1_YES);
      question1yesField.check();
    } else {
      let question1noField = form.getCheckBox(QUESTION_1_NO);
      question1noField.check();
    }

    if (questions.question1.toLowerCase() == 'true') {
      let question2yesField = form.getCheckBox(QUESTION_2_YES);
      question2yesField.check();
    } else {
      let question2noField = form.getCheckBox(QUESTION_2_NO);
      question2noField.check();
    }

    if (questions.question1.toLowerCase() == 'true') {
      let publicField = form.getTextField(PUBLIC_ENTITY);
      publicField.setText(questions.institutionName);

      let representativeField = form.getTextField(REPRESENTATIVE);
      representativeField.setText(questions.nameAndTitle);
    }
    if (questions.question2.toLowerCase() == 'true') {
      let eventname2Field = form.getTextField(EVENT_NAME_2);
      eventname2Field.setText(event[0].name);
    }

    let date2Field = form.getTextField(DATE);
    date2Field.setText(moment().format('DD-MM-YYYY'));

    //let signatureFild = form.getSignature(SIGNATURE);

    const pdf_name = new Date().getTime();
    const pdfBytes = await pdfDoc.save();
    let path_result = `./pdf/${pdf_name}${doctor_name
      .substr(0, 2)
      .toUpperCase()}${event[0].name.substr(0, 2).toUpperCase()}.pdf`;
    fs.writeFileSync(path_result, pdfBytes);
    return path.resolve(path_result);
  }

  async signPdf(pdf_path, pdf_signature) {
    const pdfDoc = await PDFDocument.load(fs.readFileSync(pdf_path));
    const pages = pdfDoc.getPages();
    const page = pages[0];
    const form = pdfDoc.getForm();

    const SIGNATURE = 'Campo de firma 1';
    let img = fs.readFileSync(pdf_signature);
    const isJPG = pdf_signature.split('.')[pdf_signature.split('.').length - 1];

    let imgEmbed =
      isJPG == 'jpg' ? await pdfDoc.embedJpg(img) : await pdfDoc.embedPng(img);
    const { width, height } = page.getSize();
    page.drawImage(imgEmbed, {
      x: width - 274,
      y: height - height + 87,
      width: 238,
      height: 67,
    });

    const signatureForm = form.getSignature(SIGNATURE);
    signatureForm.disableExporting();
    signatureForm.disableRequired();
    signatureForm.enableReadOnly();
    fs.writeFileSync(pdf_path, await pdfDoc.save());
    return true;
  }

  async pdfBundle(data, path) {
    const pdfDoc = await PDFDocument.create();
    for (let item of data) {
      if (item.pdf_path) {
        const pdf = await PDFDocument.load(fs.readFileSync(item.pdf_path));
        pdf.getForm().flatten();
        const [page] = await pdfDoc.copyPages(pdf, [0]);
        pdfDoc.addPage(page);
      }
    }

    fs.writeFileSync(path, await pdfDoc.save());
  }

  async findTotalAttendeesByEvent(eventId: number) {
    const total = await this.knex
      .table(this.TABLE)
      .count('id as total')
      .where({ event_id: eventId })
      .andWhere({ is_deleted: 0 });
    //@ts-ignore
    return total[0].total;
  }

  async findByYear(year: string) {
    const DATE = moment(year).format('YYYY-MM-DD');
    let FINAL_YEAR = moment(year).endOf('year');
    let FINAL = moment(FINAL_YEAR).format('YYYY-MM-DD');

    /*const attendees = await this.knex
        .table(this.TABLE)
        .select('events.event_date',`${this.TABLE}.speciality`)
        .innerJoin('events',`${this.TABLE}.event_id`,'events.id')
        .where('events.event_date','>=',DATE)
        .andWhere('events.event_date','<=', FINAL)
        .andWhere('events.is_deleted','=',0).andWhere(`${this.TABLE}.is_deleted`,'=',0)*/

    const attendees = await this.knex
      .table(this.TABLE)
      .select(
        'events_date.event_date',
        `${this.TABLE}.speciality`,
        this.knex.raw("ifnull(attendees.brand,'')  AS brand"),
      )
      .innerJoin(
        'events_date',
        `${this.TABLE}.event_id`,
        'events_date.event_id',
      )
      .where('events_date.event_date', '>=', DATE)
      .andWhere('events_date.event_date', '<=', FINAL)
      .andWhere('events_date.is_deleted', '=', 0)
      .andWhere(`${this.TABLE}.is_deleted`, '=', 0)
      .groupBy('attendees.id');

    return attendees;
  }

  async isAlreadyRegistered(cedula: number, eventId: number) {
    const result = await this.knex
      .table(this.TABLE)
      .where({ cedula })
      .andWhere({ event_id: eventId })
      .andWhere({ is_deleted: 0 });
    return result;
  }

  async saveAttendanceSignature(data: AttendanceSignature) {
    const signature = await this.knex.table('attendees_sign').insert(data);
    return signature;
  }

  async findByCedula(cedula: number, event_id: number) {
    const attendees = await this.knex.table(this.TABLE).where({
      is_deleted: 0,
      cedula,
      event_id,
    });
    return attendees;
  }

  async getEventDate(event_id: number) {
    const event = await this.getById(event_id);
  }

  async findAttendanceSignature(
    event_id: number,
    event_date,
    attendees_id: number,
  ) {
    const aSignature = await this.knex
      .table('attendees_sign')
      .where({ event_id, event_date, attendees_id, is_deleted: 0 });

    return aSignature;
  }
  async getAttendeesSignById(id: number) {
    const sign = await this.knex.table('attendees_sign').where({ id });
    return sign;
  }

  async getAttendeesSignByEventAndAttendee(
    event_id: number,
    attendees_id: number,
  ) {
    const sign = await this.knex
      .table('attendees_sign')
      .where({ event_id, attendees_id, is_deleted: 0 });
    return sign;
  }

  async findAll() {
    const attendees = await this.knex
      .select(this.knex.raw(`attendees.*`))
      .table(this.TABLE)
      .innerJoin('events', 'attendees.event_id', 'events.id')
      .where('events.is_deleted', '=', 0)
      .andWhere('attendees.is_deleted', '=', 0);
    return attendees;
  }
}

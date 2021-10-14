import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Response,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiExcludeEndpoint } from '@nestjs/swagger';
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
import { LogDto } from '../commons/DTO';
import { AttendeesCreateDto } from './DTO/attendees-create.dto';
import { AttendeesInfoDto } from './DTO/attendees-info.dto';
import { AttendeesResponseDto } from './DTO/attendees-response.dto';
import { AttendeesPaginationDto } from './DTO/attendees-pagination.dto';
import { AttendeesDetailDto } from './DTO/attendees-detail.dto';
import { AttendeesItemDto } from './DTO/attendess-item.dto';
import { AttendeesCreateResponseDto } from './DTO/attendees-create-response.dto';
import { Excel } from '../commons/build-excel/excel';
import { AttendeesEmailDto } from './DTO/attendees-email.dto';
import { AttendeesTemporalDto } from './DTO/attendees-temporal.dto';
import { attendanceResponse } from './DTO/attendance-response.dto';
import {
  AttendeesCreateDecorator,
  AttendeesListPdfDecorator,
  AttendeesListExcelDecorator,
  AttendeesAllPdfDecorator,
  AttendeesContractDecorator,
  AttendeesSignDecorator,
  AttendeesSignatureDecorator,
  AttendeesDetailDecorator,
  AttendeesEventsDecorator,
  AttendeesEmailDecorator,
  AttendeesConfirmSignDecorator,
  AttendeesTemporalDecorator,
  AttendanceSignatureDecorator,
} from './decorators';

import { METHOD, DOMAIN, STATICS_SIGNATURES } from '../config';

@ApiTags('Attendees')
@Controller('attendees')
export class AttendessController {
  private TABLE = 'attendees';
  constructor(
    private attendessService: AttendessService,
    private logService: LogServices,
    private eventService: EventsService,
    private emailService: EmailServices,
  ) {}

  @Post()
  @ApiExcludeEndpoint()
  @AttendeesCreateDecorator()
  async create(@Body() attendees: AttendeesCreateDto, @User() session) {
    //if(!signature) throw new HttpException("The signature field is mandatory", 417)
    const eventExist = await this.eventService.findById(attendees.eventId);
    if (!eventExist.length)
      throw new HttpException('EVENT NOT FOUND', HttpStatus.NOT_FOUND);

    const isAlreadyRegistered = await this.attendessService.isAlreadyRegistered(
      attendees.cedula,
      attendees.eventId,
    );
    if (isAlreadyRegistered.length)
      throw new HttpException('User already registered', HttpStatus.CONFLICT);

    let questions = {
      question1: attendees.question1,
      question2: attendees.question2,
      question3: attendees.question3,
      typeOfInstitution: attendees.typeOfInstitution,
      institutionName: attendees.institutionName,
      nameAndTitle: attendees.nameAndTitle,
      authorization: attendees.authorization,
      idengage: attendees.idengage,
    };
    let schema = Object.assign(
      {},
      {
        cedula: attendees.cedula,
        name: `${attendees.name} ${attendees.lastname}`,
        firstname: attendees.name,
        lastname: attendees.lastname,
        speciality: attendees.speciality,
        email: attendees.email,
        created_by: session.id,
        modified_by: session.id,
        event_id: attendees.eventId,
        register_type: attendees.register_type,
        idengage: attendees.idengage,
        questions: JSON.stringify(questions),
      },
    );

    const newAttendees = await this.attendessService.create(schema);
    const event_dates = await this.eventService.getEventDatesByEvent(
      attendees.eventId,
    );
    const currentEvent = await this.eventService.getCurrentEvent(event_dates);
    const increment = await this.eventService.incrementAttendees(
      attendees.eventId,
      session.id,
    );
    const pdf = await this.attendessService.fillPDFFisrtPart(
      questions,
      attendees.name,
      eventExist,
      currentEvent,
    );
    const updated = await this.attendessService.setPdf(
      newAttendees[0],
      pdf,
      session.id,
    );

    /** CREATE LOG */
    let log = new LogDto();
    log.new_change = 'create';
    log.type = 'create';
    log.element = newAttendees[0];
    log.db_table = this.TABLE;
    log.created_by = session.id;
    log.modified_by = session.id;
    await this.logService.createLog(log);

    /** CREATE LOG EVENTS - INCREMENT ASSISTANTS */
    log.new_change = 'update';
    log.type = 'update';
    log.element = updated;
    log.db_table = 'events';
    log.created_by = session.id;
    log.modified_by = session.id;
    await this.logService.createLog(log);

    let response = new AttendeesCreateResponseDto();
    response.id = newAttendees[0];
    response.path = `${METHOD}://${DOMAIN}/attendees/contract/${newAttendees[0]}`;

    return response;
  }

  @Post('/temporal')
  @AttendeesTemporalDecorator()
  @UseInterceptors(
    FileInterceptor('signature', {
      storage: diskStorage({
        destination: path.join(__dirname, STATICS_SIGNATURES), //Si esta ruta presenta agun error remplazarla por ./images
        filename: (req, file, callback) => {
          const name = new Date().getTime();
          callback(null, `${name}_${file.originalname}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const authorized = new Set(['image/png', 'image/jpeg', 'image/gif']);
        if (authorized.has(file.mimetype)) return callback(null, true);
        callback(
          new HttpException('Only image are allowed jpg/png/gif', 413),
          false,
        );
      },
    }),
  )
  async createTemporal(
    @UploadedFile() signature,
    @Body() attendees: AttendeesTemporalDto,
    @User() session,
  ) {
    if (!signature)
      throw new HttpException('The signature field is mandatory', 417);
    const eventExist = await this.eventService.findById(
      parseInt(attendees.eventId),
    );

    if (!eventExist.length)
      throw new HttpException('EVENT NOT FOUND', HttpStatus.NOT_FOUND);
    const event_dates = await this.eventService.getEventDatesByEvent(
      parseInt(attendees.eventId),
    );
    const currentEvent = await this.eventService.getCurrentEvent(event_dates);
    if (!currentEvent) throw new HttpException('EVENT OUT OF TIME', 423);

    const IS_HOUR_END_BEFORE_CURRENTTIME = moment(
      eventExist[0].hour_end,
      'HH:mm',
    ).isBefore(moment(moment().format('HH'), 'HH:mm'));
    const IS_HOUR_INIT_AFTER_CURRENTTIME = moment(
      eventExist[0].hour_init,
      'HH',
    ).isAfter(moment(moment().format('HH'), 'HH:mm'));
    const EVENT_DATE_IS_BEFORE_CURRENT_DATE = moment(
      currentEvent.event_date,
    ).isBefore(moment(moment().format('YYYY-MM-DD')));
    if (EVENT_DATE_IS_BEFORE_CURRENT_DATE)
      throw new HttpException('EVENT OUT OF TIME', 423);
    /** VALIDACIONES SOBRE LAS HORAS */
    if (IS_HOUR_END_BEFORE_CURRENTTIME)
      throw new HttpException('EVENT OUT OF TIME', 423);
    if (IS_HOUR_INIT_AFTER_CURRENTTIME)
      throw new HttpException('EVENT OUT OF TIME', 423);
    /** VALIDACIONES SOBRE LAS HORAS */

    let questions = {
      question1: attendees.question1,
      question2: attendees.question2,
      question3: attendees.question3,
      //typeOfInstitution: attendees.typeOfInstitution,
      institutionName: attendees.institutionName,
      nameAndTitle: attendees.nameAndTitle,
      authorization: attendees.authorization,
      idengage: attendees.idengage,
    };
    let schema = Object.assign(
      {},
      {
        cedula: parseInt(attendees.cedula),
        name: `${attendees.name} ${attendees.lastname}`,
        firstname: attendees.name,
        lastname: attendees.lastname,
        speciality: attendees.speciality,
        email: attendees.email,
        created_by: session.id,
        modified_by: session.id,
        event_id: parseInt(attendees.eventId),
        register_type: attendees.register_type,
        idengage: attendees.idengage,
        questions: JSON.stringify(questions),
        confirm_signature: signature.path,
        brand: eventExist[0].brand,
      },
    );

    const newAttendees = !attendees.id
      ? await this.attendessService.createTemporal(schema)
      : await this.attendessService.updateTemporal(
          schema,
          parseInt(attendees.id),
        );

    const pdf = await this.attendessService.fillPDFFisrtPart(
      questions,
      `${attendees.name} ${attendees.lastname}`,
      eventExist,
      currentEvent,
    );
    const updated = await this.attendessService.setTemporalPdf(
      newAttendees[0],
      pdf,
      session.id,
    );

    let response = new AttendeesCreateResponseDto();
    response.id = newAttendees[0];
    response.path = `${METHOD}://${DOMAIN}/attendees/contract-temporal/${newAttendees[0]}`;

    return response;
  }

  @Get('/assists/list/:eventId')
  @AttendeesListPdfDecorator()
  async buildPdf(@Response() res, @Param() eventId: AttendeesInfoDto) {
    const existEvent = await this.eventService.findById(
      parseInt(eventId.eventId),
    );
    if (!existEvent.length)
      throw new HttpException('EVENT NOT FOUND', HttpStatus.NOT_FOUND);

    const pdfDoc = await PDFDocument.create();

    const array = await this.attendessService.findAttendessByEvent(
      parseInt(eventId.eventId),
    );
    if (!array.length)
      throw new HttpException('EVENT NOT FOUND', HttpStatus.NOT_FOUND);

    let result = [];

    for (let item of array) {
      const signatures = await this.attendessService.getAttendeesSignByEventAndAttendee(
        parseInt(eventId.eventId),
        item.id,
      );
      let id_string = `000${item.id}`;
      let info = {
        id: item.idengage,
        /*id:
          item.id < 1000
            ? id_string.substring(id_string.length - 3, id_string.length)
            : `${item.id}`,*/
        cedula: `${item.cedula || 'sin cédula'}`,
        name: `${item.name}`,
        signature: item.path,
        email: item.email,
        speciality: item.speciality,
        signatures,
      };
      result.push(info);
    }

    const arrayPage = [];
    const MAX_ROW_TO_DISPLAY = 12;
    let numberOfPages = Math.ceil(result.length / (MAX_ROW_TO_DISPLAY / 2));

    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const RGB_PARSE = 1 / 255;
    const LIGHT_BLUE = rgb(RGB_PARSE * 0, RGB_PARSE * 159, RGB_PARSE * 218);
    const DARK_BLUE = rgb(RGB_PARSE * 0, RGB_PARSE * 25, RGB_PARSE * 101);
    const AEA99F = rgb(RGB_PARSE * 174, RGB_PARSE * 169, RGB_PARSE * 159);
    const WHITE = rgb(RGB_PARSE * 255, RGB_PARSE * 255, RGB_PARSE * 255);

    let pagina = 1;
    let count_data = 0;
    const total_users = result.length;
    for (let i = 0; i < numberOfPages; i++) {
      if (count_data < total_users) {
        let preparedPDF = await this.attendessService.preparePDF(
          existEvent[0].name,
          existEvent[0].id,
          existEvent[0].address,
          existEvent[0].sede,
        );
        const [page] = await pdfDoc.copyPages(preparedPDF, [0]);

        const { width, height } = page.getSize();
        const TABLE_HEADER_Y = height - 123;
        const CEDULA_X = 110; //90;
        const NAME_X = 205; //200;
        const FIRMA_X = width - 75;
        const ID_X = 25; //50;
        const EMAIL_X = 370; //400
        const SPECIALITY_X = 530; //550
        let INIT_POSITION_Y = TABLE_HEADER_Y - 70;

        let current_row = 0;
        const Y_POSITIONS = [
          INIT_POSITION_Y + 7,
          INIT_POSITION_Y - 20,
          INIT_POSITION_Y - 50,
          INIT_POSITION_Y - 80,
          INIT_POSITION_Y - 107,
          INIT_POSITION_Y - 136,
          INIT_POSITION_Y - 167,
          INIT_POSITION_Y - 193,
          INIT_POSITION_Y - 222,
          INIT_POSITION_Y - 254,
          INIT_POSITION_Y - 280,
          INIT_POSITION_Y - 308,
          INIT_POSITION_Y - 339,
          INIT_POSITION_Y - 366,
          INIT_POSITION_Y - 394,
        ];
        let count = 0;
        //for (let item of result) {
        while (count_data < total_users) {
          try {
            page.drawText(result[count_data].id, {
              y: Y_POSITIONS[count],
              x: ID_X,
              size: 7,
              font: helveticaBold,
              color: LIGHT_BLUE,
            });
            page.drawText(result[count_data].cedula, {
              y: Y_POSITIONS[count],
              x: CEDULA_X,
              size: 8,
              font: helveticaBold,
              color: LIGHT_BLUE,
            });
            page.drawText(result[count_data].name, {
              y: Y_POSITIONS[count],
              x: NAME_X - 10,
              size: 7,
              maxWidth: 120, //160,
              lineHeight: 7,
              font: helveticaBold,
              color: DARK_BLUE,
            });
            page.drawText(result[count_data].email || '-----', {
              y: Y_POSITIONS[count],
              x: EMAIL_X - 20,
              maxWidth: 120,
              size: 7,
              font: helveticaBold,
              color: DARK_BLUE,
            });
            page.drawText(result[count_data].speciality, {
              y: Y_POSITIONS[count],
              x: SPECIALITY_X,
              maxWidth: 150,
              lineHeight: 7,
              size: 7,
              font: helveticaBold,
              color: DARK_BLUE,
            });
            if (result[count_data].signatures.length) {
              if (result[count_data].signatures[0]) {
                const SIGNATURE = fs.readFileSync(
                  result[count_data].signatures[0]['path_sign'],
                );
                let mimetype = result[count_data].signatures[0][
                  'path_sign'
                ].split('.');
                mimetype = mimetype[mimetype.length - 1];

                const EMBEDDED_SIGNATURE =
                  mimetype == 'jpg'
                    ? await pdfDoc.embedJpg(SIGNATURE)
                    : await pdfDoc.embedPng(SIGNATURE);

                page.drawImage(EMBEDDED_SIGNATURE, {
                  y: Y_POSITIONS[count] - 5,
                  x: FIRMA_X - 45,
                  width: 40,
                  height: 15,
                });
                const event_date = moment(
                  result[count_data].signatures[0]['event_date'],
                ).format('YYYY-MM-DD');
                page.drawText(event_date, {
                  y: Y_POSITIONS[count] - 11,
                  x: FIRMA_X - 45,
                  size: 7,
                  font: helveticaBold,
                  color: DARK_BLUE,
                });
              }
              if (result[count_data].signatures[1]) {
                const SIGNATURE = fs.readFileSync(
                  result[count_data].signatures[1]['path_sign'],
                );
                let mimetype = result[count_data].signatures[1][
                  'path_sign'
                ].split('.');
                mimetype = mimetype[mimetype.length - 1];

                const EMBEDDED_SIGNATURE =
                  mimetype == 'jpg'
                    ? await pdfDoc.embedJpg(SIGNATURE)
                    : await pdfDoc.embedPng(SIGNATURE);
                page.drawImage(EMBEDDED_SIGNATURE, {
                  y: Y_POSITIONS[count] - 5,
                  x: FIRMA_X + 10,
                  width: 40,
                  height: 15,
                });

                const event_date = moment(
                  result[count_data].signatures[1]['event_date'],
                ).format('YYYY-MM-DD');
                page.drawText(event_date, {
                  y: Y_POSITIONS[count] - 11,
                  x: FIRMA_X + 10,
                  size: 7,
                  font: helveticaBold,
                  color: DARK_BLUE,
                });
              }
              if (
                result[count_data].signatures[2] ||
                result[count_data].signatures[3]
              ) {
                count++;
                current_row++;
                if (count >= Y_POSITIONS.length) count = Y_POSITIONS.length - 1;
              }

              if (result[count_data].signatures[2]) {
                const SIGNATURE = fs.readFileSync(
                  result[count_data].signatures[2]['path_sign'],
                );
                let mimetype = result[count_data].signatures[2][
                  'path_sign'
                ].split('.');
                mimetype = mimetype[mimetype.length - 1];

                const EMBEDDED_SIGNATURE =
                  mimetype == 'jpg'
                    ? await pdfDoc.embedJpg(SIGNATURE)
                    : await pdfDoc.embedPng(SIGNATURE);

                page.drawImage(EMBEDDED_SIGNATURE, {
                  y: Y_POSITIONS[count] - 5,
                  x: FIRMA_X - 45,
                  width: 40,
                  height: 15,
                });

                const event_date = moment(
                  result[count_data].signatures[2]['event_date'],
                ).format('YYYY-MM-DD');
                console.log(`${Y_POSITIONS[count]} - ${count} - ${event_date}`);
                page.drawText(event_date, {
                  y: Y_POSITIONS[count] - 11,
                  x: FIRMA_X - 45,
                  size: 7,
                  font: helveticaBold,
                  color: DARK_BLUE,
                });
              }

              if (result[count_data].signatures[3]) {
                const SIGNATURE = fs.readFileSync(
                  result[count_data].signatures[3]['path_sign'],
                );
                let mimetype = result[count_data].signatures[3][
                  'path_sign'
                ].split('.');
                mimetype = mimetype[mimetype.length - 1];

                const EMBEDDED_SIGNATURE =
                  mimetype == 'jpg'
                    ? await pdfDoc.embedJpg(SIGNATURE)
                    : await pdfDoc.embedPng(SIGNATURE);
                page.drawImage(EMBEDDED_SIGNATURE, {
                  y: Y_POSITIONS[count] - 5,
                  x: FIRMA_X + 10,
                  width: 40,
                  height: 15,
                });

                const event_date = moment(
                  result[count_data].signatures[3]['event_date'],
                ).format('YYYY-MM-DD');
                page.drawText(event_date, {
                  y: Y_POSITIONS[count] - 11,
                  x: FIRMA_X + 10,
                  size: 7,
                  font: helveticaBold,
                  color: DARK_BLUE,
                });
              }
            }
            INIT_POSITION_Y -= 35;
            /**
             * Se le aplica un -1 al MAX_ROW_TO_DISPLAY ya que si el asistente tiene mas de 2 firmas
             * afecta el conteo natural de las rows
             */
            count_data++;
            if (current_row >= MAX_ROW_TO_DISPLAY - 1) {
              break;
            }
            current_row++;
          } catch (err) {
            console.log(err);
          }
          count++;
        }

        page.drawCircle({
          y: height - height + 25,
          x: width - 38,
          color: WHITE,
          size: 5,
        });
        page.drawText(`${pagina}/`, {
          y: height - height + 21,
          x: width - 40,
          size: 10,
          font: helveticaBold,
          color: AEA99F,
        });
        page.drawText(`${numberOfPages}`, {
          y: height - height + 21,
          x: width - 26,
          size: 10,
          font: helveticaBold,
          color: AEA99F,
        });
        pdfDoc.addPage(page);
        pagina++;
      }
    }
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('./pdf/lista_de_asistencia.pdf', pdfBytes);
    var file = fs.createReadStream('./pdf/lista_de_asistencia.pdf');
    var stat = fs.statSync('./pdf/lista_de_asistencia.pdf');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-type', 'application/pdf');
    res.setHeader(
      'Content-disposition',
      'inline; filename="' + 'lista_de_asistencia.pdf' + '"',
    );
    file.pipe(res);
    //res.download('./pdf/lista_de_asistencia.pdf');
    /*res.status(200).send({
      pdf: fs.readFileSync('./pdf/lista_de_asistencia.pdf', {
        encoding: 'base64',
      }),
    });*/
  }

  @Get('/assists/list-excel/:eventId')
  @AttendeesListExcelDecorator()
  async buildExcel(@Response() res, @Param() eventId: AttendeesInfoDto) {
    const existEvent = await this.eventService.findById(
      parseInt(eventId.eventId),
    );
    if (!existEvent.length)
      throw new HttpException('EVENT NOT FOUND', HttpStatus.NOT_FOUND);
    const array = await this.attendessService.findAttendessByEvent(
      parseInt(eventId.eventId),
    );
    if (!array.length)
      throw new HttpException('EVENT NOT FOUND', HttpStatus.NOT_FOUND);
    let dir = fs.readdirSync(path.join(__dirname, '../../excel'));
    /** DELETE OLD FILES */
    let isTemplate = 'plantilla_excel.xlsx';
    for (let file of dir) {
      if (isTemplate != file) {
        await fs.unlinkSync(path.join(__dirname, `../../excel/${file}`));
      }
    }
    /** OPEN EXCEL */
    let workbook = new Excel();
    const PATH = path.join(__dirname, '../../excel/plantilla_excel.xlsx');
    await workbook.openExcel(PATH);
    /** GET SHEET 1 */
    let SHEET = await workbook.getSheet(1);

    /** SET EVENT DATE */
    let event_dates = await this.eventService.getEventDates(
      parseInt(eventId.eventId),
    );
    event_dates = event_dates
      .sort((a, b) => moment(a).diff(moment(b)))
      .map((e, i) => {
        if (i < 3) {
          return moment(e).format('DD-MM-YYYY');
        }
      })
      .filter((e) => e);
    const DATE = event_dates.join(', ');
    let EVENT_DATE_ROW = workbook.getRow(2, SHEET);
    let EVENT_DATE_CELL = workbook.getCell(1, EVENT_DATE_ROW);
    workbook.setValue(EVENT_DATE_CELL, DATE);
    workbook.saveChanges(EVENT_DATE_ROW);

    /** SET EVENT NAME */
    const EVENT_NAME_ROW = workbook.getRow(4, SHEET);
    const EVENT_NAME_CELL = workbook.getCell(1, EVENT_NAME_ROW);
    workbook.setValue(EVENT_NAME_CELL, existEvent[0].name);
    workbook.saveChanges(EVENT_NAME_ROW);

    /** SET ADDRESS */
    const ADDRESS_ROW = workbook.getRow(5, SHEET);
    const ADDRESS_CELL = workbook.getCell(1, ADDRESS_ROW);
    workbook.setValue(ADDRESS_CELL, existEvent[0].address || '');
    workbook.saveChanges(ADDRESS_ROW);

    /** SET SEDE */
    const SEDE_ROW = workbook.getRow(5, SHEET);
    const SEDE_CELL = workbook.getCell(1, SEDE_ROW);
    workbook.setValue(SEDE_CELL, existEvent[0].sede || '');
    workbook.saveChanges(SEDE_ROW);

    /** BUILD INFORMATION */
    let INITIAL_ROW = 9;
    for (let item of array) {
      const signatures = await this.attendessService.getAttendeesSignByEventAndAttendee(
        parseInt(eventId.eventId),
        item.id,
      );
      /** ID SECTION */
      const ID_CELL_POSITION = 1;
      const ID_ROW = workbook.getRow(INITIAL_ROW, SHEET);
      const ID_CELL = workbook.getCell(ID_CELL_POSITION, ID_ROW);
      let id_string = `000${item.id}`;
      let id_to_display = item.idengage;
      /*item.id < 1000
          ? id_string.substring(id_string.length - 3, id_string.length)
          : `${item.id}`;*/
      workbook.setValue(ID_CELL, id_to_display);
      workbook.setColor('009FDA', ID_CELL);
      workbook.saveChanges(ID_ROW);

      /** CEDULA SECTION */
      const CEDULA_CELL_POSITION = 2;
      const CEDULA_ROW = workbook.getRow(INITIAL_ROW, SHEET);
      const CEDULA_CELL = workbook.getCell(CEDULA_CELL_POSITION, CEDULA_ROW);
      workbook.setValue(CEDULA_CELL, item.cedula || 'sin cédula' );
      workbook.setColor('009FDA', CEDULA_CELL);
      workbook.saveChanges(CEDULA_ROW);

      /** SECTION DOCTOR'S NAME  */
      const DOCTOR_NAME_CELL_POISITION = 3;
      const DOCTOR_NAME_ROW = workbook.getRow(INITIAL_ROW, SHEET);
      const DOCTOR_NAME_CELL = workbook.getCell(
        DOCTOR_NAME_CELL_POISITION,
        DOCTOR_NAME_ROW,
      );
      workbook.setValue(DOCTOR_NAME_CELL, item.name);
      workbook.setColor('001965', DOCTOR_NAME_CELL);
      workbook.saveChanges(DOCTOR_NAME_ROW);

      /** EMAIL SECTION  */
      const EMAIL_CELL_POSITION = 4;
      const EMAIL_ROW = workbook.getRow(INITIAL_ROW, SHEET);
      const EMAIL_CELL = workbook.getCell(EMAIL_CELL_POSITION, EMAIL_ROW);
      workbook.setValue(EMAIL_CELL, item.email || '-----');
      workbook.setColor('001965', EMAIL_CELL);
      workbook.saveChanges(EMAIL_ROW);

      /** SPECIALITY SECTION */
      const SPECIALITY_CELL_POSITION = 5;
      const SPECILAITY_ROW = workbook.getRow(INITIAL_ROW, SHEET);
      const SPECIALITY_CELL = workbook.getCell(
        SPECIALITY_CELL_POSITION,
        SPECILAITY_ROW,
      );
      workbook.setValue(SPECIALITY_CELL, item.speciality);
      workbook.setColor('001965', SPECIALITY_CELL);
      workbook.saveChanges(SPECILAITY_ROW);

      /** SIGNATURE SECTION  */
      if (signatures.length) {
        const SIGNATURE_ROW = workbook.getRow(INITIAL_ROW, SHEET);
        SIGNATURE_ROW.height = 25;

        if (signatures[0]) {
          const SINGATURE_CELL_POSITION = 6;
          await workbook.addImage(
            signatures[0].path_sign,
            SHEET,
            INITIAL_ROW,
            SINGATURE_CELL_POSITION,
          );
          const SIGNATURE_CELL = workbook.getCell(
            SINGATURE_CELL_POSITION,
            SIGNATURE_ROW,
          );
          const event_date = moment(signatures[0]['event_date']).format(
            'YYYY-MM-DD',
          );
          workbook.setValue(SIGNATURE_CELL, event_date);
        }
        if (signatures[1]) {
          const SINGATURE_CELL_POSITION = 7;
          await workbook.addImage(
            signatures[1].path_sign,
            SHEET,
            INITIAL_ROW,
            SINGATURE_CELL_POSITION,
          );

          const SIGNATURE_CELL = workbook.getCell(
            SINGATURE_CELL_POSITION,
            SIGNATURE_ROW,
          );
          const event_date = moment(signatures[1]['event_date']).format(
            'YYYY-MM-DD',
          );
          workbook.setValue(SIGNATURE_CELL, event_date);
        }
        if (signatures[2]) {
          const SINGATURE_CELL_POSITION = 8;
          await workbook.addImage(
            signatures[2].path_sign,
            SHEET,
            INITIAL_ROW,
            SINGATURE_CELL_POSITION,
          );

          const SIGNATURE_CELL = workbook.getCell(
            SINGATURE_CELL_POSITION,
            SIGNATURE_ROW,
          );
          const event_date = moment(signatures[2]['event_date']).format(
            'YYYY-MM-DD',
          );
          workbook.setValue(SIGNATURE_CELL, event_date);
        }
        if (signatures[3]) {
          const SINGATURE_CELL_POSITION = 9;
          await workbook.addImage(
            signatures[3].path_sign,
            SHEET,
            INITIAL_ROW,
            SINGATURE_CELL_POSITION,
          );

          const SIGNATURE_CELL = workbook.getCell(
            SINGATURE_CELL_POSITION,
            SIGNATURE_ROW,
          );
          const event_date = moment(signatures[3]['event_date']).format(
            'YYYY-MM-DD',
          );
          workbook.setValue(SIGNATURE_CELL, event_date);
        }
        workbook.saveChanges(SIGNATURE_ROW);
      }

      INITIAL_ROW++;
    }
    /** WRITE FINAL EXCEL */
    let name = `${new Date().getTime()}${existEvent[0].name.substr(0, 2)}${
      existEvent[0].id
    }`;
    const PATH_NEW_EXCEL = path.join(__dirname, `../../excel/${name}.xlsx`);
    await workbook.writeFile(PATH_NEW_EXCEL);
    res.download(PATH_NEW_EXCEL);
    //res.send('HECHO');
  }

  @Get('/img-template')
  @ApiExcludeEndpoint()
  async imgTemplate(@Response() res) {
    res.download(
      path.join(__dirname, '../../src/commons/html-templates/logodash.png'),
    );
  }

  @Get('/all/:eventId')
  @AttendeesAllPdfDecorator()
  async findAllPdfByEvent(@Param() eventId: AttendeesInfoDto, @Response() res) {
    const attendees = await this.attendessService.findAttendessByEvent(
      parseInt(eventId.eventId),
    );

    if (!attendees.length)
      res.status(404).send({ statusCode: 404, message: 'ATTENDEES NOT FOUND' });
    if (!fs.existsSync('./pdf/bundle')) {
      fs.mkdirSync('./pdf/bundle');
    }

    let dir = fs.readdirSync('./pdf/bundle');

    /** DELETE OLD FILES */
    for (let file of dir) {
      await fs.unlinkSync(`./pdf/bundle/${file}`);
    }

    let name = `l${eventId.eventId}_${new Date().getTime()}`;
    const RUTA = `./pdf/bundle/${name}.pdf`;
    await this.attendessService.pdfBundle(attendees, RUTA);
    var file = fs.createReadStream(RUTA);
    var stat = fs.statSync(RUTA);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-type', 'application/pdf');
    res.setHeader(
      'Content-disposition',
      'inline; filename="' + name + '.pdf' + '"',
    );
    file.pipe(res);
    /*res
      .status(200)
      .send({ pdf: fs.readFileSync(RUTA, { encoding: 'base64' }) });*/
    //res.download(RUTA);
  }

  @Get('/contract/:id')
  @AttendeesContractDecorator()
  async prepareContract(@Param() id: AttendeesDetailDto, @Response() res) {
    const attendess = await this.attendessService.getById(id.id);
    if (!attendess.length)
      throw new HttpException('PDF NOT FOUND', HttpStatus.NOT_FOUND);

    //res.download(attendess[0].pdf_path)
    res.status(200).send({
      pdf: fs.readFileSync(attendess[0].pdf_path, { encoding: 'base64' }),
    });
  }

  @Get('/contract-temporal/:id')
  @AttendeesContractDecorator()
  async prepareContractTempora(
    @Param() id: AttendeesDetailDto,
    @Response() res,
  ) {
    const attendess = await this.attendessService.getTempoalById(id.id);
    if (!attendess.length)
      throw new HttpException('PDF NOT FOUND', HttpStatus.NOT_FOUND);

    //res.download(attendess[0].pdf_path)
    res.status(200).send({
      pdf: fs.readFileSync(attendess[0].pdf_path, { encoding: 'base64' }),
    });
  }

  @Put('/sign/:id')
  @AttendeesSignDecorator()
  @UseInterceptors(
    FileInterceptor('signature', {
      storage: diskStorage({
        destination: path.join(__dirname, STATICS_SIGNATURES), //Si esta ruta presenta agun error remplazarla por ./images
        filename: (req, file, callback) => {
          const name = new Date().getTime();
          callback(null, `${name}_${file.originalname}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const authorized = new Set(['image/png', 'image/jpeg', 'image/gif']);
        if (authorized.has(file.mimetype)) return callback(null, true);
        callback(
          new HttpException('Only image are allowed jpg/png/gif', 413),
          false,
        );
      },
    }),
  )
  async signContract(
    @UploadedFile() signature,
    @Param() id: AttendeesDetailDto,
    @User() session,
  ) {
    if (!signature)
      throw new HttpException('The signature field is mandatory', 417);

    let existAttendees = await this.attendessService.getTempoalById(id.id);
    if (!existAttendees.length)
      throw new HttpException('ATTENDEES NOT FOUND', HttpStatus.NOT_FOUND);

    const isAlreadyRegistered = await this.attendessService.isAlreadyRegistered(
      existAttendees[0].cedula,
      existAttendees[0].event_id,
    );
    if (isAlreadyRegistered.length && existAttendees[0].cedula)
      throw new HttpException('User already registered', HttpStatus.CONFLICT);

    /** CREAR EL ASISTENTE */
    let schema = existAttendees[0];
    delete schema.id;
    const newAttendees = await this.attendessService.create(schema);
    const increment = await this.eventService.incrementAttendees(
      existAttendees[0].event_id,
      session.id,
    );
    const event_dates = await this.eventService.getEventDatesByEvent(
      existAttendees[0].event_id,
    );
    const currentEventDate = this.eventService.getCurrentEvent(event_dates);

    const attendaceSignature = await this.attendessService.saveAttendanceSignature(
      {
        attendees_id: newAttendees[0],
        path_sign: signature.path,
        event_id: existAttendees[0].event_id,
        created_by: session.id,
        event_date: currentEventDate.event_date,
      },
    );

    existAttendees = await this.attendessService.getById(newAttendees[0]);

    const hasPDF = existAttendees[0].pdf_path;
    if (!hasPDF) throw new HttpException('PDF NOT FOUND', HttpStatus.NOT_FOUND);
    const existPdf = fs.existsSync(existAttendees[0].pdf_path);
    if (!existPdf)
      throw new HttpException('PDF NOT FOUND', HttpStatus.NOT_FOUND);
    await this.attendessService.signPdf(
      existAttendees[0].pdf_path,
      signature.path,
    );
    await this.attendessService.setSinature(
      existAttendees[0].id,
      signature.path,
      session.id,
    );

    /** EMAIL SECTION */
    /* Sección comentada por tentativa de cambio de flujo
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
        */

    /** CREATE LOG */
    let log = new LogDto();
    log.new_change = 'create';
    log.type = 'create';
    log.element = newAttendees[0];
    log.db_table = this.TABLE;
    log.created_by = session.id;
    log.modified_by = session.id;
    await this.logService.createLog(log);

    /** CREATE LOG EVENTS - INCREMENT ASSISTANTS */
    log.new_change = 'update';
    log.type = 'update';
    log.element = existAttendees[0].event_id;
    log.db_table = 'events';
    log.created_by = session.id;
    log.modified_by = session.id;
    await this.logService.createLog(log);

    /** CREATE LOG */
    log = new LogDto();
    log.new_change = 'sign_pdf';
    log.type = 'sign_pdf';
    log.element = 0;
    log.db_table = this.TABLE;
    log.created_by = session.id;
    log.modified_by = session.id;
    await this.logService.createLog(log);

    let response = new AttendeesCreateResponseDto();
    response.id = newAttendees[0];
    response.path = `${METHOD}://${DOMAIN}/attendees/contract/${newAttendees[0]}`;
    return response;
  }

  @Post('/sign-confirm/:id')
  @ApiExcludeEndpoint()
  @AttendeesConfirmSignDecorator()
  @UseInterceptors(
    FileInterceptor('signature', {
      storage: diskStorage({
        destination: path.join(__dirname, STATICS_SIGNATURES), //Si esta ruta presenta agun error remplazarla por ./images
        filename: (req, file, callback) => {
          const name = new Date().getTime();
          callback(null, `${name}_${file.originalname}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const authorized = new Set(['image/png', 'image/jpeg', 'image/gif']);
        if (authorized.has(file.mimetype)) return callback(null, true);
        callback(
          new HttpException('Only image are allowed jpg/png/gif', 413),
          false,
        );
      },
    }),
  )
  async confirmsignature(
    @UploadedFile() signature,
    @Param() id: AttendeesDetailDto,
    @User() session,
  ) {
    if (!signature)
      throw new HttpException('The signature field is mandatory', 417);

    const existAttendees = await this.attendessService.getById(id.id);
    if (!existAttendees.length)
      throw new HttpException('ATTENDEES NOT FOUND', HttpStatus.NOT_FOUND);

    const update = await this.attendessService.setconfirmSinature(
      existAttendees[0].id,
      signature.path,
      session.id,
    );

    /** CREATE LOG */
    let log = new LogDto();
    log.new_change = 'signature_confirm';
    log.type = 'update';
    log.element = existAttendees[0].id;
    log.db_table = this.TABLE;
    log.created_by = session.id;
    log.modified_by = session.id;
    await this.logService.createLog(log);
    return { message: 'success' };
  }

  @Get('/email')
  @AttendeesEmailDecorator()
  async sendEmail(@Query() info: AttendeesEmailDto) {
    const existAttendees = await this.attendessService.getById(info.id);
    if (!existAttendees.length)
      throw new HttpException('ATTENDEES NOT FOUND', HttpStatus.NOT_FOUND);
    const event = await this.eventService.findById(existAttendees[0].event_id);
    const hasPDF = existAttendees[0].pdf_path;
    if (!hasPDF) throw new HttpException('PDF NOT FOUND', HttpStatus.NOT_FOUND);
    const existPdf = fs.existsSync(existAttendees[0].pdf_path);
    if (!existPdf)
      throw new HttpException('PDF NOT FOUND', HttpStatus.NOT_FOUND);

    let email_template = await this.emailService.readTemplate(
      path.join(
        __dirname,
        '../../src/commons/html-templates/email-attendees.html',
      ),
    );
    let event_time = `${moment(event[0].hour_init, 'HH:mm').format(
      'HH:mm',
    )} - ${moment(event[0].hour_end, 'HH:mm').format('HH:mm')} Hrs`;
    let logo = `${METHOD}://${DOMAIN}/attendees/img-template`;

    email_template = this.emailService.prepareTemplate(
      [
        { key: 'event_name', value: event[0].name },
        {
          key: 'event_date',
          value: moment(event[0].event_date).add(1, 'day').format('YYYY-MM-DD'),
        },
        {
          key: 'logo',
          value: `<img src="${logo}" style="width: 100%; height: 100px; ">`,
        },
        { key: 'event_time', value: event_time },
        { key: 'event_location', value: event[0].address },
      ],
      email_template,
    );
    await this.emailService.sendEmail(
      `Registro de asistencia`,
      info.email,
      { filename: 'registro_asistencia.pdf', path: existAttendees[0].pdf_path },
      email_template,
    );
    return { message: 'E-mail sent' };
  }

  @Post('/signature/:id')
  @AttendanceSignatureDecorator()
  @UseInterceptors(
    FileInterceptor('signature', {
      storage: diskStorage({
        destination: path.join(__dirname, STATICS_SIGNATURES), //Si esta ruta presenta agun error remplazarla por ./images
        filename: (req, file, callback) => {
          const name = new Date().getTime();
          callback(null, `${name}_${file.originalname}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const authorized = new Set(['image/png', 'image/jpeg', 'image/gif']);
        if (authorized.has(file.mimetype)) return callback(null, true);
        callback(
          new HttpException('Only image are allowed jpg/png/gif', 413),
          false,
        );
      },
    }),
  )
  async uploadSignature(
    @UploadedFile() signature,
    @Param() id: AttendeesDetailDto,
    @User() session,
  ) {
    if (!signature)
      throw new HttpException('The signature field is mandatory', 417);

    const existAttendees = await this.attendessService.getById(id.id);

    if (!existAttendees.length)
      throw new HttpException('ATTENDEES NOT FOUND', HttpStatus.NOT_FOUND);

    const event_dates = await this.eventService.getEventDatesByEvent(
      existAttendees[0].event_id,
    );
    const currentEventDate = this.eventService.getCurrentEvent(event_dates);

    const isAlreadySign = await this.attendessService.findAttendanceSignature(
      currentEventDate.event_id,
      currentEventDate.event_date,
      id.id,
    );
    /*if (isAlreadySign.length)
      throw new HttpException(
        'The user has previously confirmed their attendance at the event',
        425,
      );*/

    const attendanceSignature = await this.attendessService.saveAttendanceSignature(
      {
        attendees_id: id.id,
        path_sign: signature.path,
        event_id: existAttendees[0]['event_id'],
        created_by: session.id,
        event_date: currentEventDate.event_date,
      },
    );

    /** CREATE LOG */
    let log = new LogDto();
    log.new_change = 'signature_confirm';
    log.type = 'create';
    log.element = attendanceSignature[0];
    log.db_table = 'attendees_sign';
    log.created_by = session.id;
    log.modified_by = session.id;
    await this.logService.createLog(log);

    let response: attendanceResponse = {
      id: id.id,
      signature: `${METHOD}://${DOMAIN}/attendees/signature/${attendanceSignature[0]}`,
    };

    return response;
  }

  @Get('/signature/:id')
  @AttendeesSignatureDecorator()
  async download(@Response() res, @Param('id') id: number) {
    const attendees = await this.attendessService.getAttendeesSignById(id);
    if (!attendees.length)
      throw new HttpException('IMAGE NOT FOUND', HttpStatus.NOT_FOUND);

    const path = attendees[0].path_sign;
    res.download(path);
  }

  @Get('/detail/:id')
  @AttendeesDetailDecorator()
  async findById(@Param() id: AttendeesDetailDto) {
    const attendees = await this.attendessService.getById(id.id);
    if (!attendees.length)
      throw new HttpException('Assistant not found', HttpStatus.NOT_FOUND);

    let response = new AttendeesItemDto();
    response.id = attendees[0].id;
    response.name = attendees[0].name;
    response.lastname = attendees[0].lastname;
    response.cedula = attendees[0].cedula;
    response.speciality = attendees[0].speciality;
    response.email = attendees[0].email || '';

    return response;
  }

  @Get('/:eventId')
  @AttendeesEventsDecorator()
  async findEvent(
    @Param() eventId: AttendeesInfoDto,
    @Query() pagination: AttendeesPaginationDto,
  ) {
    const existEvent = await this.eventService.findById(
      parseInt(eventId.eventId),
    );
    if (!existEvent.length)
      throw new HttpException('EVENT NOT FOUND', HttpStatus.NOT_FOUND);

    const attendees = await this.attendessService.findByEvent(
      parseInt(eventId.eventId),
      pagination,
    );
    const { pages, total } = await this.attendessService.totalPages(
      pagination,
      parseInt(eventId.eventId),
    );

    let response = new AttendeesResponseDto();
    response.eventId = existEvent[0].id;
    response.event_name = existEvent[0].name;
    response.event_date = moment(existEvent[0].event_date).format('DD-MM-YYYY');
    response.items = attendees;
    response.pages = pages;
    //@ts-ignore
    response.totalFound = parseInt(total);
    return response;
  }
}

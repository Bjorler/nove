import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import * as moment from 'moment';

@Injectable()
export class PrepareService {
  constructor(@InjectKnex() private knex: Knex) {}

  async getAllUsers() {
    let users = await this.knex.table('users');
    return users;
  }
  async updateImage(image: string, avatar: string, id: number) {
    await this.knex
      .table('users')
      .update({ path: image, avatar })
      .where({ id: id });
  }

  async getAllEvents() {
    let events = await this.knex.table('events');
    return events;
  }

  async updateEvent(path: string, name: string, id: number) {
    await this.knex.table('events').update({ image: name, path }).where({ id });
  }

  async getAllAttendees() {
    let attendees = await this.knex.table('attendees');
    return attendees;
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async createEvents() {
    let totalMonths = 12;
    const brand = [
      'Acquired Haemophilia',
      'Haemophilia',
      'Diabetes Public',
      'Insulins',
      'Saxenda®',
      'Ozempic®',
      'Growth Hormone',
    ];
    const hours = [
      { i: '08:00:00', f: '09:00:00' },
      { i: '09:00:00', f: '10:00:00' },
      { i: '10:00:00', f: '11:00:00' },
      { i: '11:00:00', f: '12:00:00' },
      { i: '12:00:00', f: '13:00:00' },
      { i: '13:00:00', f: '14:00:00' },
      { i: '14:00:00', f: '15:00:00' },
      { i: '15:00:00', f: '16:00:00' },
      { i: '16:00:00', f: '17:00:00' },
      { i: '17:00:00', f: '18:00:00' },
      { i: '18:00:00', f: '19:00:00' },
      { i: '19:00:00', f: '20:00:00' },
    ];
    const currentYear = 2021;
    for (let year = 2020; year <= currentYear; year++) {
      if (year == currentYear) totalMonths = new Date().getMonth() + 1;
      for (let month = 1; month <= totalMonths; month++) {
        const eventsPerMonth = 1; //this.getRandomInt(1, 3);
        for (let j = 0; j < eventsPerMonth; j++) {
          const randomTime = this.getRandomInt(0, hours.length - 1);
          const auxMonth = `${month}`.padStart(2, '0');
          const date = `${year}-${auxMonth}-01 13:35:16`;

          const info = {
            name: 'Clinica y herramientas diagnósticas en genética',
            address: 'CDMX, México',
            description:
              'Evento con fines de educación continua y actualización de conocimientos en cardiología',
            event_date: date,
            hour_init: hours[randomTime].i,
            hour_end: hours[randomTime].f,
            image: '9f39713-1.jpg',
            path:
              'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\images\\1615404916814_9f39713-1.jpg',
            assistants: 0,
            sede: 'Sede central',
            brand: brand[this.getRandomInt(0, 7)] || brand[0],
            is_active: 0,
            is_deleted: 0,
            created_on: '2021-03-10 13:35:16',
            created_by: 23,
            modified_on: '2021-03-10 13:35:16',
            modified_by: 23,
          };
          await this.knex.table('events').insert(info);
        }
      }
    }
  }

  async createEventDate() {
    const events = await this.knex.table('events');
    for (let event of events) {
      const eventsPerMonth = this.getRandomInt(1, 10);
      for (let day = 1; day <= eventsPerMonth; day++) {
        const displayDay = `${this.getRandomInt(1, 28)}`.padStart(2, '0');
        const prefix_date = moment(event.event_date).format('YYYY-MM');
        const event_date = moment(`${prefix_date}-${displayDay}`).format(
          'YYYY-MM-DD',
        );
        const event_id = event.id;
        const info = {
          event_date,
          event_id,
          created_by: 23,
        };
        await this.knex.table('events_date').insert(info);
      }
    }
  }

  prepareData() {
    let result = [];
    const data = [
      [
        9643069,
        'MARICELA RODRIGUEZ GARCIA',
        'MARICELA',
        'RODRIGUEZ GARCIA',
        'Orthopaedics',
        '',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615428629857_firma.jpg',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\pdf\\1615428624795MACL.pdf',
        'Haemophilia',
        '{"question1":"true","question2":"true","question3":"true","institutionName":"Instituto Nacional de Cardiología","nameAndTitle":"ILSE ITZEL BAUTISTA CRUZ DR. General","authorization":"true","idengage":""}',
        '',
        'internet',
        325,
        0,
        0,
        '2021-03-10 20:10:24',
        23,
        '2021-03-10 20:54:54',
        23,
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615428624627_firma.jpg',
      ],
      [
        9663069,
        'AURA FABIOLA MARTINEZ CHAVARRIA',
        'AURA FABIOLA',
        'MARTINEZ CHAVARRIA',
        'Endocrinology',
        '',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615429117185_firma.jpg',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\pdf\\1615429111982AUCL.pdf',
        'Haemophilia',
        '{"question1":"true","question2":"true","question3":"true","institutionName":"Instituto Nacional de Cardiología","nameAndTitle":"ILSE ITZEL BAUTISTA CRUZ DR. General","authorization":"true","idengage":"WMXM00320234"}',
        'WMXM00320234',
        'excel',
        325,
        0,
        0,
        '2021-03-10 20:18:31',
        23,
        '2021-03-10 20:18:37',
        23,
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615429111915_firma.jpg',
      ],
      [
        9288045,
        'CESAR ROMERO SOSA',
        'CESAR',
        'ROMERO SOSA',
        'Médico General',
        '',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615429334334_firma.jpg',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\pdf\\1615429329846CECL.pdf',
        'Diabetes Public',
        '{"question1":"true","question2":"true","question3":"true","institutionName":"Instituto Nacional de Cardiología","nameAndTitle":"ILSE ITZEL BAUTISTA CRUZ DR. General","authorization":"true","idengage":"WMXM00320202"}',
        'WMXM00320202',
        'excel',
        326,
        0,
        0,
        '2021-03-10 20:22:09',
        23,
        '2021-03-10 20:22:14',
        23,
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615429329806_firma.jpg',
      ],
      [
        10134380,
        'MARIA MARINA MORENO BARRON',
        'MARIA MARINA',
        'MORENO BARRON',
        'Family medicine',
        '',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615429583342_firma.jpg',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\pdf\\1615429579216MACL.pdf',
        'Haemophilia',
        '{"question1":"true","question2":"true","question3":"true","institutionName":"Instituto Nacional de Cardiología","nameAndTitle":"ILSE ITZEL BAUTISTA CRUZ DR. General","authorization":"true","idengage":"WMXM00320191"}',
        'WMXM00320191',
        'excel',
        325,
        0,
        0,
        '2021-03-10 20:26:19',
        23,
        '2021-03-10 20:26:23',
        23,
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615429579163_firma.jpg',
      ],
      [
        10996260,
        'VICTOR MANUEL ANGUIANO ALVAREZ',
        'VICTOR MANUEL',
        'ANGUIANO ALVAREZ',
        'Internal medicine',
        '',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615429809274_firma.jpg',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\pdf\\1615429783858VICL.pdf',
        'Haemophilia',
        '{"question1":"true","question2":"true","question3":"true","institutionName":"Instituto Nacional de Cardiología","nameAndTitle":"ILSE ITZEL BAUTISTA CRUZ DR. General","authorization":"true","idengage":"WMXM00317475"}',
        'WMXM00317475',
        'excel',
        325,
        0,
        0,
        '2021-03-10 20:29:43',
        23,
        '2021-03-10 20:30:09',
        23,
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615429783817_firma.jpg',
      ],
      [
        10296260,
        'JARELI ESMERALDA ZATARAIN GARCIA',
        'JARELI ESMERALDA',
        'ZATARAIN GARCIA',
        'Internal medicine',
        '',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615430012228_firma.jpg',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\pdf\\1615430008613JACL.pdf',
        'Diabetes Public',
        '{"question1":"true","question2":"true","question3":"true","institutionName":"Instituto Nacional de Cardiología","nameAndTitle":"ILSE ITZEL BAUTISTA CRUZ DR. General","authorization":"true","idengage":""}',
        '',
        'internet',
        326,
        0,
        0,
        '2021-03-10 20:33:28',
        23,
        '2021-03-10 20:33:32',
        23,
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615430008576_firma.jpg',
      ],
      [
        11467173,
        'MARIO DAVID PEREZ GUERRA',
        'MARIO DAVID',
        'PEREZ GUERRA',
        'Cardiología Pediátrica',
        '',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615430300239_firma.jpg',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\pdf\\1615430257756MACL.pdf',
        'Haemophilia',
        '{"question1":"true","question2":"true","question3":"true","institutionName":"Instituto Nacional de Cardiología","nameAndTitle":"ILSE ITZEL BAUTISTA CRUZ DR. General","authorization":"true","idengage":"WMXM00307861"}',
        'WMXM00307861',
        'excel',
        325,
        0,
        0,
        '2021-03-10 20:37:37',
        23,
        '2021-03-10 20:38:20',
        23,
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615430257690_firma.jpg',
      ],
      [
        11653080,
        'ALBERTO PEREZ CANTU SACAL',
        'ALBERTO',
        'PEREZ CANTU SACAL',
        'General surgery',
        'dr.apcantu@gmail.com',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615430583262_firma.jpg',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\pdf\\1615430573067ALCL.pdf',
        'Diabetes Public',
        '{"question1":"true","question2":"true","question3":"true","institutionName":"Instituto Nacional de Cardiología","nameAndTitle":"ILSE ITZEL BAUTISTA CRUZ DR. General","authorization":"true","idengage":"WMXM00294485"}',
        'WMXM00294485',
        'excel',
        326,
        0,
        0,
        '2021-03-10 20:42:53',
        23,
        '2021-03-10 20:43:03',
        23,
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615430573016_firma.jpg',
      ],
      [
        8669275,
        'YOSELIN SOLIS TORRES',
        'YOSELIN',
        'SOLIS TORRES',
        'Médico General',
        'nutricion@preven.com.mx',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615430701982_firma.jpg',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\pdf\\1615430691069YOCL.pdf',
        ' Saxenda®',
        '{"question1":"true","question2":"true","question3":"true","institutionName":"Instituto Nacional de Cardiología","nameAndTitle":"ILSE ITZEL BAUTISTA CRUZ DR. General","authorization":"true","idengage":"WMXM00291984"}',
        'WMXM00291984',
        'excel',
        328,
        0,
        0,
        '2021-03-10 20:44:50',
        23,
        '2021-03-10 20:45:02',
        23,
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615430690969_firma.jpg',
      ],
      [
        10308708,
        'CARLOS SAMIR VALENCIA SANCHEZ',
        'CARLOS SAMIR',
        'VALENCIA SANCHEZ',
        'Médico General',
        '',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615430872752_firma.jpg',
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\pdf\\1615430863097CACL.pdf',
        'Haemophilia',
        '{"question1":"true","question2":"true","question3":"true","institutionName":"Instituto Nacional de Cardiología","nameAndTitle":"ILSE ITZEL BAUTISTA CRUZ DR. General","authorization":"true","idengage":"WMXM00287594"}',
        'WMXM00287594',
        'excel',
        325,
        0,
        0,
        '2021-03-10 20:47:43',
        23,
        '2021-03-10 20:47:52',
        23,
        'C:\\Users\\Dell\\Documents\\NESTJS\\noveve\\statics\\signatures\\1615430863048_firma.jpg',
      ],
    ];
    for (let d of data) {
      const info = {
        cedula: d[0],
        name: d[1],
        firstname: d[2],
        lastname: d[3],
        speciality: d[4],
        email: d[5],
        path: d[6],
        pdf_path: d[7],
        brand: d[8],
        questions: d[9],
        idengage: d[10],
        register_type: d[11],
        event_id: d[12],
        is_active: d[13],
        is_deleted: d[14],
        created_on: d[15],
        created_by: d[16],
        modified_on: d[17],
        modified_by: d[18],
        confirm_signature: d[19],
      };
      result.push(info);
    }
    return result;
  }

  async createAttendees() {
    const attendees = this.prepareData();

    const events = await this.knex.table('events');
    for (let event of events) {
      const totalAttendees = this.getRandomInt(1, attendees.length - 1);
      for (let attendee = 1; attendee <= totalAttendees; attendee++) {
        let info = attendees[attendee];
        info.event_id = event.id;
        await this.knex.table('temporal_attendees').insert(info);
        await this.knex.table('attendees').insert(info);
        const att = await this.knex.table('events').where({ id: event.id });
        const count = att[0]['assistants'] + 1;
        await this.knex
          .table('events')
          .update({ assistants: count })
          .where({ id: event.id });
      }
    }
  }

  async signAttendance() {
    const attendees = await this.knex.table('attendees');
    for (let attendee of attendees) {
      const event_dates = await this.knex
        .table('events_date')
        .where({ event_id: attendee.event_id });
      for (let date of event_dates) {
        const signature = attendee.path;
        const info = {
          attendees_id: attendee.id,
          path_sign: signature,
          event_id: date.event_id,
          event_date: date.event_date,
          created_by: 23,
        };
        await this.knex.table('attendees_sign').insert(info);
      }
    }
  }

  async deleteData() {
    await this.knex.table('attendees_sign').delete();
    await this.knex.table('attendees').delete();
    await this.knex.table('temporal_attendees').delete();
    await this.knex.table('events_date').delete();
    await this.knex.table('events').delete();
  }

  async getCurrentDate(event_id: number) {
    const date = await this.knex
      .table('events_date')
      .where({ event_id })
      .orderBy('event_date')
      .limit(1);

    return date;
  }
}

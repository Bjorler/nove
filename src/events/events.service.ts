import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import * as moment from 'moment-timezone';
import * as fs from 'fs';
import { AttendessService } from '../attendess/attendess.service';
import { EventsResponse } from './DTO/events-response.dto';
import { EventsPaginationDto } from './DTO/events-pagination.dto';
import { EventsInfoDto } from './DTO/events-info.dto';
import { METHOD, PORT, DOMAIN } from '../config';

@Injectable()
export class EventsService {
  private TABLE = 'events';
  constructor(
    @InjectKnex() private knex: Knex,
    @Inject(forwardRef(() => AttendessService))
    private attendeesService: AttendessService,
  ) {}

  async save(event) {
    const newEvent = await this.knex.table(this.TABLE).insert(event);
    return newEvent;
  }

  async findAll(pagination: EventsPaginationDto): Promise<EventsResponse[]> {
    let page = parseInt(pagination.page);
    let limit = parseInt(pagination.page_size);
    const offset = page == 1 ? 0 : (page - 1) * limit;
    const events = await this.getQuery(
      pagination.search_item,
      limit,
      offset,
      pagination.date_init,
      pagination.date_final,
    );

    let result: EventsResponse[] = [];

    for (let event of events) {
      let info = new EventsResponse();
      info.id = event.id;
      info.name = event.name;
      info.location = event.address;
      info.event_date = await this.getEventDates(event.id);
      info.sede = event.sede || '';
      info.brand = event.brand || '';
      info.is_internal = event.is_internal ? true: false
      //event.event_date//moment(event.event_date).format("DD-MM-YYYY");
      //const total = await this.attendeesService.findTotalAttendeesByEvent(event.id);

      info.assistance = event.assistants;
      result.push(info);
    }
    return result;
  }

  async getEventDates(event_id: number) {
    const dates = await this.knex
      .table('events_date')
      .where({ event_id, is_deleted: 0 });

    let result = [];
    for (let date of dates) {
      result.push(date.event_date);
    }
    return result;
  }

  private async getQuery(
    filter: string,
    limit: number,
    offset: number,
    init_date: string,
    final_date: string,
  ) {
    let events = [];

    events = await this.knex
      .select(this.knex.raw(`distinct ${this.TABLE}.* `))
      .table(this.TABLE)
      .innerJoin('events_date', 'events.id', 'events_date.event_id')
      .limit(limit)
      .offset(offset)
      .where((builder) => {
        console.log({ filter, init_date, final_date });
        if (filter) {
          if (isNaN(parseInt(filter))) {
            builder
              .where('name', 'like', `%${filter}%`)
              .orWhere('address', 'like', `%${filter}%`);
          } else {
            builder.where('assistants', '=', parseInt(filter));
          }
        }
      })
      .andWhere((builder) => {
        if (init_date && final_date) {
          builder
            .where('events_date.event_date', '>=', init_date)
            .andWhere('events_date.event_date', '<=', final_date);
        }
      })
      .andWhere(`${this.TABLE}.is_deleted`, '=', 0)
      .orderBy('.events_date.event_date', 'desc');

    return events;
  }

  private async getQueryTotalPages(
    filter: string,
    init_date: string,
    final_date: string,
  ) {
    let events = [];
    events = await this.knex
      .select(this.knex.raw(`count(distinct ${this.TABLE}.id) as total `))
      .table(this.TABLE) //.count("events.id",{as:'total'})
      .innerJoin('events_date', 'events.id', 'events_date.event_id')
      .where((builder) => {
        if (filter) {
          if (isNaN(parseInt(filter))) {
            builder
              .where('name', 'like', `%${filter}%`)
              .orWhere('address', 'like', `%${filter}%`);
          } else {
            builder.where('assistants', '=', parseInt(filter));
          }
        }
        /*if(init_date && final_date){
                builder.where("event_date",'>=', init_date).andWhere("event_date", '<=', final_date)
            }*/
      })
      .andWhere((builder) => {
        if (init_date && final_date) {
          builder
            .where('events_date.event_date', '>=', init_date)
            .andWhere('events_date.event_date', '<=', final_date);
        }
      })
      .andWhere(`${this.TABLE}.is_deleted`, '=', 0);

    return events;
  }

  async totalPages(pagination: EventsPaginationDto) {
    const limit = parseInt(pagination.page_size);
    //const count = await this.knex.table(this.TABLE).count("id",{as:'total'}).where({is_deleted:0})
    const count = await this.getQueryTotalPages(
      pagination.search_item,
      pagination.date_init,
      pagination.date_final,
    );
    const total = count[0].total;
    //@ts-ignore
    let module = total % limit;
    //@ts-ignore
    let div = Math.floor(total / limit);
    let pages = div + (module > 0 ? 1 : 0);
    return { pages, total };
  }

  async findById(eventId: number) {
    const event = await this.knex
      .table(this.TABLE)
      .where({ id: eventId })
      .andWhere({ is_deleted: 0 });
    return event;
  }

  async delete(eventId: number) {
    const deleted = await this.knex
      .table(this.TABLE)
      .update({ is_deleted: 1 })
      .where({ id: eventId });
    return deleted;
  }

  async update(event, eventId: number) {
    const updated = await this.knex
      .table(this.TABLE)
      .update(event)
      .where({ id: eventId });
    return updated;
  }

  async futureEvents() {
    const hour_init = moment().format('HH:00');
    let events = await this.knex
      .select(`${this.TABLE}.*`)
      .table(this.TABLE)
      .innerJoin('events_date', 'events.id', 'events_date.event_id')
      .where(`${this.TABLE}.is_deleted`, '=', 0)
      .andWhere(
        this.knex.raw("date_format(events_date.event_date,'%Y-%m-%d') > ? ", [
          moment().format('YYYY-MM-DD'),
        ]),
      )
      .orWhere((builder) => {
        builder
          .where('hour_init', '>=', hour_init)
          .andWhere(
            this.knex.raw(
              "date_format(events_date.event_date,'%Y-%m-%d') = ?",
              [moment().format('YYYY-MM-DD')],
            ),
          );
      })
      .orWhere((builder) => {
        builder
          .where('hour_end', '>', hour_init)
          .andWhere(
            this.knex.raw(
              "date_format(events_date.event_date,'%Y-%m-%d') = ?",
              [moment().format('YYYY-MM-DD')],
            ),
          );
      })
      .orderBy('events_date.event_date')
      .orderBy('hour_init');

    let data = [];
    for (let e of events) {
      const isInData = data.find((d) => d.id == e.id);
      if (!isInData) data.push(e);
    }

    const result = [];
    for (let event of data) {
      let info = new EventsInfoDto();
      info.download_img = `${METHOD}://${DOMAIN}/events/image/${event.id}`;
      info.default_img = `${METHOD}://${DOMAIN}/events/image`;
      info.eventId = event.id;
      info.image_name = event.image;
      info.name = event.name;
      info.location = event.address;
      info.sede = event.sede || '';
      info.description = event.description;
      info.event_date = this.displayDates(await this.getEventDates(event.id)); //event.event_date;
      info.hour_init = event.hour_init;
      info.hour_end = event.hour_end;
      info.is_internal = event.is_internal ? true: false;
      info.display_time = `${moment(event.hour_init, 'HH:mm').tz('America/Mexico_City').format(
        'HH:mm',
      )} - ${moment(event.hour_end, 'HH:mm').tz('America/Mexico_City').format('HH:mm')} Hrs`;
      info.display_date = this.getCurrentDate(
        await this.getEventDates(event.id),
      );
      result.push(info);
    }
    return result;
  }

  getCurrentDate(event_dates) {
    let result;
    for (let date of event_dates) {
      const auxDate = moment(date).format('YYYY-MM-DD');
      const currentDate = moment().format('YYYY-MM-DD');
      if (moment(auxDate).isSame(moment(currentDate))) result = date;
    }

    if (!result) {
      const sorted = event_dates.sort((a, b) => moment(a).diff(moment(b)));
      const aux = [];
      for (let date of sorted) {
        const auxDate = moment(date).format('YYYY-MM-DD');
        const currentDate = moment().format('YYYY-MM-DD');
        if (moment(auxDate).isAfter(moment(currentDate))) aux.push(date);
      }
      result = aux[0];
    }
    console.log(result);
    return result;
  }

  async incrementAttendees(eventId: number, session) {
    const event = await this.knex.table(this.TABLE).where({ id: eventId });
    let count = event[0]['assistants'] + 1;
    const updated = await this.knex
      .table(this.TABLE)
      .update({ assistants: count, modified_by: session.id })
      .where({ id: eventId });
    return updated;
  }

  async findByYear(year: string) {
    const DATE = moment(year).format('YYYY-MM-DD');
    let FINAL_YEAR = moment(year).endOf('year');
    let FINAL = moment(FINAL_YEAR).format('YYYY-MM-DD');

    /*const events = await this.knex.table(this.TABLE)
        .innerJoin("events_date",'events.id','events_date.event_id')
        .where('event_date','>=',DATE)
        .andWhere('event_date','<=', FINAL)
        .andWhere({is_deleted:0})*/

    const events = await this.knex
      .select(
        this.knex.raw(`
            events.id, events.name, events.address, 
            (
            
            SELECT  event_date FROM events_date
            WHERE event_id = events.id  AND is_deleted = 0 
            ORDER BY id LIMIT 1
             
            ) AS event_date  
            `),
      )
      .table(this.TABLE)
      .innerJoin('events_date', 'events.id', 'events_date.event_id')
      .where('events_date.event_date', '>=', DATE)
      .andWhere('events_date.event_date', '<=', FINAL)
      .andWhere(`${this.TABLE}.is_deleted`, '=', 0)
      .groupBy('events.id');

    return events;
  }

  async getTodaysList(
    init_date: string,
    final_date: string,
    hour_init: string,
  ) {
    const result = await this.knex
      .table(this.TABLE)
      .where('event_date', '>=', init_date)
      .andWhere('event_date', '<=', final_date)
      .andWhere({ is_deleted: 0 })
      .andWhere('hour_init', '>=', hour_init)
      .orderBy('hour_init');

    return result;
  }

  async deleteImage(path: string) {
    const existFile = fs.existsSync(path);
    if (existFile && path) {
      fs.unlinkSync(path);
    }
  }
  parseToarray(dates: string) {
    let dates_Array = dates.split(',');
    let result = [];
    for (let e of dates_Array) {
      if (moment(e).isValid()) result.push(e);
    }
    return result;
  }
  validateDates(dates: string[]) {
    let guard = false;
    for (let date of dates) {
      const EVENT_DATE_IS_BEFORE_CURRENT_DATE = moment(date).isBefore(
        moment(moment().format('YYYY-MM-DD')),
      );
      const EVENT_DATE_IS_SAME_CURRENT_DATE = moment(date).isSame(
        moment(moment().format('YYYY-MM-DD')),
      );

      if (EVENT_DATE_IS_BEFORE_CURRENT_DATE) guard = true;
    }
    return guard;
  }
  async saveEventDate(dates: string[], event_id: number, session) {
    let data = [];
    for (let date of dates) {
      data.push({ event_date: date, event_id, created_by: session.id });
    }
    const event_dates = await this.knex.table('events_date').insert(data);
    return event_dates;
  }
  async updateEventDates(dates: string[], event_id: number, session) {
    const deleted = await this.knex
      .table('events_date')
      .update({ is_deleted: 1 })
      .where({ event_id, is_deleted: 0 });
    const newDates = await this.saveEventDate(dates, event_id, session);
    return newDates;
  }
  displayDates(dates: string[]) {
    let result = [];
    for (let date of dates) {
      result.push({
        display_date: moment(date).format('DD-MM-YYYY'),
        event_date: date,
      });
    }
    return result;
  }

  async getEventDatesByEvent(eventId: number) {
    const event_dates = await this.knex
      .table('events_date')
      .where({ event_id: eventId, is_deleted: 0 });
    return event_dates;
  }

  getCurrentEvent(event_dates) {
    let event;
    const current = moment().format('YYYY-MM-DD');
    for (let date of event_dates) {
      const isCurrentDate = moment(current).isSame(moment(date.event_date));

      if (isCurrentDate) event = date;
    }
    return event;
  }
  async getEventDateEventAndAttendees(event_id: number, attendess_id: number) {
    const event_dates = await this.knex
      .table('attendees_sign')
      .where({ attendess_id, event_id, is_deleted: 0 });
    return event_dates;
  }
}

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import { USER_EMAIL, PASSWORD_EMAIL } from '../../config';
@Injectable()
export class EmailServices {
    
    private transporter = nodemailer.createTransport({
        service: "Gmail",
        secure: true,
        auth: {
          user: USER_EMAIL,
          pass: PASSWORD_EMAIL,
        },
      });
    constructor(
    ){}

    async sendEmail(subject:string, to:string, message, html:string){
        const mailOptions = {
            from:'"novo nordisk"<foo@example.com>',
            to: to,
            subject: subject,
            html
            
          };
          if(message.path){
              //@ts-ignore
              mailOptions.attachments=[{
                path:message.path,
                filename:message.filename
            }]
          }
        this.transporter.sendMail(mailOptions, (sendError, sendInfo) => {
            if (sendError) {
                console.log(sendError)
            } else {
              console.log(sendInfo);
            }
        });  
    }

    async readTemplate(path:string){
      return await fs.readFileSync(path,{encoding:'utf8'});
    }
    
    prepareTemplate(params, template:string){
      for(let param of params){
        template = template.replace(`%${param.key}%`, param.value)
      }
      return template;
    }


}

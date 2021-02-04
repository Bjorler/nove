import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
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

    async sendEmail(subject:string, to:string, message){
        const mailOptions = {
            from:'"novo nordisk"<foo@example.com>',
            to: to,
            subject: subject,
            
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
    
}

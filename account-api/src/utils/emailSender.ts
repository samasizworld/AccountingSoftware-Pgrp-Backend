import { pdfGenerateByHtml } from "./pdfGenerator";
import nodemailer from 'nodemailer';
const moment =require('moment');

export const emailSender={
    async emailSender(users,pdf){
        const transporter = nodemailer.createTransport({
          // service: config.serviceName,
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: 'testelkiwi@gmail.com', // generated ethereal user
            pass: '*******', // generated ethereal password
          },
        });
        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: `<testelkiwi@gmail.com>`, // sender address
          to: users, // list of receivers
          subject: `JournalEntries`, // Subject line
          text: `Hi all`, // plain text body
          attachments: [
            {
              filename: `Journal-${moment().format(
                'HHmmssYYYYmmddss'
              )}.pdf`,
              content: Buffer.from(pdf, 'utf-8'),
              contentType: 'text/pdf',
            },
          ],
        });
        console.log('Message sent: %s', info.messageId);
    }
};
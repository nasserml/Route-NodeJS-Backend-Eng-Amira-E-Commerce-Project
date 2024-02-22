import nodemailer from 'nodemailer';
/**
 * Asynchronous function to send an email.
 * @param {Object} options - Options for the email (to, subject, message, attachments)
 * @returns 
 */
const sendEmailService = async ({to='', subject='no-reply', message='<h1>no-messages</h1>', attachments=[]}) => {
    
    // Email configuration 
    const transporter = nodemailer.createTransport({host: 'localhost', service: 'gmail', port: 587, secure: false, auth: {user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD}});

    // send emnail
    const info = await transporter.sendMail({from:`"Fred foo 👻" <${process.env.EMAIL}>`, to, subject, html: message, attachments});

    // Return true if the email was sent successfully otherwise false
    return info.accepted.length ? true : false;
}

export default sendEmailService;
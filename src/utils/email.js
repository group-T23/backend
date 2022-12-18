const nodemailer = require('nodemailer');

const send = async(recipient, title, message) => {
    const user = process.env.EM_USER;

    const smtp = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user: user, pass: process.env.EM_PASSWORD }
    });

    const options = {
        from: user,
        to: recipient,
        subject: title,
        text: message,
    };

    const info = await smtp.sendMail(options, error => { if (error) console.log(error); });
};

module.exports = { send };
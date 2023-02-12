const nodemailer = require('nodemailer');

const send = async(recipient, title, message) => {

    const smtp = nodemailer.createTransport({
        host: process.env.EM_OCI_HOST,
        port: 587,
        secure: false,
        auth: {
            user: process.env.EM_OCI_USER,
            pass: process.env.EM_OCI_PASSWORD
        }
    });

    const options = {
        from: process.env.EM_USER,
        to: recipient,
        subject: title,
        text: message,
    };

    const info = await smtp.sendMail(options, error => { if (error) console.log(error); });
};

module.exports = { send };
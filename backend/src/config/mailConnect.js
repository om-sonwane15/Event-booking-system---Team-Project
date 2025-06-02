// src/config/mailConnect.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Error with email transporter:', error.message);
    } else {
        console.log('Email transporter is ready to send emails');
    }
});

module.exports = transporter;

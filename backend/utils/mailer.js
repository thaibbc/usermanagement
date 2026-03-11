const nodemailer = require('nodemailer');

// simple transporter using environment variables; fall back to console log
let transporter;
if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        // Gmail often requires TLS
        tls: {
            rejectUnauthorized: false,
        },
    });

    // verify connection configuration on startup
    transporter.verify((err, success) => {
        if (err) {
            console.error('SMTP transporter verification failed:', err);
        } else {
            console.log('SMTP transporter is ready to send messages');
        }
    });
} else {
    transporter = {
        sendMail: async (options) => {
            console.log('mailer placeholder (no SMTP configured) - would send email with options:', options);
            return Promise.resolve();
        },
    };
}

module.exports = { transporter };

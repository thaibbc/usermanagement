const nodemailer = require('nodemailer');

// simple transporter using environment variables; fall back to console log
let transporter;

// if an API provider key is supplied we prefer the REST API over raw SMTP
if (process.env.SENDGRID_API_KEY) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    transporter = {
        sendMail: async (opts) => {
            const msg = {
                to: opts.to,
                from: process.env.MAIL_FROM || 'noreply@example.com',
                subject: opts.subject,
                text: opts.text,
            };
            return sgMail.send(msg);
        },
    };
} else if (process.env.SMTP_HOST) {
    // note: Render's network may block outbound SMTP on 587/25; try 465 secure first
    const port = parseInt(process.env.SMTP_PORT, 10) || 465;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

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

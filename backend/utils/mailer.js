const nodemailer = require('nodemailer');

// simple transporter using environment variables; fall back to console log
let transporter;

// helper to show what transport we’ve selected
function logTransport(type, details = '') {
    console.log(`mailer: using ${type} transport${details ? ' (' + details + ')' : ''}`);
}

// if an API provider key is supplied we prefer the REST API over raw SMTP
if (process.env.SENDGRID_API_KEY) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    logTransport('SendGrid API');
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
    // note: Render's network may block outbound SMTP on 587/25; prefer 465 or API keys
    // also force IPv4 to avoid unreachable IPv6 addresses that can hang
    let port = parseInt(process.env.SMTP_PORT, 10) || 465;
    let secure = process.env.SMTP_SECURE === 'true' || port === 465;

    if (process.env.RENDER && port === 587) {
        console.warn('Render generally blocks port 587. Consider setting SMTP_PORT=465 or using an API key (SENDGRID_API_KEY).');
    }

    const baseOptions = {
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
        // prefer IPv4; Render’s egress can misroute IPv6
        connectionTimeout: 10000,
        family: 4,
    };

    transporter = nodemailer.createTransport(baseOptions);

    // if verification fails and we're not already on 465, try secure port 465 before giving up
    transporter.verify(async (err) => {
        if (err) {
            console.error('SMTP transporter verification failed (port ' + port + '):', err);
            if (port !== 465) {
                console.log('retrying verification on port 465/secure');
                const fallback = nodemailer.createTransport({ ...baseOptions, port: 465, secure: true });
                try {
                    await fallback.verify();
                    transporter = fallback;
                    console.log('fallback transporter on port 465 is ready');
                } catch (fallbackErr) {
                    console.error('fallback on port 465 also failed:', fallbackErr);
                }
            }
        } else {
            console.log('SMTP transporter is ready to send messages');
        }
    });
} else {
    logTransport('console placeholder');
    transporter = {
        sendMail: async (options) => {
            console.log('mailer placeholder (no SMTP configured) - would send email with options:', options);
            return Promise.resolve();
        },
    };
}

module.exports = { transporter, logTransport };

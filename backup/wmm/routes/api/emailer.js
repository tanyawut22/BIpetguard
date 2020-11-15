var config = require('/www/app/routes/api/config');
var nodemailer = require('nodemailer');

var jsm_sendEmail = function (from, to, subject, txt, message, attachments, onCompletedCallback) {
    var transporter = nodemailer.createTransport(config.getSMTPConfig());

    var mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: txt,
        html: message
    };

    if (attachments != null) {
        mailOptions = {
            from: from,
            to: to,
            subject: subject,
            text: txt,
            html: message,
            attachments: attachments
        };
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            console.log(info);
            onCompletedCallback({ success: false, error: error, info: info });
        }
        else {
            onCompletedCallback({ success: true });
        }
    });
}

module.exports = {
    jsm_sendEmail
}
var AWS = require("aws-sdk");
var sesApi = require("./config");
var moment = require("moment");

AWS.config.update(sesApi.getApiSES());

const ses = new AWS.SES({ apiVersion: "2010-12-01" });
var params = {
    Destination: { ToAddresses: [] },
    ConfigurationSetName: "TestConfig",
    Message: {
        Body: {
            Html: {
                Charset: "utf-8",
                Data: "<html><body><h1>Hello สวัสดี, Nongluck Puangwanna</h1><p style='color:red'>Sample description</p> <p>Time " + moment().format() + "</p></body></html>"
            },
            Text: {
                // Charset: "utf-8",
                Data: "Hello Nongluck Puangwanna, สวัสดี"
            }
        },
        Subject: {
            Charset: "utf-8",
            Data: "(ทดสอบ) Test email from AWS"
        }
    },
    Source: "non62102@gmail.com"
};

var fnc_sendingEmail = function (inHtml, inHeader, inArrDest) {
    params.Message.Body.Html.Data = inHtml;
    params.Message.Subject.Data = inHeader;
    params.Destination.ToAddresses = [];
    inArrDest.map((email) => {
        params.Destination.ToAddresses.push(email);
    })
    ses.sendEmail(params, function (err, data) {
        if (err) console.log(err);
        else console.log(data);
    });
};

module.exports = {
    fnc_sendingEmail
};

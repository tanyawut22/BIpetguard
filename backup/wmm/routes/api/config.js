var getSMTPConfig = function () {
    var ret =
    {
        pool: true,
        host: 'email-smtp.us-west-2.amazonaws.com',
        port: 465,
        secure: true,
        auth:
        {
            user: 'AKIAIXU7RWSP4XG24HNA',
            pass: 'AjX2SbzR+5gQdh1oyEnTyge2GxlTi1Ut38UDvccYrDkt'
        }
    };
    return ret;
}

var getApiSES = function () {
    var ret =
    {
        accessKeyId: "AKIAJMCFS73HQGAMUFLA",
        secretAccessKey: "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",
        region: "us-west-2"
    };
    return ret;
}

module.exports = {
    getSMTPConfig,
    getApiSES,
    'systemEmail': 'non62102@gmail.com',
    'smtp': 'smtps://AKIAIXU7RWSP4XG24HNA:AjX2SbzR+5gQdh1oyEnTyge2GxlTi1Ut38UDvccYrDkt@email-smtp.us-west-2.amazonaws.com'
};
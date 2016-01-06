/**
 * Created by Ben on 2015/12/1.
 */
var express = require('express');
var router = express.Router();
var util = require('util');
var request = require("request");
var sha1 = require('sha1');

router.get('/', function (req, res, next) {
    var user = req.user;
    var ticketUrl = util.format('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=%s&type=jsapi', user.AccessToken);
    request(ticketUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var ticket = JSON.parse(body).ticket;
            var timestamp = new Date().getTime();
            var nonceStr = Math.random().toString(36).substr(2);
            var url = req.query.url;
            var str = util.format('jsapi_ticket=%s&noncestr=%s&timestamp=%s&url=%s', ticket, nonceStr, timestamp, url);
            var signature = sha1(str);
            var model =
            {
                AppId: user.AppId,
                Signature: signature,
                Debug: true,
                NonceStr: nonceStr,
                Timestamp: timestamp.toString(),
                //JsApiList: req.query.jsApiList
            };
            res.status(200).send(model);
        } else {
            next();
        }
    });


});

module.exports = router;
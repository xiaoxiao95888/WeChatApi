/**
 * Created by Ben on 2016/1/5.
 */
var express = require('express');
var router = express.Router();
var util = require('util');
var request = require("request");



router.get('/', function (req, res, next) {
    var user = req.user;
    var code= req.query.code;
    var getopenidurl=util.format( 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=%s&secret=%s&code=%s&grant_type=authorization_code', user.AppId, user.AppSecret,code);
    request(getopenidurl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var jsondata=  JSON.parse(body);
            getwechatuserinfo(jsondata);
        } else {
            next();
        }
    });
    function getwechatuserinfo(jsondata){
        var getwechatuserinfourl =util.format( 'https://api.weixin.qq.com/sns/userinfo?access_token=%s&openid=%s&lang=zh_CN', jsondata.access_token,jsondata.openId);
        request(getwechatuserinfourl, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var data=  JSON.parse(body);
                res.status(200).send(data);
            } else {
                next();
            }
        });
    }
});

module.exports = router;

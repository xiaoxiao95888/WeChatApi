var express = require('express');
var cors = require('cors')
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var brand = require('./routes/api/brand');
var jsapiconfig = require('./routes/api/JsApiConfig');
var wechartuserinfo= require('./routes/api/WeChartUserInfo');

var db = require("./database");
var querystring = require('querystring');
var util = require('util');
var sha1 = require('sha1');
var request = require("request");


var app = express();
app.use(cors());
//验证所有请求
// middleware to use for all requests
app.use(function (req, res, next) {
    var err = new Error('authorization failed');
    err.status = 401;
    var base64string = new Buffer(req.headers['authorization'], 'base64').toString('ascii');
    var param = querystring.parse(base64string);
    db.getUser(param.appid, function (data) {
        var timestamp = (new Date().getTime() / 1000) | 0;
        var user = data[0];
        req.user = user;
        //next();
        //return;
        //res.send('AppSecret:' + user.AppSecret + 'random:' + param.random);
        //return;
        for (var i = 0; i < 600; i++) {
            var str = util.format('appsecret=%s&random=%s&timestamp=%s', user.AppSecret, param.random, timestamp - i);
            var signature = sha1(str).toUpperCase();

            if (param.signature.toUpperCase() == signature) {
                if (user.GetAccessTokenDateTime == null || (new Date().getTime()-user.GetAccessTokenDateTime.getTime()) > 7000000) {
                    var url = util.format("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s", user.AppId, user.AppSecret);
                    request(url, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            user.AccessToken = JSON.parse(body).access_token;
                            req.user = user;
                            db.updateUser(user, next);
                            return;
                        } else {
                            next(err);
                        }
                    });
                } else {
                    next();
                    return;
                }
            }
        }
        next(err);
    });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use("/api/brand", brand);
app.use("/api/jsapiconfig", jsapiconfig);
app.use("/api/wechartuserinfo", wechartuserinfo);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.send('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

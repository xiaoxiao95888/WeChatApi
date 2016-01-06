/**
 * Created by Ben on 2015/11/30.
 */
var express = require('express');
var router = express.Router();
var db = require("./../../database");
/* GET users listing. */
router.get('/', function (req, res, next) {
    db.getBrands(function (data) {
        res.status(200).send(data);
    });
});
router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    db.getBrand(id, function (data) {
        res.status(200).send(data);
    });
});
router.post('/', function (req, res, next) {
    res.status(200).send(req.body);
});
module.exports = router;
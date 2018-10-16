var express = require('express');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var router = express.Router();
var data;
var fs = require('fs');

  /* GET home page. */
router.get('/', function(req, res, next) {
  fs.readFile('sample.json','utf8',function(err,data){  
    //console.log(data);  
    res.render('index', { title: 'Express', sample: data});
  })
});

module.exports = router;



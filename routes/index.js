var express = require('express');
var router = express.Router();
var data;
var fs = require('fs');
var strava = require('strava-v3');

strava.athlete.get({},function(err,payload,limits) {
    if(!err) {
        console.log(payload);
    }
    else {
        console.log(err);
    }
});


  /* GET home page. */
router.get('/', function(req, res, next) {
  fs.readFile('sample.json','utf8',function(err,data){  
    //console.log(data);
    res.redirect('https://www.strava.com/oauth/authorize?client_id=29429&response_type=code&redirect_uri=http://localhost:3000/');

    res.render('index', { title: 'Dashboard', sample: data});
  })
});

module.exports = router;



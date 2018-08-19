var express = require("express");
var path    = require("path");
var app     = express();

app.get('/',function(req,res){
     res.sendFile(path.join(__dirname+'/score-view.html'));
});

app.get('/score-view.js',function(req,res){
     res.sendFile(path.join(__dirname+'/score-view.js'));
});

app.get('/score-footer.js',function(req,res){
     res.sendFile(path.join(__dirname+'/score-footer.js'));
});

app.get('/score-view.css',function(req,res){
     res.sendFile(path.join(__dirname+'/score-view.css'));
});

app.listen(3000);

console.log("Running at Port 3000");
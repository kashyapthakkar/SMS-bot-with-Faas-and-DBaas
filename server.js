/*
"StAuth10065: I Kashyap Thakkar, 000742712 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else."
*/
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require("redis");


client = 
  redis.createClient(
     {url: "redis://redis-17808.c82.us-east-1-2.ec2.cloud.redislabs.com:17808"
     ,password: "IzsWGDaTb6qQS84okfLy2E0Jc0rvzBom"
     }
  );

//Keeps track of redis database
client.monitor(function (err, res) {
    console.log("Entering monitoring mode.");
});


// what to do if error when connecting to server 
client.on("error", function (err) {
    console.log("Error " + err);
});

var fs = require('fs');
var file = "api.db";
var exists = fs.existsSync(file);

//Make a new file if file doesn't exist
if(!exists){
    console.log('Creating DB file');
    fs.openSync(file,'w');
}

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);
db.serialize(function(){
    if(!exists){
      db.run('CREATE TABLE users (status text, message text, timestamp text)');
    }
});

//Gets triggered whenever redis database is updated
client.on("monitor", function (time, args, raw_reply) {
  
  if(args[1] == 'status'){
    message = JSON.parse(args[2]);
    stmt = db.prepare("INSERT INTO users VALUES (?,?,?)");
    stmt.run(message.userStatus, message.userMessage, Date().toLocaleString());
    stmt.finalize();
    io.emit('insert message', message);
  }
  
});

app.get('/dashboard', function(req, res){  
    res.sendFile(__dirname + '/dashboard.html');
 
});

io.on('connection', function(socket) {
    socket.on('sql req', function(data) {
        db.all("Select * from users", function(err, rows){
            io.emit('sql data', rows);
        });    
    });
    
    
});

http.listen(3000, function(){  console.log('listening on *:3000');});
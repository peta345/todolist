'use strict';
var app = require('app');
var BrowserWindow = require('browser-window');
var ipc = require('ipc');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

var database_file = __dirname + '/db.sqlite3'

if (fs.existsSync(database_file)) {
  var db = new sqlite3.Database(database_file);
}else{
  var db = new sqlite3.Database(database_file);
  db.run('CREATE TABLE mytable (color TEXT, text TEXT);');
}
var mainWindow = null;
// 起動
app.on('ready', function(){
    mainWindow = new BrowserWindow({ width:1200, height:700 });
    mainWindow.loadUrl('file://' + __dirname + '/index.html');
    mainWindow.on('closed', function(){
        db.close();
        mainWindow = null;
    });
});
var count = 0;
//非同期プロセス通信
ipc.on('Back_OpenDB', function(event){
  console.log("pass done" + count);
  count ++;
  //db.each('SELECT rowid AS id, color text FROM mytable', function(err, row){
  db.each('SELECT * FROM mytable', function(err, row){
    if(err) console.log("エラーです");
    //console.log(' : ' + row.color + row.text);
    console.log("rowid = " + row.ROWID);
    console.log("color = " + row.color);
    console.log("text = " + row.text);
  });
    // レンダラプロセスへsend
    //event.sender.send('async-reply', result);
});

ipc.on('Back_WriteDB', function(event, args){
  console.log("Back_WriteDB");
  console.log("args = " + args);
  console.log(args.data[0]);
  console.log(args.data[1]);
  db.run('INSERT INTO mytable VALUES ("' + args.data[0] + '","' + args.data[1] +'");');
  // db.run('INSERT INTO mytable(color) VALUES ("' + args.data[0] + '");');
  // db.run('INSERT INTO mytable(text) VALUES ("' + args.data[1] + '");');
});

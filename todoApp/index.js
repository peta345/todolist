"use strict";

const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const ipcMain = electron.ipcMain;
let mainWindow;

var database_file = __dirname + '/db.sqlite3';

if (fs.existsSync(database_file)) {
  var db = new sqlite3.Database(database_file);
}else{
  var db = new sqlite3.Database(database_file);
  db.run('CREATE TABLE mytable (id INTEGER,color TEXT, text TEXT);');
}
// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    db.close()
    app.quit();
  }
});

// Electronの初期化完了後に実行
app.on('ready', function() {
  // メイン画面の表示。ウィンドウの幅、高さを指定できる
  mainWindow = new BrowserWindow({width: 1200, height: 700});
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // ウィンドウが閉じられたらアプリも終了
  mainWindow.on('closed', function() {
    db.run('SELECT * FROM mytable ORDER BY id asc;');
    db.close()
    mainWindow = null;
  });
});

//非同期プロセス通信
ipcMain.on('Back_OpenDB', function(event){
  var result = [];
  db.each('SELECT * FROM mytable ORDER BY id ASC', function(err, row){
    if(err) console.log("エラーです");
    //console.log(' : ' + row.color + row.text);
    // console.log("rowid = " + row.ROWID);
    // console.log("color = " + row.color);
    // console.log("text = " + row.text);
    result.push(row.color);
    result.push(row.text);
    console.log(result);
  }, function(){
    console.log(result[0]);
    mainWindow.webContents.send('Back_OpenDB_reply', result);
  });
});


ipcMain.on('Back_WriteDB', function(event, args){
  db.run('INSERT INTO mytable VALUES ("' + args.data[0] + '","' + args.data[1] + '","' + args.data[2] + '");');
});

ipcMain.on('Back_DeleteDB', function(event, args){
  // console.log(word);
  // console.log(word.word);
  db.run('DELETE FROM mytable WHERE text = "' + args.word + '";');
  console.log("delete sucsess");
})

/*
 *  (C) 2018, All rights reserved. This software constitutes the trade secrets and confidential and proprietary information
 *  It is intended solely for use by Sandip Salunke. This code may not be copied or redistributed to third parties without 
 *  prior written authorization from Sandip Salunke
 */

var appl = require('express')();
var app = require('app').Server(appl);
var io = require('socket.io')(app);
var path = require('path');

var onlineUsers = [];

// Initialize application with route / (that means root of the appllication)
appl.get('/', function(req, res){
  var express=require('express');
  appl.use(express.static(path.join(__dirname)));
  res.sendFile(path.join(__dirname, '../RolChat', 'index.html'));
});

// Register events on socket connection
io.on('connection', function(socket){ 

  // Listen to chantMessage event sent by client and emit a chatMessage to the client
  socket.on('chatMessage', function(message){
    io.to(message.receiver).emit('chatMessage', message);
  });

  // Listen to notifyTyping event sent by client and emit a notifyTyping to the client
  socket.on('notifyTyping', function(sender, receiver){
    io.to(receiver.id).emit('notifyTyping', sender, receiver);
  });

  // Listen to newUser event sent by client and emit a newUser to the client with new list of online users
  socket.on('newUser', function(user){
    var newUser = {id: socket.id, name: user};
    onlineUsers.push(newUser);
    io.to(socket.id).emit('newUser', newUser);
    io.emit('onlineUsers', onlineUsers);
  });

  // Listen to disconnect event sent by client and emit userIsDisconnected and onlineUsers (with new list of online users) to the client 
  socket.on('disconnect', function(){
    onlineUsers.forEach(function(user, index){
      if(user.id === socket.id) {
        onlineUsers.splice(index, 1);
        io.emit('userIsDisconnected', socket.id);
        io.emit('onlineUsers', onlineUsers);
      }
    });
  });

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function(){
  console.log('listening on *:3000');
});
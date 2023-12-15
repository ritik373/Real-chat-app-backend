const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./user');

const router = require('./router/router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

io.on('connect', (socket) => {
  socket.on('join', ({ name, room },callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    console.log(user);

    if(error)
    {
      
      return callback(error);
    
    } 
  
      
  

    socket.join(user.room,(err)=>{
      if(err){
        console.log("show error "+ err);
        return ;
      }
    });

    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
    socket.broadcast.emit('message', { user: 'admin', text: `${user.name} has joined!` });
    socket.join(user.room);
     

  
    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
   callback();
   
  });

  socket.on('sendMessage', (message,callback) => {
    const user = getUser(socket.id);
    // console.log(user);
    io.to(user.room).emit('message', { user: user.name, text: message });
    socket.broadcast.emit('message', { user: user.name, text: message });
    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
    
  })
})



server.prependListener("request", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
 });


server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));













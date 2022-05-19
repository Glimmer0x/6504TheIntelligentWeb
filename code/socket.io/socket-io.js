
exports.init = function(io) {

  // the chat namespace
  const chat= io
      .of('/chat')
      .on('connection', function (socket) {
        try {
          /**
           * it creates or joins a room
           */
          socket.on('create or join', function (room, userId) {
            socket.join(room);
            chat.to(room).emit('joined', room, userId);
          });

          socket.on('chat', function (room, userId, chatText) {
              socket.broadcast.to(room).emit('chat', room, userId, chatText);
          });

          socket.on('draw', function (room, name, width,height, prevX, prevY, currX, currY, color, thickness) {
              // console.log('ssss')
            socket.broadcast.to(room).emit('draw', room, name, width, height, prevX, prevY, currX, currY, color, thickness);
          });

          socket.on('KG', function (room, itemId, itemName, itemRc, itemGc, borderColor) {
             // console.log('ssss')
             socket.broadcast.to(room).emit('KG', room, itemId, itemName, itemRc, itemGc, borderColor);
          });

          socket.on('disconnect', function(){
            console.log('someone disconnected');
          });
        } catch (e) {
        }
      });

  // the news namespace
  const news= io
        .of('/news')
        .on('connection', function (socket) {
      try {
        /**
         * it creates or joins a room
         */
        socket.on('create or join', function (room, userId) {
          socket.join(room);
          socket.broadcast.to(room).emit('joined', room, userId);
        });

        socket.on('disconnect', function(){
          console.log('someone disconnected');
        });
      } catch (e) {
      }
    });
}

const PORT = 5500;

let express = require('express');
let app = express();
let socket = require('socket.io');

let server = app.listen(PORT, () => {
    console.log("Server is running at http://localhost:", PORT);
});

let io = socket(server);

io.sockets.on("connection", socket => {
    console.log("New connection: ", socket.id);
    
    socket.on("create_room", () => {
        socket.join(socket.id);
        socket.player_turn = 0;
        
        let rooms = io.sockets.adapter.rooms;
        rooms[socket.id].restart = 0;
    });

    socket.on("join_room", room_code => {
        let rooms = io.sockets.adapter.rooms;

        // If the room code the user has entered is not in the valid list of rooms
        // then display an error message. Otherwise join room and start game
        if (!rooms[room_code]) {
            socket.emit("incorrect_room", room_code);
        } else {
            socket.leave(socket.id);
            socket.join(room_code);
            io.to(room_code).emit("ready");
            socket.player_turn = 1;
        }
    })
    
    socket.on("place", (col, player_turn) => {
        if (socket.player_turn == player_turn) {
            let room = Object.keys(socket.rooms)[0];
            io.to(room).emit("place", col);
        }
    });

    socket.on("poll_restart", () => {
        let room = Object.keys(socket.rooms)[0];
        let room_obj = io.sockets.adapter.rooms[room];
        room_obj.restart++;

        if (room_obj.restart == 2) {
            room_obj.restart = 0;
            io.to(room).emit("restart");
        } else {
            socket.to(room).emit("confirm_restart");
        }
    });

    socket.on("disconnecting", () => {
        let room = Object.keys(socket.rooms)[0];
        io.to(room).emit("leave");
    });

    socket.on("disconnect", () => {
        console.log("Disconnect:", socket.id);
        console.log("Rooms :", io.sockets.adapter.rooms);
    });
});

app.use(express.static("public"));

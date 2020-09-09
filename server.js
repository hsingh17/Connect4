const PORT = 5500;

let express = require('express');
let app = express();
let socket = require('socket.io');
let players = 0;

let server = app.listen(PORT, () => {
    console.log("Server is running at http://localhost:", PORT);
});

let io = socket(server);

io.sockets.on('connection', (socket) => {
    console.log("New connection: ", socket.id);
    socket.player_turn = players++;
    socket.on('place', (col, player_turn) => {
        console.log(col, player_turn, socket.player_turn);
        if (socket.player_turn == player_turn) {
            io.sockets.emit('place', col);
        }
    });

});

app.use(express.static('public'));

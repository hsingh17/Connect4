// Function to represent the board
function Game() {
    this.init_game = function() {

        // Initialize the board
        // the Board variables are declared here in the init_board function
        // so that when board is reset, if player wants to restart, 
        // all the variables are reset to defaults
        this.m = 6;
        this.n = 7;
        this.player_turn = 0;
        this.board = [];
        this.finished = false;

        // Create the internal representation of the board using a 2D-array
        for (let i = 0; i < 6; i++) {
            let row = ['@', '@', '@', '@', '@', '@', '@'];
            this.board.push(row);
        }
    }

    // Takes in as argument the column that the player wants to drop a piece into
    // and updates the internal representation of the board 
    this.place = function(col) {
        // Iterate over all the rows of the column until we reach the bottom OR
        // until we reach the furthest possible place the piece can go down in this column
        for (var i = 0; i < this.board.length; i++) {
            if (this.board[i][col] != '@') break;
        }

        if (i == 0) return false;

        // Update the color of the circle where the piece is being dropped
        if (i != 0) this.board[i-1][col] = !this.player_turn ? 'B' : 'Y';
        this.player_turn ^= 1;
        return true;
    }

    // Checks if the player whos current playing has won
    this.check_streaks = function(player) {
        
        let streaks = new Map();
        for (let i = 1; i <= 4; i++) streaks.set(i, 0);

        // Horizontal streaks
        for (let i = 0; i < this.m; i++) {
            for (let j = 0, streak = 0; j < this.n; j++) {
                let cur = this.get(i, j);
                streak = cur == player ? ++streak : streak;
                if (streak && 
                    ((cur == '@' && this.get(i+1, j) != '@') || 
                    streak == 4 || 
                    (this.get(i, j-streak-1) == '@' && this.get(i+1, j-streak-1) != '@'))) {
                    // console.log(streak, i, cur, "Horizontal");
                    streaks.set(streak, streaks.get(streak) + 1);
                }
                
                if (cur != player || streak == 4) streak = 0;
            }
        }
            
        // Vertical streaks
        for (let j = 0; j < this.n; j++) {
            for (let i = this.m-1, streak = 0; i >= 0; i--) {
                let cur = this.get(i, j);
                streak = cur == player ? ++streak : streak;
                if (streak && (cur == '@' || streak == 4)) {
                    // console.log(streak, j, "Vertical");
                    streaks.set(streak, streaks.get(streak) + 1);
                }
                if (cur != player || streak == 4) streak = 0;
            }
        }

        // ↗ Row 3 - Row 5 && Column 0 - Column 6
        for (let row = 3; row < this.m; row++) {
            let streak = 0, col = 0, i = row;
            while (i >= 0) {
                let cur = this.get(i, col);
                streak = cur == player ? ++streak : streak;
                if (streak && 
                    ((cur == '@' && this.get(i+1, col) != '@') || 
                    streak == 4 || 
                    (this.get(i+streak+1, col-streak-1) == '@' && this.get(i+streak+2, col-streak-1) != '@'))) {
                    // console.log(streak, row, "↗");
                    streaks.set(streak, streaks.get(streak) + 1);
                }

                if (cur != player || streak == 4) streak = 0;
                i--;
                col++;
            }
        }
        
        // ↗ Row 5 && Column 1 - Column 3
        for (let col = 1; col < this.n-3; col++) {
            let streak = 0, row = this.m-1, j = col;
            while (j < this.n && row >= 0) {
                let cur = this.get(row, j);
                streak = cur  == player ? ++streak : streak;
                if (streak && 
                    ((cur == '@' && this.get(row+1, j) != '@') || 
                    streak == 4 || 
                    (this.get(row+streak-1, j-streak-1) == '@' && this.get(row+streak+2, j-streak-1) != '@'))   ) {
                    // console.log(streak, col, "↗");
                    streaks.set(streak, streaks.get(streak) + 1);
                }

                if (cur != player || streak == 4) streak = 0;
                j++;
                row--;
            }
        }

        // ↖ Row 3 - Row 5 && Column 6 - Column 0
        for (let row = 3; row < this.m-1; row++) {
            let streak = 0, col = this.n-1, i = row;
            while (i >= 0) {
                let cur = this.get(i, col);
                streak = cur == player ? ++streak : streak;
                if (streak && 
                    ((cur == '@' && this.get(i+1, col) != '@') || 
                    streak == 4 || 
                    (this.get(i+streak+1, col+streak+1) == '@' && this.get(i+streak+2, col+streak+1)))) {
                    // console.log(streak, row, "↖");
                    streaks.set(streak, streaks.get(streak) + 1);
                }

                if (cur != player || streak == 4) streak = 0;
                i--;
                col--;
            }
        }

        // ↖ Row 6 && Column 6 - Column 3
        for (let col = this.n-1; col >= 3; col--) {
            let streak = 0, row = this.m-1, j = col;
            while (j >= 0 && row >= 0) {
                let cur = this.get(row, j);
                streak = cur == player ? ++streak : streak;
                if (streak && 
                    ((cur == '@' && this.get(row+1, j) != '@')|| 
                    streak == 4 ||
                    (this.get(row+streak+1, j+streak+1) == '@' && this.get(row+streak+2, j+streak+1) != '@'))) {
                    // console.log(streak, col, "↖");
                    streaks.set(streak, streaks.get(streak) + 1);
                }

                if (cur != player || streak == 4) streak = 0;
                j--;
                row--;
            }
        }

        // console.log(streaks, player == 'B' ? "Blue" : "Yellow");
        return streaks;
    }

    this.check_win = function() {
        let streaks = this.check_streaks(this.player_turn ^ 1 == 0 ? 'B' : 'Y');
        if (streaks.get(4) != 0) return true;
        return false;
    }

    this.check_tie = function() {
        // We only check the top most row of the board (
        // 0th row in our representation of the board) to see if there any
        // playable spots left (aka white circles).
        // We only check the topmost row since tie games will only occur when
        // pieces start getting to the top
        for (let i = 0; i < this.n; i++) {
            if (this.board[0][i] == '@') return false;
        }
        return true;
    }

    // Get the value (color) of board at i,j
    this.get = function(i, j) {
        if (i >= this.m || j >= this.n || i < 0 || j < 0) return '-1';
        return this.board[i][j];
    }

}

function AI(player) {
    this.LOOK_AHEAD = 4;
    this.player = player;

    // Function to simulate minimax algorithm. 
    // Takes in as arguments the current board, the current player, and K (the depth of search)
    // Return {board, col_played, heuristic_value_of_move}
    this.minimax = function (game, col_played, k=this.LOOK_AHEAD) {
        // Reach the end of the recursion tree
        if (!k) return [game, col_played, this.static_board_eval(game)];

        let moves = this.move_gen(game);
        let best_move = null;
        let best_move_col = -1;
        let best_move_h = (game.player_turn == player) ? Number.MAX_VALUE * -1 : Number.MAX_VALUE;

        // If no more moves can be made (tie game or win game) return early
        if (!moves.length) return [game, col_played, game.check_tie() ? 0 : best_move_h];

        // Apply minimax
        moves.forEach((move) => { 
            let ret = this.minimax(move[0], move[1], k-1);            
            if ((game.player_turn == this.player && Math.max(best_move_h, ret[2]) != best_move_h) ||
                (game.player_turn != this.player && Math.min(best_move_h, ret[2]) != best_move_h)) {
                [best_move, best_move_col, best_move_h] = [move[0], move[1], ret[2]];
            } 
        })

        // Case where there is no more "best move" to make (aka AI is going to lose) just return
        // first possible move that can be made
        if (best_move_col == -1) return [move[0], move[1], -1];

        return [best_move, best_move_col, best_move_h];
    }
    
    // Function that returns the heuristic value of the argument board
    this.static_board_eval = function(game) {       
        let win = game.check_win();
        let tie = game.check_tie();
        let is_AI = this.player == game.player_turn;
        
        // Since win checks the LAST PLAYER who played
        // if win is true and the current player is the AI then that means
        // the enemy has won in this game state. Otherwise, if win is true and the
        // current player is the enemy then that means the AI has won in this game state.
        if (win && !is_AI) return Number.MAX_VALUE;
        if (win && is_AI) return Number.MAX_VALUE * -1;
        if (tie) return 0;
        
        let streaks_ai = game.check_streaks('Y');
        let streaks_opp = game.check_streaks('B');

        let heuristic = 0;
        for (let i = 1; i <= 3; i++) heuristic += (Math.pow(3, i)) * (streaks_ai.get(i) - streaks_opp.get(i));

        return heuristic;
    }

    // Function that generates all moves that can be made from where board currently is
    this.move_gen = function(game) {
        if (game.check_win() || game.check_tie()) return [];
        moves = [];
        for (let i = 0; i < game.n; i++) {
            move = [_.cloneDeep(game), i];
            if (move[0].place(i)) moves.push(move);
        }
        return moves;
    }
}

function ViewHandler(game) {
    this.hit_boxes = [];
    this.game = game;
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.dpi = window.devicePixelRatio;
    this.socket = null;

    this.init = function() {
        document.getElementById("game").style.display = "flex";
        document.getElementById("menu").style.display = "none";
    
        this.canvas.width = window.innerWidth * this.dpi;
        this.canvas.height = window.innerHeight * this.dpi;
        this.canvas.style.width = "" + window.innerWidth + "px";
        this.canvas.style.height = "" + window.innerHeight + "px";
        this.ctx.scale(this.dpi, this.dpi);
        
        // Initialize the hit boxes for the game.
        // Makes it easy to see what column the player wants to drop their piece
        let x = 1, y = 1, w = window.innerWidth / 7, h = window.innerHeight;
        for (let i = 0; i < 7; i++) {
            let x_i = x + i * w;
            this.hit_boxes.push([x_i, y, w, h]);
        }

        // Mouse move event to allow for highlighting of the column the player
        // is currently hovering over
        this.canvas.addEventListener("mousemove", e => {
            if (this.game.finished) return;
            let col = this.check_mouse(e.clientX, e.clientY);
            if (col >= 0) {
                this.draw_hover(col);
                this.draw();    
            }
        });

        // Click event to drop the piece in the column the player has clicked on
        this.canvas.addEventListener("click", e => {
            if (this.game.finished) return;
            let col = this.check_mouse(e.clientX, e.clientY);
            if (col >= 0) {
                if (this.socket) {
                    this.socket.emit("place", col, this.game.player_turn);
                } else {
                    this.game.place(col);
                    this.draw();
                }
            }
        });

        // Set onclick event for restart button to resetting the board
        let restart_button = document.getElementById("restart");
        restart_button.addEventListener("click", e => {
            if (this.socket) {
                if (!restart_button.textContent.endsWith("(1/2)")) {
                    restart_button.textContent += "(1/2)";
                    restart_button.disabled = true;                    
                }
                
                this.socket.emit("poll_restart");
            } else {
                this.game.init_game();
                document.getElementById("end-screen").style.display = "none";
                this.draw();
            }
        });

        // Set onclick event for home button to go back to home screen
        let home = document.getElementById("home");
        home.addEventListener("click", e => {
            document.getElementById("game").style.display = "none";
            document.getElementById("menu").style.display = "flex";
            document.getElementById("end-screen").style.display = "none";
            if (this.socket) this.socket.disconnect();
        });
    }

    // Function checks the player's mouse x and y to determine if it within a valid column
    this.check_mouse = function(user_x, user_y) {
        for (let i = 0; i < 7; i++) {
            let rectangle = this.hit_boxes[i];
            let x = rectangle[0], y = rectangle[1], w = rectangle[2], h = rectangle[3];
            if ((x+w) >= user_x && user_x >= x && (y+h) >= user_y && user_y >= y) return i;
        }
        return -1;
    }

    // Draws the board to the screen
    this.draw = function() {
        let x = 1, y = 1, w = window.innerWidth / 7, h = window.innerHeight;
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                this.ctx.beginPath();

                let piece = this.game.get(i, j);
                if (piece == '@') this.ctx.fillStyle = "#FFFFFF";
                else if (piece == 'B') this.ctx.fillStyle = "#5DEED6";
                else this.ctx.fillStyle = "#FFC300";

                this.ctx.lineWidth = 2;
                this.ctx.arc(x + (2*j+1) * (w/2), y + (2*i+1) * (h / 12), h / (12 * this.dpi), 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.stroke();
            }
        }
    }
    
    // Highlights the column that the player is currently hovering over
    this.draw_hover = function(col) {
        for (let i = 0; i < 7; i++) {
            let rect = this.hit_boxes[i];
            let rect_x = rect[0], rect_y = rect[1], rect_w = rect[2], rect_h = rect[3];
            this.ctx.beginPath();
            this.ctx.rect(rect_x, rect_y, rect_w, rect_h);
            if (i == col) this.ctx.fillStyle = "#CCCCCC";
            else this.ctx.fillStyle = "#FFFFFF";
            this.ctx.fill();
        }
    }

    // Draws the postgame screen
    this.draw_finish_screen = function(win) {
        // Display the end screen and blur the background
        document.getElementById("end-screen").style.display = "block";

        // Display at the top who won or if it was a tie
        let winner_text = document.getElementById("winner-1");
        if (win) {
            winner_text.textContent =  this.game.player_turn == 1 ? "Blue" : "Yellow";
            winner_text.style.color = this.game.player_turn == 1 ? "blue" : "gold";
        } else {
            winner_text.textContent = "Tie"
            document.getElementById("winner-2").style.display = "none";
        }
   }
   
   // Display online options screen
   this.display_online = function() {
       document.getElementById("game").style.display = "none";
       document.getElementById("menu").style.display = "none";
       let online_options = document.getElementById("online-options");
       online_options.style.display = "flex";
       
       document.getElementById("create").addEventListener("click", e => {
           online_options.style.display = "none";   
           let create_lobby = document.getElementById("create-lobby");
           create_lobby.style.display = "flex"; 

           let lobby_code = document.getElementById("lobby-code");
           lobby_code.textContent = this.socket.id;
           lobby_code.style.color = "#FFFFFF";
           lobby_code.style.fontSize = "30px";
           lobby_code.style.fontFamily = "Teko, sans-serif";

           let copy_code = document.getElementById("copy-code");
           copy_code.addEventListener("click", e => {
               let temp_input = document.createElement("input");
               temp_input.value = lobby_code.textContent;
               document.body.appendChild(temp_input);
               temp_input.select();
               document.execCommand("copy");
               document.body.removeChild(temp_input);
           });

           this.socket.emit("create_room");
        });

        document.getElementById("join").addEventListener("click", e => {            
            online_options.style.display = "none";

            let join_lobby = document.getElementById("join-lobby");
            join_lobby.style.display = "flex";

            let input_code = document.getElementById("input-code");
            input_code.addEventListener("keydown", e => {
                if (e.code == "Enter") this.socket.emit("join_room", e.target.value);
            });
        });
   }

   this.display_error = function(error_type, error_msg) {   
       // Display the main menu screen again if error type is 0 aka disconnect
       if (!error_type) {
           document.getElementById("game").style.display = "none";
           document.getElementById("menu").style.display = "flex";
           document.getElementById("end-screen").style.display = "none";
       }
       
       // Disconnect button is made visible and the messages fades out
       let error_div = document.getElementById("error");
       error_div.textContent = error_msg;
       error_div.style.visibility = "visible";
       
       setTimeout(() => {
           error_div.style.transition = "1s";
           error_div.style.visibility = "hidden";    
       }, 1000);
   }

   this.init_socket = function() {
       this.socket = io.connect("http://localhost:5500");

       this.display_online();

       this.socket.on("place", (col) => {
           this.game.place(col);
           this.draw();
       });
       
       this.socket.on("ready", () => {
           document.getElementById("create-lobby").style.display = "none";
           document.getElementById("join-lobby").style.display = "none";
           document.getElementById("game").style.display = "flex";
        });

       this.socket.on("confirm_restart", () => {
           document.getElementById("restart").textContent += " (1/2)";
       });

       this.socket.on("restart", () => {
           document.getElementById("restart").textContent = "Restart";
           document.getElementById("restart").disabled = false;
           this.game.init_game();
           document.getElementById("end-screen").style.display = "none";
           this.draw();
       });

       this.socket.on("leave", () => {
           this.display_error(0, "The opposing player has disconnected!");
           this.socket.disconnect();
       });

       this.socket.on("incorrect_room", room_code => {
           this.display_error(1, room_code + " is not a valid room code!");
       });
   }
}

function start_game(game_mode) {    
    let ai = null;
    if (game_mode == 1) ai = new AI(1);

    let game = new Game();
    let view = new ViewHandler(game, game_mode);
    
    game.init_game();
    view.init();
    view.draw();   
    if (!game_mode) view.init_socket();
    setInterval(loop, 100);
    
    function loop() {
        // If there is a winner, do not update the board
        if (game.finished) return;
        
        // If there is a winner or tie game, draw the final board to the screen
        // and show the results screen
        let win = game.check_win();
        let tie = game.check_tie();
        if (win || tie) {
            game.finished = true;
            view.draw();  
            view.draw_finish_screen(win);                      
        } 

        // If the gamemode being played is vs AI and its the AI's turn
        // then calculate the best move for the AI;
        if (game_mode == 1 && game.player_turn == ai.player) {
            let ret = ai.minimax(game, -1);
            game.place(ret[1]);
            view.draw();
        } 
    }
}



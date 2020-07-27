// Function to represent the board
function Board() {
    this.init_board = function() {
        // Initialize the board
        // the Board variables are declared here in the init_board function
        // so that when board is reset, if player wants to restart, 
        // all the variables are reset to defaults
        this.m = 6;
        this.n = 7;
        this.player_turn = 0;
        this.board = [];
        this.last_row = -1;
        this.last_col = -1;
        this.finished = false;

        // Create the internal representation of the board
        // using a 2D-array
        for (let i = 0; i < 6; i++) {
            let row = ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"];
            this.board.push(row);
        }
    }

    // Takes in as argument the column that the player wants to drop a piece into
    // and updates the internal representation of the board 
    this.place = function(col) {
        // Iterate over all the rows of the column until we reach the bottom OR
        // until we reach the furthest possible place the piece can go down in this column
        for (var i = 0; i < this.board.length; i++) {
            if (this.board[i][col] != "#FFFFFF") break;
        }

        if (i == 0) return false;

        // Update the color of the circle where the piece is being dropped
        if (i != 0) this.board[i-1][col] = !this.player_turn ? "#5DEED6" : "#FFC300";
        this.last_row = i-1;
        this.last_col = col;
        this.player_turn ^= 1;
        return true;
    }

    // Checks if the player whos current playing has won
    this.check_win = function() {
        // This condition is for the beginning of the game, when no pieces are dropped
        if (this.last_row == -1 || this.last_col == -1) return false;
        
        // This is necessary since I update players turn when they place a piece
        // so when we check win, we actually want to check if the last player won
        let prev_player = (this.player_turn ^ 1) == 0 ? "#5DEED6" : "#FFC300";

        // Horizontal win
        for (let col = 0, streak = 0; col < this.n; col++) {
            streak = this.board[this.last_row][col] == prev_player ? ++streak : 0;
            if (streak == 4) return true;
        }
            
        // Vertical win
        for (let row = this.m-1, streak = 0; row >= 0; row--) {
            streak = this.board[row][this.last_col] == prev_player ? ++streak : 0;
            if (streak == 4) return true;
        }

        // Diagonal win that goes from left to right (checking from 3rd row to 6th row from 0th col)
        for (let row = 3; row < this.m; row++) {
            let streak = 0, col = 0, i = row;
            while (i >= 0) {
                streak = this.board[i][col] == prev_player ? ++streak : 0;
                if (streak == 4) return true;
                i--;
                col++;
            }
        }
        
        // Diagonal win that goes from left to right (checking from 1st col to 7th col from bottom row)
        for (let col = 0; col < this.n; col++) {
            let streak = 0, row = this.m-1, j = col;
            while (j < this.n && row >= 0) {
                streak = this.board[row][j] == prev_player ? ++streak : 0;
                if (streak == 4) return true;
                j++;
                row--;
            }
        }

        // Diagonal win that goes from right to left (checking from 3rd row to 6th row from 6th col)
        for (let row = 3; row < this.m; row++) {
            let streak = 0, col = this.n-1, i = row;
            while (i >= 0) {
                streak = this.board[i][col] == prev_player ? ++streak : 0;
                if (streak == 4) return true;
                i--;
                col--;
            }
        }

        // Diagonal win that goes from right to left (checking 7th col to 1st col from bottom row)
        for (let col = this.n-1; col >= 0; col--) {
            let streak = 0, row = this.m-1, j = col;
            while (j >= 0 && row >= 0) {
                streak = this.board[row][j] == prev_player ? ++streak : 0;
                if (streak == 4) return true;
                j--;
                row--;
            }
        }
    }

    this.check_tie = function() {
        // We only check the top most row of the board (
        // 0th row in our representation of the board) to see if there any
        // playable spots left (aka white circles).
        // We only check the topmost row since tie games will only occur when
        // pieces start getting to the top
        for (let i = 0; i < this.n; i++) {
            if (this.board[0][i] == "#FFFFFF") return false;
        }
        return true;
    }

    // Get the value (color) of board at i,j
    this.get = function(i, j) {
        return this.board[i][j];
    }
}

// function AI(player) {
//     this.LOOK_AHEAD = 2;
//     this.player = player;
//     // Function to simulate minimax algorithm. 
//     // Takes in as arguments the current board, the current player, and K (the depth of search)
//     // Return {board, col_played, heuristic_value_of_move}
//     this.minimax = function (board, col_last_played, k=this.LOOK_AHEAD) {
//         if (!k) return [board, col_last_played, this.static_board_eval(board)];

//         let moves = this.move_gen(board);
//         let best_move = null;
//         let best_move_col = -1;
//         let best_move_h = (board.player_turn == player) ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
//         moves.forEach((move) => {
//             let ret = this.minimax(move[0], move[1], k-1);
//             if ((board.player_turn == this.player && Math.max(best_move_h, ret[2] == ret[2])) ||
//                 (board.player_turn != this.player && Math.min(best_move_h, ret[2]) == ret[2])) {
//                 [best_move, best_move_col, best_move_h] = [move[0], move[1], ret[2]];
//             } 
//         })
//         return [best_move, best_move_col, best_move_h];
//     }
    
//     // Function that returns the heuristic value of the arugment board
//     this.static_board_eval = function(board) {
//         function streaks(board, player) {
//             let player_color = !player ? "#5DEED6" : "#FFC300";
//             let enemy_color = !player ? "#FFC300" : "#5DEED6";
//             let streaks = new Map(), blocks = new Map();
//             // Set initial entries in maps
//             for (let i = 1; i <= 3; i++) {
//                 streaks.set(i, 0);
//                 blocks.set(i, 0);
//             }

//             // Horizontal streaks 
//             // TODO: replace with for each loop so it looks nicer
//             for (let i  = 0; i < board.m; i++) {
//                 for (let j = 0, streak = 0; j < board.n; j++) {
//                     streak = board.board[i][j].color == player_color ? ++streak : streak;
//                     if ((board.board[i][j].color != player_color && streak > 0) || (j == board.n-1 && streak > 0)) {
//                         // Check if this streak is an actual playable streak and not being blocked in by enemy pieces
//                         if (!(j-streak-1 < 0 && board.board[i][j].color == enemy_color) && 
//                         !(board.board[i][j].color == enemy_color && board.board[i][j-streak-1].color == enemy_color)) {
//                             streaks.set(streak, streaks.get(streak) + 1);
//                         }
//                         streak = 0;
//                     }
//                 } 
//             }

//             console.log(streaks, player_color);

//             // Vertical streaks
//         }
        
//         let win = board.check_win();
//         let tie = board.check_tie();
//         let is_AI = this.player == board.player_turn;
        
//         if (win && !is_AI) return Math.NEGATIVE_INFINITY;
//         if (win && is_AI) return Math.POSITIVE_INFINITY;
//         if (tie) return 0;
//         streaks(board, board.player_turn ^ 1);

//     }

//     // Function that generates all moves that can be made from where board currently is
//     this.move_gen = function(board) {
//         moves = [];
//         for (let i = 0; i < board.n; i++) {
//             move = [_.clone(board), i];
//             if (move[0].update_board(i)) moves.push(move);
//         }
//         return moves;
//     }
// }

function ViewHandler(board) {
    this.hit_boxes = [];
    this.board = board;
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.dpi = window.devicePixelRatio;

    this.init = function() {
        document.getElementById("game").style.display = "block";
        document.getElementById("menu").style.display = "none";
    
        this.canvas.width = window.innerWidth * this.dpi;
        this.canvas.height = window.innerHeight * this.dpi;
        this.canvas.style.width = "" + (window.innerWidth) + "px";
        this.canvas.style.height = "" + (window.innerHeight) + "px";
        this.ctx.scale(this.dpi,this.dpi);

        let r = this.canvas.width / (60 * window.devicePixelRatio);
        let x = 560-r, y = 110-r, w = 2*r, h = 12*r + 50;
        for (let i = 0; i < 7; i++) {
            let x_i = x + i * (w + 9);
            this.ctx.beginPath();
            this.ctx.rect(x_i, y, w, h);
            this.ctx.fillStyle = "#FF0000";
            this.ctx.stroke();
            this.hit_boxes.push([x_i, y, w, h]);
        }

        this.canvas.addEventListener('click', e => {
            if (this.check_click(e.clientX, e.clientY)) this.draw();
        });
        
        // Hide post game screen
        this.canvas.addEventListener('keydown', (e) => {
            if (e.keyCode == 72) {
                document.getElementById("end-screen").style.display = "none";
            }
        })
    }

    this.check_click = function(user_x, user_y) {
        for (let i = 0; i < 7; i++) {
            let rectangle = this.hit_boxes[i];
            let x = rectangle[0], y = rectangle[1], w = rectangle[2], h = rectangle[3];
            if ((x+w) >= user_x && user_x >= x && (y+h) >= user_y && user_y >= y) {
                board.place(i);
                return true;
            }
        }
        return false;
    }

    this.draw = function() {
        for (let i = 1; i <= 6; i++) {
            for (let j = 1; j <= 7; j++) {
                this.ctx.beginPath();
                this.ctx.fillStyle = this.board.get(i-1, j-1);
                this.ctx.lineWidth = 2;
                this.ctx.arc((j * 60) + 500, (i * 60) + 50, canvas.width / (60 * window.devicePixelRatio), 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.stroke();
            }
        }
    }

    this.draw_finish_screen = function(win) {
        // Display the end screen and blur the background
        document.getElementById("end-screen").style.display = "block";
        document.getElementById("blur").style.display = "block";
        
        // Set onclick event of restart button to resetting the board
        // TODO: Possibly find a fix for this.
        let restart_button = document.getElementById("restart");
        restart_button.addEventListener('click', e => {
            console.log("reset");
            this.board.init_board();
            document.getElementById("end-screen").style.display = "none";
            document.getElementById("blur").style.display = "none";    
        })

        // Display at the top who won or if it was a tie
        let winner_text = document.getElementById("winner-1");
        if (win) {
            winner_text.textContent =  this.board.player_turn == 1 ? "Blue" : "Yellow";
            winner_text.style.color = this.board.player_turn == 1 ? "blue" : "gold";
        } else {
            winner_text.textContent = "Tie"
            document.getElementById("winner-2").style.display = "none";
        }
    }
}

function start_game(game_mode) {    
    let board = new Board();
    let view = new ViewHandler(board);
    board.init_board();
    view.init();
    setInterval(loop, 100);

    function loop() {
        // If there is a winner, do not update the board
        if (board.finished) return;
        
        // Draw the circles to the screen
        view.draw();
        // If there is a winner or tie game, draw the final board to the screen
        // and show the results screen
        let win = board.check_win();
        let tie = board.check_tie();
        if (win || tie) {
            board.finished = true;
            view.draw();  
            view.draw_finish_screen(win);                      
        } 
    }
}


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
        // this.last_row = -1;
        // this.last_col = -1;
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
            if (this.board[i][col] != "@") break;
        }

        if (i == 0) return false;

        // Update the color of the circle where the piece is being dropped
        if (i != 0) this.board[i-1][col] = !this.player_turn ? 'B' : 'Y';
        // this.last_row = i-1;
        // this.last_col = col;
        this.player_turn ^= 1;
        return true;
    }

    // Checks if the player whos current playing has won
    this.gen_streaks = function(player) {
        // This condition is for the beginning of the game, when no pieces are dropped
        if (this.last_row == -1 || this.last_col == -1) return false;
        
        let streaks = new Map();
        for (let i = 1; i <= 4; i++) streaks.set(i, 0);

        // Horizontal streaks
        for (let i = 0; i < this.m; i++) {
            for (let j = 0, streak = 0; j < this.n; j++) {
                let cur = this.board[i][j];
                streak = cur == player ? ++streak : streak;
                if (streak && (cur == '@' || streak == 4 || (j == this.n-1 && this.board[i][j-streak-1] == '@'))) {
                    // console.log(streak, i, cur, "Horizontal");
                    streaks.set(streak, streaks.get(streak) + 1);
                }
                
                if (cur != player) streak = 0;
            }
        }
            
        // Vertical streaks
        for (let j = 0; j < this.n; j++) {
            for (let i = this.m-1, streak = 0; i >= 0; i--) {
                let cur = this.board[i][j];
                streak = cur == player ? ++streak : streak;
                if (streak && (cur == '@' || streak == 4)) {
                    // console.log(streak, j, "Vertical");
                    streaks.set(streak, streaks.get(streak) + 1);
                }
                if (cur != player) streak = 0;
            }
        }

        // ↗ Row 3 - Row 5 && Column 0 - Column 6
        for (let row = 3; row < this.m; row++) {
            let streak = 0, col = 0, i = row;
            while (i >= 0) {
                let cur = this.board[i][col];
                streak = cur == player ? ++streak : streak;
                if (streak && (cur == '@' || streak == 4 || (col-streak-1 >= 0 && row+streak+1 < this.m && this.board[row+streak+1][col-streak-1] == '@'))) {
                    // console.log(streak, row, "↗");
                    streaks.set(streak, streaks.get(streak) + 1);
                }

                if (cur != player) streak = 0;
                i--;
                col++;
            }
        }
        
        // ↗ Row 5 && Column 1 - Column 3
        for (let col = 1; col < this.n-3; col++) {
            let streak = 0, row = this.m-1, j = col;
            while (j < this.n && row >= 0) {
                let cur = this.board[row][j];
                streak = cur  == player ? ++streak : streak;
                if (streak && (cur == '@' || streak == 4 || (j-streak-1 >= 0 && row+streak-1 < this.m && this.board[row+streak-1][j-streak-1] == '@'))) {
                    // console.log(streak, col, "↗");
                    streaks.set(streak, streaks.get(streak) + 1);
                }

                if (cur != player) streak = 0;
                j++;
                row--;
            }
        }

        // ↖ Row 3 - Row 5 && Column 6 - Column 0
        for (let row = 3; row < this.m-1; row++) {
            let streak = 0, col = this.n-1, i = row;
            while (i >= 0) {
                let cur = this.board[i][col];
                streak = cur == player ? ++streak : streak;
                if (streak && (cur == '@' || streak == 4 || (col+streak+1 < this.n && i+streak+1 < this.m && this.board[i+streak+1][col+streak+1] == '@'))) {
                    // console.log(streak, row, "↖");
                    streaks.set(streak, streaks.get(streak) + 1);
                }

                if (cur != player) streak = 0;
                i--;
                col--;
            }
        }

        // ↖ Row 6 && Column 6 - Column 3
        for (let col = this.n-1; col >= 3; col--) {
            let streak = 0, row = this.m-1, j = col;
            while (j >= 0 && row >= 0) {
                let cur = this.board[row][j];
                streak = cur == player ? ++streak : streak;
                if (streak && (cur == '@' || streak == 4 ||(j+streak+1 < this.n && row+streak+1 < this.m && this.board[row+streak+1][j+streak+1] == '@'))) {
                    // console.log(streak, col, "↖");
                    streaks.set(streak, streaks.get(streak) + 1);
                    streak = 0;
                }

                if (cur != player) streak = 0;
                j--;
                row--;
            }
        }

        console.log(streaks, player == 'B' ? "Blue" : "Yellow");
        return streaks;
    }

    this.check_win = function() {
        let streaks = this.gen_streaks(this.player_turn ^ 1 == 0 ? 'B' : 'Y');
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
        if (i >= this.m || j >= this.n) return '-1';
        return this.board[i][j];
    }
}

function AI(player) {
    this.LOOK_AHEAD = 2;
    this.player = player;
    // Function to simulate minimax algorithm. 
    // Takes in as arguments the current board, the current player, and K (the depth of search)
    // Return {board, col_played, heuristic_value_of_move}
    this.minimax = function (board, k=this.LOOK_AHEAD) {
        if (!k) return [board, col_last_played, this.static_board_eval(board)];

        let moves = this.move_gen(board);
        let best_move = null;
        let best_move_col = -1;
        let best_move_h = (board.player_turn == player) ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
        moves.forEach((move) => { 
            let ret = this.minimax(move[0], move[1], k-1);
            if ((board.player_turn == this.player && Math.max(best_move_h, ret[2] == ret[2])) ||
                (board.player_turn != this.player && Math.min(best_move_h, ret[2]) == ret[2])) {
                [best_move, best_move_col, best_move_h] = [move[0], move[1], ret[2]];
            } 
        })
        return [best_move, best_move_col, best_move_h];
    }
    
    // Function that returns the heuristic value of the argument board
    this.static_board_eval = function(board) {       
        let win = board.check_win();
        let tie = board.check_tie();
        let is_AI = this.player == board.player_turn;
        
        if (win && !is_AI) return Math.NEGATIVE_INFINITY;
        if (win && is_AI) return Math.POSITIVE_INFINITY;
        if (tie) return 0;

        streaks(board, board.player_turn ^ 1);
    }

    // Function that generates all moves that can be made from where board currently is
    this.move_gen = function(board) {
        moves = [];
        for (let i = 0; i < board.n; i++) {
            move = [_.clone(board), i];
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

    this.init = function() {
        document.getElementById("game").style.display = "flex";
        document.getElementById("menu").style.display = "none";
    
        this.canvas.width = window.innerWidth * this.dpi;
        this.canvas.height = window.innerHeight * this.dpi;
        this.canvas.style.width = "" + window.innerWidth + "px";
        this.canvas.style.height = "" + window.innerHeight + "px";
        this.ctx.scale(this.dpi, this.dpi);
        
        let x = 1, y = 1, w = window.innerWidth / 7, h = window.innerHeight;
        for (let i = 0; i < 7; i++) {
            let x_i = x + i * w;
            this.ctx.beginPath();
            this.ctx.rect(x_i, y, w, h);
            this.ctx.strokeStyle = "#000000";
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
                game.place(i);
                return true;
            }
        }
        return false;
    }

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

    this.draw_finish_screen = function(win) {
        // Display the end screen and blur the background
        document.getElementById("end-screen").style.display = "block";
        
        // Set onclick event of restart button to resetting the board
        // TODO: Possibly find a fix for this.
        let restart_button = document.getElementById("restart");
        restart_button.addEventListener('click', e => {
            console.log("reset");
            this.game.init_game();
            document.getElementById("end-screen").style.display = "none";
            this.draw();
        })

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
}

function start_game(game_mode) {    
    let game = new Game();
    let view = new ViewHandler(game);
    let ai = null;
    if (game_mode ==  1) {
        ai = new AI(1);
        console.log("AI created!");
    }

    game.init_game();
    view.init();
    view.draw();
    setInterval(loop, 100);

    function loop() {
        // If there is a winner, do not update the board
        if (game.finished) return;
        
        // ai.static_board_eval();
	    // Draw the circles to the screen
        // If there is a winner or tie game, draw the final board to the screen
        // and show the results screen
        let win = game.check_win();
        let tie = game.check_tie();
        if (win || tie) {
            game.finished = true;
            view.draw();  
            view.draw_finish_screen(win);                      
        } 
    }
}65



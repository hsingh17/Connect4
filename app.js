// Function to represent a circle/pieceon the board
function Circle(i, j) {
    this.col = j-1
    this.x = ((j * 60) + 500) 
    this.y  = ((i * 60) + 50) 
    this.r = canvas.width / (60 * window.devicePixelRatio)
    this.start_angle = 0;
    this.end_angle = 2 * Math.PI
    this.color = "#FFFFFF"

    // Draws circle to the screen
    this.draw = function() {
        let canvas = document.getElementById("canvas")
        let ctx = canvas.getContext('2d')
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.arc(this.x, this.y, this.r, this.start_angle, this.end_angle)
        ctx.lineWidth = 2;
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
    }

    // Check if the client's mouse is in a valid position to drop a piece
    // If the circle is already occupied then automatically return false
    this.check_hit = function(x, y) {
        if (this.color != "#FFFFFF") return false

        let dist = Math.sqrt((this.x-x) ** 2 + (this.y-y) ** 2)
        if (dist < this.r) return true
        else return false
    }
}

// Function to represent the board
function Board() {
    this.init_board = function() {
        // Initialize the board
        // the Board variables are declared here in the init_board function
        // so that when board is reset, if player wants to restart, 
        // all the variables are reset to defaults
        this.m = 6
        this.n = 7  
        this.player_turn = 0
        this.board = []
        this.last_row = -1
        this.last_col = -1
        this.finished = false 

        // Create the internal representation of the board
        // using a 2D-array
        for (let i = 1; i <= 6; i++) {
            let row = []
            for (let j = 1; j <= 7; j++) {
                row.push(new Circle(i, j))
            }
            this.board.push(row)
        }
    }

    // Draws board to screen
    this.draw = function() {
        // Draw circles to screen
        this.board.forEach((row) => {
            row.forEach((circle) => {
                circle.draw()
            })
        })
    }

    // Takes in as argument the column that the player wants to drop a piece into
    // and updates the internal representation of the board 
    this.update_board = function(col) {
        // Iterate over all the rows of the column until we reach the bottom OR
        // until we reach the furthest possible place the piece can go down in this column
        for (var i = 0; i < this.board.length; i++) {
            if (this.board[i][col].color != "#FFFFFF") break
        }

        if (i == 0) return false

        // Update the color of the circle where the piece is being dropped
        if (i != 0) this.board[i-1][col].color = this.player_turn == 0 ? "#5DEED6" : "#FFC300"
        this.last_row = i-1
        this.last_col = col
        this.player_turn ^= 1
        return true
    }

    // Takes in as args the x,y positions of the client's mouse 
    // and checks if any of the circles have been hit. If they have
    // drop a piece in that column 
    this.place = function(x, y) {
        this.board.forEach((row) => {
            row.forEach((circle) => {
                if (circle.check_hit(x, y)) this.update_board(circle.col)
            })
        })
    }     

    // Checks if the player whos current playing has won
    this.check_win = function() {
        // This condition is for the beginning of the game, when no pieces are dropped
        if (this.last_row == -1 || this.last_col == -1) return false
        
        // This is necessary since I update players turn when they place a piece
        // so when we check win, we actually want to check if the last player won
        let prev_player = (this.player_turn ^ 1) == 0 ? "#5DEED6" : "#FFC300"

        // Horizontal win
        for (let col = 0, streak = 0; col < this.n; col++) {
            streak = this.board[this.last_row][col].color == prev_player ? ++streak : 0
            if (streak == 4) return true
        }
            
        // Vertical win
        for (let row = this.m-1, streak = 0; row >= 0; row--) {
            streak = this.board[row][this.last_col].color == prev_player ? ++streak : 0
            if (streak == 4) return true
        }

        // Diagonal win that goes from left to right (checking from 3rd row to 6th row from 0th col)
        for (let row = 3; row < this.m; row++) {
            let streak = 0, col = 0, i = row
            while (i >= 0) {
                streak = this.board[i][col].color == prev_player ? ++streak : 0
                if (streak == 4) return true
                i--
                col++
            }
        }
        
        // Diagonal win that goes from left to right (checking from 1st col to 7th col from bottom row)
        for (let col = 0; col < this.n; col++) {
            let streak = 0, row = this.m-1, j = col
            while (j < this.n && row >= 0) {
                streak = this.board[row][j].color == prev_player ? ++streak : 0
                if (streak == 4) return true
                j++
                row--
            }
        }

        // Diagonal win that goes from right to left (checking from 3rd row to 6th row from 6th col)
        for (let row = 3; row < this.m; row++) {
            let streak = 0, col = this.n-1, i = row
            while (i >= 0) {
                streak = this.board[i][col].color == prev_player ? ++streak : 0
                if (streak == 4) return true
                i--
                col--
            }
        }

        // Diagonal win that goes from right to left (checking 7th col to 1st col from bottom row)
        for (let col = this.n-1; col >= 0; col--) {
            let streak = 0, row = this.m-1, j = col
            while (j >= 0 && row >= 0) {
                streak = this.board[row][j].color == prev_player ? ++streak : 0
                if (streak == 4) return true
                j--
                row--
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
            if (this.board[0][i].color == "#FFFFFF") return false
        }

        return true
    }

    // Resets the board to initial state. Used when restarting game
    this.reset_board = function() {     
        this.init_board()
        document.getElementById("end-screen").style.display = "none"
        document.getElementById("blur").style.display = "none"
    }
}

function AI() {
    this.look_ahead = 5
    this.piece_color = "#FFC300"
    // Top level function for AI making a move.
    // Returns the column that the AI will drop in
    this.make_move = function() {
        // Function to simulate minimax algorithm. 
        // Takes in as arguments the current board, the current player, and K (the depth of search)
        // Return {board, heuristic_value_of_move}
        function minimax(board, k) {
            if (!k) return [board, this.static_board_eval(board)]

            moves = this.move_gen(board)
            moves.forEach((move) => {

            })
        }

    }
    
    // Function that returns the heuristic value of the arugment board
    this.static_board_eval = function(board) {
        return true
    }

    // Function that generates all moves that can be made from where board currently is
    this.move_gen = function(board) {
        moves = []
        for (let i = 0; i < board.n; i++) {
            move = _.cloneDeep(board)
            if (move.update_board(i)) moves.push(move)
        }
        return moves
    }
}

function start_game() {
    var canvas = document.getElementById('canvas')
    /** @type {CanvasRenderingContext2D} */
    var ctx = canvas.getContext('2d')
    var dpi = window.devicePixelRatio

    document.getElementById("game").style.display = "block"
    document.getElementById("menu").style.display = "none"

    canvas.width = window.innerWidth * dpi
    canvas.height = window.innerHeight * dpi
    canvas.style.width = "" + (window.innerWidth) + "px"
    canvas.style.height = "" + (window.innerHeight) + "px"
    ctx.scale(dpi,dpi)

    let board = new Board()
    let ai = new AI()
    board.init_board()
    setInterval(loop, 100)

    function loop(game_mode) {
        // If there is a winner, do not update the board
        if (board.finished) return
        
        // Draw the circles to the screen
        board.draw()
        // If there is a winner or tie game, draw the final board to the screen
        // and show the results screen
        let win = board.check_win()
        let tie = board.check_tie()
        if (win || tie) {
            board.finished = true
            board.draw()
            
            // Display the end screen and blur the background
            document.getElementById("end-screen").style.display = "block"
            document.getElementById("blur").style.display = "block"
            
            // Set onclick event of restart button to resetting the board
            // TODO: Possibly find a fix for this.
            let restart_button = document.getElementById("restart")
            restart_button.onclick = function() {
                board.reset_board()
            }

            // Display at the top who won or if it was a tie
            let winner_text = document.getElementById("winner-1")
            if (win) {
                winner_text.textContent =  board.player_turn == 1 ? "Blue" : "Yellow"
                winner_text.style.color = board.player_turn == 1 ? "blue" : "gold   "
            } else {
                winner_text.textContent = "Tie"
                document.getElementById("winner-2").style.display = "none"
            }
            
        } 
    }

    // event handler on canvas to check for clicks on page
    canvas.addEventListener('click', (e) => {
        // Place a piece on the board if it is valid
        board.place(e.clientX, e.clientY)
    })

    // Manual reset for debugging *REMOVE*
    canvas.addEventListener('keydown', (e) => {
        if (e.keyCode == 82) {
            board.reset_board()
        }
    })

    // Hide post game screen
    canvas.addEventListener('keydown', (e) => {
        if (e.keyCode == 72) {
            document.getElementById("end-screen").style.display = "none"
        }
    })
}


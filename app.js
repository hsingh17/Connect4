// Function to represent a circle/pieceon the board
function Circle(i, j) {
    this.col = j-1
    this.x = (j * 60) + 500
    this.y  = i * 60
    this.r = canvas.width / 56
    this.start_angle = 0;
    this.end_angle = 2 * Math.PI
    this.color = "#FFFFFF"

    // Draws circle to the screen
    this.draw = function() {
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.arc(this.x, this.y, this.r, this.start_angle, this.end_angle)
        ctx.lineWidth = 2;
        ctx.fill()
        ctx.closePath()
        ctx.stroke()
    }

    // Check if the client's mouse is in a valid position to drop a piece
    this.check_hit = function(x, y) {
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
        this.is_winner = false 

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

        // Update the color of the circle where the piece is being dropped
        if (i != 0) this.board[i-1][col].color = this.player_turn == 0 ? "#5DEED6" : "#FFC300"
        this.last_row = i-1
        this.last_col = col
    }

    // Takes in as args the x,y positions of the client's mouse 
    // and checks if any of the circles have been hit. If they have
    // drop a piece in that column 
    this.place = function(x, y) {
        this.board.forEach((row) => {
            row.forEach((circle) => {
                if (circle.check_hit(x, y)) { 
                    this.update_board(circle.col)
                    this.player_turn ^= 1
                }
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

        // Diagonal win that occurs on the left half of the board
        for (let row = 3; row < this.m; row++) {
            let streak = 0, col = 0, i = row
            while (i >= 0) {
                streak = this.board[i][col].color == prev_player ? ++streak : 0
                if (streak == 4) return true
                i--
                col++
            }
        }
        
        // Diagonal win that occurs on the right half of the board
        for (let col = 0; col < this.n; col++) {
            let streak = 0, row = this.m-1, j = col
            while (j < this.n && row >= 0) {
                console.log(row)
                streak = this.board[row][j].color == prev_player ? ++streak : 0
                if (streak == 4) return true
                j++
                row--
            }
        }
        return false
    }

    // Resets the board to initial state. Used when restarting game
    this.reset_board = function() {     
        this.init_board()
        document.getElementById("end-screen").style.display = "none"
    }
}

let canvas = document.getElementById('canvas')
/** @type {CanvasRenderingContext2D} */
let ctx = canvas.getContext('2d')

canvas.width = window.screen.width
canvas.height = 500

let board = new Board()
board.init_board()
setInterval(loop, 100)


function loop() {
    // If there is a winner, do not update the board
    if (board.is_winner) return
    
    // Draw the circles to the screen
    board.draw()

    // If there is a winner, draw the final board to the screen
    // and show the results screen
    if (board.check_win()) {
        board.is_winner = true
        board.draw()
        document.getElementById("end-screen").style.display = "block"
        document.getElementById("winner").textContent =  board.player_turn == 1 ? "Blue wins" : "Yellow wins"
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

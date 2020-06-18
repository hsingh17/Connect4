let canvas = document.getElementById('canvas')
/** @type {CanvasRenderingContext2D} */
let ctx = canvas.getContext('2d')

canvas.width = window.screen.width
canvas.height = window.screen.height

let turn = 0
let board = new Board()
board.init_board()

setInterval(loop, 100)

function Circle(i, j) {
    this.col = j-1
    this.x = (j * 60) + 500
    this.y  = i * 60
    this.r = canvas.width / 56
    this.start_angle = 0;
    this.end_angle = 2 * Math.PI
    this.color = "#FFFFFF"

    this.draw = function() {
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.arc(this.x, this.y, this.r, this.start_angle, this.end_angle)
        ctx.lineWidth = 2;
        ctx.fill()
        ctx.closePath()
        ctx.stroke()
    }

    this.check_hit = function(x, y) {
        let dist = Math.sqrt((this.x-x) ** 2 + (this.y-y) ** 2)
        if (dist < this.r) return true
        else return false
    }
}

function Board() {
    this.m = 6
    this.n = 7  
    this.player_turn = 0
    this.board = []
    this.last_row = -1
    this.last_col = -1

    this.init_board = function() {
        this.board = []
        this.player_turn = 0
        for (let i = 1; i <= 6; i++) {
            let row = []
            for (let j = 1; j <= 7; j++) {
                row.push(new Circle(i, j))
            }
            this.board.push(row)
        }
        console.log(this.board)
        console.log("Board initialized!")
    }

    this.draw = function() {
        this.board.forEach((row) => {
            row.forEach((circle) => {
                circle.draw()
            })
        })
    }

    this.update_board = function(col) {
        for (var i = 0; i < this.board.length; i++) {
            if (this.board[i][col].color != "#FFFFFF") break
        }

        if (i != 0) this.board[i-1][col].color = this.player_turn == 0 ? "#5DEED6" : "#FFC300"
        this.last_row = i-1
        this.last_col = col
    }

    this.place = function(x, y) {
        this.board.forEach((row) => {
            row.forEach((circle) => {
                let hit = circle.check_hit(x, y)
                if (hit) { 
                    this.update_board(circle.col)
                    this.player_turn ^= 1
                }
            })
        })
    } 

    this.reset_board = function() {
        this.init_board()
    }
    

    this.check_win = function() {
        if (this.last_row == -1 || this.last_col == -1) return false
    
        let prev_player = (this.player_turn ^ 1) == 0 ? "#5DEED6" : "#FFC300"

        // Horizontal win
        let streak = 0
        for (let col = 0; col < this.n; col++) {
            if (streak == 4) return true
            if (this.board[this.last_row][col].color == prev_player) streak++
            else streak = 0
        }
    
        if (streak == 4) return true
        
        streak = 0
        // Vertical win
        for (let row = this.m-1; row >= 0; row--) {
            if (streak == 4) return true
            if (this.board[row][this.last_col].color == prev_player) streak++
            else streak = 0
        }

        if (streak == 4) return true

        // Left diagonal win
        streak = 0
        let row = this.last_row
        let col = this.last_col
        while (row < this.m && col >= 0) {
            if (streak == 4) return true
            if (this.board[row][col].color == prev_player) streak++
            else streak = 0
            row++
            col--
        }

        if (streak == 4) return true
        // Right diagonal win
        streak = 0
        row = this.last_row
        col = this.last_col
        while (row < this.m && col < this.n) {
            console.log(streak, row, col, this.board[row][this.last_col].color, prev_player)
            if (streak == 4) return true
            if (this.board[row][col].color == prev_player) streak++
            else streak = 0
            row++
            col++
        }
    }
}

function loop() {
    // Draw the circles to the screen
    board.draw()
    let win = board.check_win()
}

// event handler on canvas to check for clicks on page
// specifically the circles
canvas.addEventListener('click', (e) => {
    board.place(e.clientX, e.clientY)
})

canvas.addEventListener('keydown', (e) => {
    if (e.keyCode == 82) {
        board.reset_board()
        console.log("Reset!")
    }
})

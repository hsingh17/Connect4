var canvas = document.getElementById('canvas')
/** @type {CanvasRenderingContext2D} */
var ctx = canvas.getContext('2d')

canvas.width = window.screen.width
canvas.height = window.screen.height

var circles = new Array(6)
// Create circles for board
for (var i = 1; i <= 6; i++) {
    var row = new Array()
    for (var j = 1; j <= 7; j++) {
        row.push(new Circle(i, j))
    }
    circles[i-1] = row
}
console.log(circles)

setInterval(loop, 1)

function Circle(i, j) {
    this.col = j-1
    this.x = (j * 60) + 500
    this.y  = i * 60
    this.r = canvas.width / 56
    this.start_angle = 0;
    this.end_angle = 2 * Math.PI
    this.color = "#FFFFFF"
    console.log(this.col)

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
        var dist = Math.sqrt((this.x-x) ** 2 + (this.y-y) ** 2)
        if (dist < this.r) {
            return true
        }
        return false
    }
}

function update_board(col) {
    for (var i = 0; i < circles.length; i++) {
        if (circles[i][col].color == "#5DEED6") break
    }

    if (i != 0) circles[i-1][col].color = "#5DEED6"
}

function loop() {
    // Draw the circles to the screen
    circles.forEach((row) => {
        row.forEach((circle) => {
            circle.draw()
        })
    })
}

// event handler on canvas to check for clicks on page
// specifically the circles
canvas.addEventListener('click', (e) => {
    circles.forEach((row) => {
        row.forEach((circle) => {
           var hit =  circle.check_hit(e.clientX, e.clientY)
           if (hit) {
               console.log(circle.col)
               update_board(circle.col)
           }
        })
    })
})

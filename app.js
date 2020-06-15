var canvas = document.getElementById('canvas')
/** @type {CanvasRenderingContext2D} */
var ctx = canvas.getContext('2d')

canvas.width = window.screen.width
canvas.height = window.screen.height

var circles = new Array()
// Create circles for board
for (var i = 1; i <= 7; i++) {
    for (var j = 1; j <= 6; j++) {
        circles.push(new circle(i, j))
    }
}

setInterval(loop, 1)
function circle(i, j) {
    this.x = i * 60
    this.y = j * 60
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

    this.hit = function(x, y) {
        var dist = Math.sqrt((this.x-x) ** 2 + (this.y-y) ** 2)
        if (dist < this.r) {
            this.color = "#FF0000"
        }
    }
}

function loop() {
    // Draw the circles to the screen
    circles.forEach((circle) => {
        circle.draw()
    })
}

// event handler on canvas to check for clicks on page
// specifically the circles
canvas.addEventListener('click', (e) => {
    circles.forEach((circle) => {
        circle.hit(e.clientX, e.clientY)
    })
})
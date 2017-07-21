let canvas, ctx, WIDTH, HEIGHT, fps, el, stepSize, playing
let snake, playLabel, food
let globalTouch = [], offset = []

window.addEventListener('touchstart', touchStart)
window.addEventListener('touchmove', touchMove)
window.addEventListener('touchend', touchEnd)

window.addEventListener('keydown', keyDown)
window.addEventListener('resize', resizeWindow)

function touchEnd (e) {
  if (Math.abs(offset[0]) > Math.abs(offset[1])) {
    snake.direction = [offset[0] / Math.abs(offset[0]), 0]
  } else if (Math.abs(offset[0]) < Math.abs(offset[1])) {
    snake.direction = [0, offset[1] / Math.abs(offset[1])]
  } else {
    return
  }
}

function touchMove (e) {
  let touch = e.touches[0]

  offset = [touch.pageX - globalTouch[0], touch.pageY - globalTouch[1]]
}

function touchStart (e) {
  e.preventDefault()

  const touch = e.touches[0]
  globalTouch = [touch.pageX, touch.pageY]

  if (!playing && globalTouch) {
    playing = true
  }
}

function keyDown (e) {
  const keys = {
    left: 37,
    up: 38,
    right: 39,
    down: 40
  }

  if (!playing && (e.keyCode === keys.left || e.keyCode === keys.up || e.keyCode === keys.right || e.keyCode === keys.down)) {
    playing = true
  }

  switch (e.keyCode) {
    case keys.left:
      if (snake.direction[0] === 1 && snake.direction[1] === 0) {
        return
      }
      snake.direction = [-1, 0]
      break;
    case keys.up:
      if (snake.direction[0] === 0 && snake.direction[1] === 1) {
        return
      }
      snake.direction = [0, -1]
      break;
    case keys.right:
      if (snake.direction[0] === -1 && snake.direction[1] === 0) {
        return
      }
      snake.direction = [1, 0]
      break;
    case keys.down:
      if (snake.direction[0] === 0 && snake.direction[1] === -1) {
        return
      }
      snake.direction = [0, 1]
      break;
  }
}

function resizeWindow () {
  WIDTH = window.innerWidth
  HEIGHT = window.innerHeight

  canvas.width = WIDTH
  canvas.height = HEIGHT

  stepSize = Math.max(Math.floor(WIDTH / 40), Math.floor(HEIGHT / 40))
}

function isMobileDevice () {
  return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)
}

function init () {
  canvas = document.createElement('canvas')
  resizeWindow()

  document.querySelector('.js-canvas').appendChild(canvas)
  ctx = canvas.getContext('2d')

  ctx.fillStyle = '#cccccc'

  fps = 5

  newGame()
  run()
}

function newGame () {
  snake = new Snake()
  playLabel = new PlayLabel()
  food = new Food()

  playing = false
}

function PlayLabel () {
  this.text
  this.color = '#666666'

  this.messages = {
    mobile: 'Arraste a tela para jogar',
    pc: 'Pressione as setas para jogar'
  }

  if (isMobileDevice()) {
    this.text = this.messages['mobile']
  } else {
    this.text = this.messages['pc']
  }

  this.draw = function () {
    ctx.fillStyle = this.color
    ctx.font = stepSize + 'px Arial'
    ctx.fillText(this.text, WIDTH / 2 - ctx.measureText(this.text).width / 2, HEIGHT / 2)
  }
}

function Food () {
  this.score = 0
  this.body = []
  this.color = '#d30000'

  this.body = [
    Math.floor((Math.random() * canvas.width) / stepSize),
    Math.floor((Math.random() * canvas.height) / stepSize)
  ]

  this.draw = function () {
    ctx.fillStyle = this.color

    ctx.fillRect(this.body[0] * stepSize, this.body[1] * stepSize, stepSize, stepSize)
  }
}

function Snake () {
  this.body = [
    [10, 10],
    [10, 11],
    [10, 12]
  ]
  this.color = '#000000'
  this.direction = [0, -1]

  this.update = function () {
    let nextPos = [this.body[0][0] + this.direction[0], this.body[0][1] + this.direction[1]]
    let currentPos = [this.body[0][0], this.body[0][1]]

    if (!playing) {
      if (this.direction[1] === -1 && nextPos[1] <= (HEIGHT * 0.1 / stepSize)) {
        this.direction = [1, 0] // RIGHT
      } else if (this.direction[0] === 1 && nextPos[0] >= (WIDTH * 0.9 / stepSize)) {
        this.direction = [0, 1] // DOWN
      } else if (this.direction[1] === 1 && nextPos[1] >= (HEIGHT * 0.9 / stepSize)) {
        this.direction = [-1, 0] // LEFT
      } else if (this.direction[0] === -1 && nextPos[0] <= (WIDTH * 0.1 / stepSize)) {
        this.direction = [0, -1] // UP
      }
    }

    if (nextPos[0] === this.body[1][0] && nextPos[1] === this.body[1][1]) {
      nextPos = [this.body[0][0] + this.direction[0], this.body[0][1] + this.direction[1]]
    }

    if (currentPos[0] == Math.floor(canvas.width / stepSize + 1) || currentPos[0] == -1 || currentPos[1] == Math.floor(canvas.height / stepSize + 1) || currentPos[1] == -1) {
      food.score = 0
      document.querySelector('.js-score').innerHTML = 'Pontuação: ' + food.score
      return newGame()
    }

    if (food.body[0] === this.body[0][0] && food.body[1] === this.body[0][1]) {
      this.body.push(currentPos)

      food.score++
      document.querySelector('.js-score').innerHTML = 'Pontuação: ' + food.score

      food.body.splice(0, 1, Math.floor((Math.random() * canvas.width) / stepSize), Math.floor((Math.random() * canvas.width) / stepSize))
    }

    for (var i = 0; i < this.body.length; i++) {
      if (nextPos[0] === this.body[i][0] && nextPos[1] === this.body[i][1]) {
        return newGame()
      }
    }

    this.body.pop()
    this.body.splice(0, 0, nextPos)
  }

  this.draw = function () {
    ctx.fillStyle = this.color

    for (var i = 0; i < this.body.length; i++) {
      ctx.fillRect(this.body[i][0] * stepSize, this.body[i][1] * stepSize, stepSize, stepSize)
    }
  }
}

function update () {
  snake.update()
}

function run () {
  update()
  draw()

  setTimeout(run, 1000 / fps)
}

function draw () {
  ctx.clearRect(0, 0, WIDTH, HEIGHT)

  snake.draw()
  food.draw()

  if (!playing) {
    playLabel.draw()
  }
}

init()

window.onload = () => {
  const scoreboard = document.getElementById('score')
  const canvas = document.getElementById('game-canvas')
  const frame = canvas.getContext('2d')

  const settings = {
    fps: 60,
    padding: 20,
    ballRadius: 5,
    paddleHeight: 50,
    colors: {
      background: 'black',
      text: 'black',
      paddle: 'white',
      net: 'white',
      ball: 'white'
    }
  }

  var ball = {
    radius: 5,
    x: (canvas.width / 2) - settings.ballRadius,
    y: (canvas.height / 2) - settings.ballRadius,
    speed: {
      x: 5,
      y: -5
    },
    reset: function () {
      ball.speed.x = -ball.speed.x
      ball.speed.y = -ball.speed.y
      this.x = (canvas.width / 2) - settings.ballRadius
      this.y = (canvas.height / 2) - settings.ballRadius
    }
  }
  
  function Paddle (x, side) {
    this.width = 10
    this.height = settings.paddleHeight
    this.x = x
    this.y = (canvas.height / 2) - (settings.paddleHeight / 2)
    if (side === 'left') {
      this.stickX = function () { ball.x = (this.x + (settings.ballRadius * 2) + (settings.padding / 4)) }
    } else {
      this.stickX = function () { ball.x = (this.x - (settings.ballRadius * 2) - (settings.padding / 4)) }
    }
    this.stick = function () {
      ball.speed.x = 0
      ball.speed.y = 0
      this.stickX()
      ball.y = (this.y + (settings.paddleHeight / 2) - (settings.ballRadius))
    }
  }

  var paddle1 = new Paddle(settings.padding, 'left')
  var paddle2 = new Paddle(canvas.width - settings.padding - 10, 'right')

  var score = {
    player1: 0,
    player2: 0,
    update: function () {
      scoreboard.innerHTML = `${score.player1} - ${score.player2}`
    }
  }

  window.addEventListener('keydown', movePaddles)
  window.addEventListener('keyup', stopPaddles)
  canvas.addEventListener('mousemove', movePaddleWithMouse)

  setInterval(() => {
    renderFrame()
    setPositions()
  }, 1000/settings.fps)

  function movePaddles (e) {
    switch (e.key) {
      case 'ArrowUp':
        if (paddle2.y >= 0) {
          if (paddle2.upInterval) { break }
          paddle2.upInterval = setInterval(() => {
            if (paddle2.y >= 0) {
              paddle2.y -= 10
            }
          }, 1000/settings.fps)
        } else if (paddle2.upInterval) {
          clearInterval(paddle2.upInterval)
        }
        break
      case 'ArrowDown':
        if (paddle2.y <= canvas.height - settings.paddleHeight) {
          if (paddle2.downInterval) { break }
          paddle2.downInterval = setInterval(() => {
            if (paddle2.y <= canvas.height - settings.paddleHeight) {
              paddle2.y += 10
            }
          }, 1000/settings.fps)
        } else if (paddle2.downInterval) {
          clearInterval(paddle2.downInterval)
        }
        break
      case 'w':
        if (paddle1.y >= 0) {
          if (paddle1.upInterval) { break }
          paddle1.upInterval = setInterval(() => {
            if (paddle1.y >= 0) {
              paddle1.y -= 10
            }
          }, 1000/settings.fps)
        } else if (paddle1.upInterval) {
          clearInterval(paddle1.upInterval)
        }
        break
      case 's':
        if (paddle1.y <= canvas.height - settings.paddleHeight) {
          if (paddle1.downInterval) { break }
          paddle1.downInterval = setInterval(() => {
            if (paddle1.y <= canvas.height - settings.paddleHeight) {
              paddle1.y += 10
            }
          }, 1000/settings.fps)
        } else if (paddle1.downInterval) {
          clearInterval(paddle1.downInterval)
        }
        break
    }
  }
  function stopPaddles (e) {
    switch (e.key) {
      case 'ArrowUp':
        clearInterval(paddle2.upInterval)
        paddle2.upInterval = null
        break
      case 'ArrowDown':
        clearInterval(paddle2.downInterval)
        paddle2.downInterval = null
        break
      case 'w':
        clearInterval(paddle1.upInterval)
        paddle1.upInterval = null
        break
      case 's':
        clearInterval(paddle1.downInterval)
        paddle1.downInterval = null
        break
    }
  }

  function movePaddleWithMouse (e) {
    var rect = canvas.getBoundingClientRect()
    var root = document.documentElement
    var mouse = {
      x: e.clientX - rect.left - root.scrollLeft,
      y: e.clientY - rect.top - root.scrollTop
    }

    // make sure paddle will not be clipped by field boundry.
    if ((mouse.y - (settings.paddleHeight / 2)) < 0 || ((mouse.y - (settings.paddleHeight / 2)) > (canvas.height - paddle1.height))) {
      return
    } else {
      paddle1.y = mouse.y - (settings.paddleHeight / 2)
    }
  }

  function renderFrame () {
    // draw the field
    frame.fillStyle = settings.colors.background
    frame.fillRect(0, 0, canvas.width, canvas.height)

    // draw the 'net'
    frame.fillStyle = settings.colors.net
    for (var i = 20; i < canvas.height; i += (settings.padding * 2)) {
      frame.fillRect(canvas.width / 2 - 1, i, 2, settings.padding)
    }

    // draw the ball
    frame.fillStyle = settings.colors.ball
    frame.fillRect(ball.x, ball.y, 10, 10)

    // draw the paddles
    frame.fillStyle = settings.colors.paddle
    frame.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height)
    frame.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height)
  }

  function setPositions () {
    // set the ball position
    ball.x += ball.speed.x
    ball.y += ball.speed.y

    // ball hits top or bottom
    if (ball.y >= canvas.height || ball.y <= 0) {
      ball.speed.y = -ball.speed.y
    }

    // ball hits the left or right side
    if (ball.x >= canvas.width || ball.x <= 0) {
      if (ball.speed.x > 0) {
        score.player1++
        paddle2.stick()
      } else {
        score.player2++
        paddle1.stick()
      }
      score.update()
      // ball.reset()
    }

    // ball hits the left paddle
    if (ball.x < (paddle1.x + paddle1.width) && ball.x > paddle1.x) {
      if (ball.y + (ball.radius * 2) > paddle1.y && ball.y < paddle1.y + paddle1.height) {
        ball.speed.x = -ball.speed.x
        let delta = (ball.y + ball.radius) - (paddle1.y + (paddle1.height / 2))
        ball.speed.y = delta * 0.30
      }
    }

    // ball hits the right paddle
    if ((ball.x + (ball.radius * 2)) > paddle2.x && (ball.x + (ball.radius * 2) < (paddle2.x + paddle2.width))) {
      if (ball.y + (ball.radius * 2) > paddle2.y && ball.y < paddle2.y + paddle2.height) {
        ball.speed.x = -ball.speed.x
        let delta = (ball.y + ball.radius) - (paddle2.y + (paddle2.height / 2))
        ball.speed.y = delta * 0.30
      }
    }
  }
}

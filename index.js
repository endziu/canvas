window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame    ||
  window.oRequestAnimationFrame      ||
  window.msRequestAnimationFrame     ||
  function(/* function */ callback, /* DOMElement */ element){
    window.setTimeout(callback, 1000 / 60);
  };
})();

(function() {
  var Game = function(canvasId) {
    var self = this;
    var canvas = document.getElementById(canvasId);
        canvas.setAttribute('height', 640);
        canvas.setAttribute('width', 480);
    var screen = canvas.getContext('2d');
    var gameSize = { x: canvas.width, y: canvas.height };

    this.bodies = makeEnemies(this,gameSize,32).concat(new Player(this,gameSize));

    var loop = function() {
      self.update();
      self.draw(screen,gameSize);
      requestAnimFrame(loop);
    };

    loop();
  };

  Game.prototype = {
    update: function() {
      var bodies = this.bodies;
      var notCollidingAtAll = function(b1){
        return bodies.filter(function(b2) {
          return colliding(b1,b2);
        }).length === 0;
      };

      this.bodies = this.bodies.filter(notCollidingAtAll);

      for (var i = 0; i < this.bodies.length; i++) {
        this.bodies[i].update();
      }
      //console.log(bodies)
    },
    draw: function(screen, gameSize) {
      //clear screen
      screen.clearRect(0,0,gameSize.x, gameSize.y);
      //draw all bodies
      for (var i = 0; i < this.bodies.length; i++) {
        drawRect(screen,this.bodies[i]);
      }

    },
    addBody: function(body) {
      return this.bodies.push(body);
    },
    removeBody: function(body) {
      return this.bodies.splice(this.bodies.indexOf(body), 1);
    }
  };

  var Player = function(game, gameSize) {
    this.game = game;
    this.size = { x: 15, y: 15 };
    this.center = { x: gameSize.x / 2, y: gameSize.y - this.size.y };
    this.keyboarder = new Keyboarder();
  };

  Player.prototype = {
    update: function() {
      //go left
      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
        this.center.x -= 5;
      }
      //go right
      if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
        this.center.x += 5;
      }
      //go UP
      if (this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
        this.center.y -= 5;
      }
      //go DOWN
      if (this.keyboarder.isDown(this.keyboarder.KEYS.DOWN)) {
        this.center.y += 5;
      }
      //shoot
      if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
        if(Math.random() < 0.33) {
          var bullet = new Bullet(
            this.game,
            {x: this.center.x, y: this.center.y - this.size.y / 2},
            {x: (Math.random() - 0.5) * .25 , y:-7 });
            this.game.addBody(bullet)
        }
      }
    }
  };

  var Bullet = function(game,center,velocity) {
    this.game = game;
    this.center = center;
    this.velocity = velocity
    this.size = { x: 3, y: 3 };
  };

  Bullet.prototype = {
    update: function() {
      this.center.x += this.velocity.x;
      this.center.y += this.velocity.y;
      if (this.center.y < 0){
        this.game.removeBody(this);
      }
    }
  };

  var Enemy = function(game, center) {
    this.game = game;
    this.size = { x: 12, y: 12 };
    this.center = center ;
  };

  Enemy.prototype = {
    update: function() {
      this.center.y += 0.2 + Math.random()*0.2;
      if (this.center.y > 640){
        this.game.removeBody(this);
      }
    }
  };

  var drawRect = function(screen, body) {
    var x = body.center.x - body.size.x / 2,
        y = body.center.y - body.size.y / 2,
        w = body.size.x,
        h = body.size.y;
    screen.fillRect(x,y,w,h);
  };

  var makeEnemies = function(game,gameSize,num) {
    var enemies = [];
    for(i=0; i < num; i++) {
      enemies.push(new Enemy(game,{x: Math.random() * gameSize.x,
                                   y: Math.random() * gameSize.y * .5 - gameSize.y * .25}))
    }
    return enemies;
  };

  var colliding = function(b1, b2){
    return !(b1 === b2 ||
             b1.center.x + b1.size.x /2 < b2.center.x - b2.size.x /2 ||
             b1.center.y + b1.size.y /2 < b2.center.y - b2.size.y /2 ||
             b1.center.x - b1.size.x /2 > b2.center.x + b2.size.x /2 ||
             b1.center.y - b1.size.y /2 > b2.center.y + b2.size.y /2);
  };

  var Keyboarder = function() {
    var keyState = {};
    window.onkeydown = function(e) {
      keyState[e.keyCode] = true;
    };
    window.onkeyup = function(e) {
      keyState[e.keyCode] = false;
    };
    this.isDown = function(keyCode) {
      return keyState[keyCode] === true;
    };
    this.KEYS = { LEFT: 37, UP: 38, DOWN: 40, RIGHT: 39, SPACE: 32 };
  };

  window.onload = function() {
    new Game('screen');
  };

}());

var Game = new Systemize.Game(1280, 720);

Bump = new Bump(PIXI);

Game.addAssets([
  ["bricks", "assets/buildings/textures/dark_brick.png"],
  ["concrete", "assets/concrete.png"],
  ["background0", "assets/background/sky.png"],
  ["background1", "assets/background/mountain0.png"],
  ["background2", "assets/background/mountain1.png"],
  ["background3", "assets/background/mountain2.png"],
  ["fade", "assets/background/fade.png"],
  ["dirt", "assets/buildings/textures/dirt.png"],
  ["speedup", "assets/powerups/cola.png"],
  ["coin", "assets/powerups/coin.png"],
  ["character0", "assets/character/character0.png"],
  ["character1", "assets/character/character1.png"],
  ["character2", "assets/character/character2.png"],
  ["character3", "assets/character/character3.png"],
  ["character4", "assets/character/character4.png"],
  ["door", "assets/buildings/door.png"],
  ["lamp", "assets/buildings/lamp.png"],
  ["grafitti", "assets/buildings/grafitti.png"],
  ["window", "assets/buildings/window.png"],
  ["playButton", "assets/ui/playButton.png"],
  ["logo", "assets/ui/logo.png"]
]);

//setup scenes
Game.addScene("MainMenuScene", MainMenuScene);
Game.addScene("GameScene", GameScene);
Game.addScene("EndScreenScene", EndScreenScene);

//PhysicsSystem
Game.addSystem({
  update: function(delta) {
    delta /= 16;
    var entities = Game.entityManager.getEntitiesByComponents(["SpriteComponent", "PhysicsComponent"]);
    entities.forEach(function(entity) {
      var sprite = entity.components.SpriteComponent.sprite;
      var physics = entity.components.PhysicsComponent;
      if(physics.static) return;
      //add acceleration to velocity
      physics.velocity.x += physics.acceleration.x;
      physics.velocity.y += physics.acceleration.y * delta;
      //clamp velocity
      physics.velocity.y = Math.min(physics.velocity.y, 15);
      //account for friction
      physics.velocity.x *= physics.friction;
      //move the sprite
      sprite.position.x += physics.velocity.x * delta;
      sprite.position.y += physics.velocity.y * delta;
      if(entity.components.FollowComponent) {
        entity.components.FollowComponent.distance = physics.velocity.x * delta;
      }

      entities.forEach(function(other) {
        if(entity === other) return;
        var otherSprite = other.components.SpriteComponent.sprite;
        var otherPhysics = other.components.PhysicsComponent;
        //make sure that 2 solid things don't touch
        var side = Bump.rectangleCollision(sprite, otherSprite, (physics.solid && otherPhysics.solid));
        if(side == "bottom" && entity.components.PhysicsComponent) {
          entity.components.PhysicsComponent.velocity.y = 0;
        }
        if(entity.components.FollowComponent) {
          if(side == "left" || side == "right") {
            //physics.velocity.x = 0;
            entity.components.FollowComponent.distance = 0;
          }
        }
      });
    });
  }
});

//Score System
Game.addSystem({
  update: function(delta) {
    delta /= 16;
    var entities = Game.entityManager.getEntitiesByComponents(["ScoreComponent", "SpriteComponent"]);
    entities.forEach(function(entity) {
      var sprite = entity.components.SpriteComponent.sprite;
      if(Game.forwardPlayer) {
        sprite.position.x = Game.forwardPlayer.components.SpriteComponent.sprite.position.x;
        sprite.position.y = Game.forwardPlayer.components.SpriteComponent.sprite.position.y - 50;
      }
    });
  }
});

//powerup system
Game.addSystem({
  update: function(delta) {
    delta /= 16;
    var entities = Game.entityManager.getEntitiesByComponents(["PowerupComponent", "SpriteComponent"]);
    entities.forEach(function(entity) {
      for(var i = 0; i < Game.players.length; i++) {
        if(Bump.hit(entity.components.SpriteComponent.sprite, Game.players[i].components.SpriteComponent.sprite)) {
          switch(entity.components.PowerupComponent.type) {
            case "speed":
              for(var j = 0; j < Game.players.length; j++) {
                Game.players[j].components.MovementComponent.speed += 0.05;
              }
/*              setTimeout(function() {
                for(var j = 0; j < Game.players.length; j++) {
                  Game.players[j].components.MovementComponent.speed -= 0.1;
                }
              }, 5000);
              */
              break;
            case "score":
              Game.score.components.ScoreComponent.score++;
              Game.score.components.SpriteComponent.sprite.text = Game.score.components.ScoreComponent.score;
              break;
          }
          entity.scene.removeEntity(entity, 4);
          break;
        }
      }
    });
  }
});

//camera system
Game.addSystem({
  update: function(delta) {
    //delta /= 16;
    var entities = Game.entityManager.getEntitiesByComponents(["FollowComponent", "SpriteComponent"]);
    if(entities.length <= 0) {
      return;
    }
    var forward = entities[0];
    entities.forEach(function(entity) {
      if(entity.components.SpriteComponent.sprite.position.x > forward.components.SpriteComponent.sprite.position.x) {
        forward = entity;
      }
    });
    Game.forwardPlayer = forward;
    var sprite = forward.components.SpriteComponent.sprite;
    var paralax = 0.25;
    var distance = forward.components.FollowComponent.distance;
    forward.scene.layers.forEach(function(scene, index) {
      forward.scene.layers[index].position.x -= (index) * paralax * distance;
    });
  }
});

//menu scroll system
Game.addSystem({
  update: function(delta) {
    var entities = Game.entityManager.getEntitiesByComponents(["SpriteComponent", "ScrollComponent"]);
    entities.forEach(function(entity) {
      var sprite = entity.components.SpriteComponent.sprite;
      var paralax = 0.25;
      sprite.tilePosition.x -= (entity.components.ScrollComponent.layer) * paralax;
    });
  }
});

//Animation System
Game.addSystem({
  update: function(delta) {
    var entities = Game.entityManager.getEntitiesByComponents(["SpriteComponent", "AnimationComponent"]);
    entities.forEach(function(entity) {
      var animation = entity.components.AnimationComponent;
      var sprite = entity.components.SpriteComponent.sprite;
      if(!animation.playing) {
        sprite.texture = animation.frames[animation.currentIndex];
        return;
      }
      animation.currentIndex = animation.currentIndex || 0;
      animation.elapsed = animation.elapsed || 0;
      //if we need to go to another frame
      if(animation.elapsed + delta >= animation.framerate) {
        animation.elapsed = animation.elapsed + delta - animation.framerate;
        //animation.elapsed = 0;
        animation.currentIndex++;
        if(animation.currentIndex >= animation.frames.length) {
          animation.currentIndex = 0;
        }
        sprite.texture = animation.frames[animation.currentIndex];
      }
      animation.elapsed += delta;
    });
  }
});

//MovementSystem
Game.addSystem({
  keys: {
    right: 39,
    left: 37,
    space: 32
  },
  update: function(delta) {
    delta /= 16;
    var entities = Game.entityManager.getEntitiesByComponents(["SpriteComponent", "MovementComponent", "PhysicsComponent"]);
    var self = this;
    entities.forEach(function(entity) {
      var movement = entity.components.MovementComponent;
      var physics = entity.components.PhysicsComponent;
      var sprite = entity.components.SpriteComponent.sprite;
      physics.acceleration.x = movement.speed;

      var grounded = false;
      var collidable = Game.entityManager.getEntitiesByComponents(["PhysicsComponent", "SpriteComponent"]);
      collidable.forEach(function(other) {
        var otherCollision = other.components.CollisionComponent;
        var otherSprite = other.components.SpriteComponent.sprite;
        if(otherCollision.solid) {
          var left = Bump.hitTestPoint({
            x: sprite.position.x + 10,
            y: sprite.position.y + sprite.height + 2
          }, otherSprite);
          var right = Bump.hitTestPoint({
            x: sprite.position.x + sprite.width - 10,
            y: sprite.position.y + sprite.height + 2
          }, otherSprite);
          if(left || right) {
            grounded = true;
            return;
          }
        }
      });
      //updating the jumping animation
      //should probable move this logic to the animation system
      if(entity.components.AnimationComponent && grounded) {
        entity.components.AnimationComponent.playing = true;
      } else {
        entity.components.AnimationComponent.playing = false;
        entity.components.AnimationComponent.currentIndex = 0;
      }
      //jumping
      if(Systemize.InputManager.isKeyDown(self.keys.space)) {
        if(grounded) {
          physics.velocity.y = -10;
        }
      }
    });
  }
});

Game.start();
Game.score = {score: 4};
Game.setScene("EndScreenScene");
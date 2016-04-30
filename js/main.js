var Game = new Systemize.Game(1280, 720);

Bump = new Bump(PIXI);

Game.addAssets([
  ["bricks", "assets/buildings/textures/dark_brick.png"],
  ["concrete", "assets/concrete.png"],
  ["background0", "assets/background/sky.png"],
  ["background1", "assets/background/mountain0.png"],
  ["background2", "assets/background/mountain1.png"],
  ["background3", "assets/background/mountain2.png"],
  ["dirt", "assets/buildings/textures/dirt.png"],
  ["speedup", "assets/powerups/cola.png"],
  ["character0", "assets/character/character0.png"],
  ["character1", "assets/character/character1.png"],
  ["character2", "assets/character/character2.png"],
  ["character3", "assets/character/character3.png"],
  ["character4", "assets/character/character4.png"],
  ["door", "assets/buildings/door.png"],
  ["window", "assets/buildings/window.png"]
]);

/*
Game.addSceneTemplate({
  id: "GameScene",
  layerCount: 6,
  entities: [
    {
      layer: 0,
      entity: function() {
        var sprite = new PIXI.extras.TilingSprite(PIXI.loader.resources.background0.texture, Game.renderer.width * 10, Game.renderer.height);
        var background = new Systemize.Entity([
          {type: "SpriteComponent", component: {sprite: sprite}}
        ]);
        return background;
      }
    },
    {
      layer: 1,
      entity: function() {
        var sprite = new PIXI.extras.TilingSprite(PIXI.loader.resources.background1.texture, Game.renderer.width * 10, Game.renderer.height);
        var background = new Systemize.Entity([
          {type: "SpriteComponent", component: {sprite: sprite}}
        ]);
        return background;
      }
    },
    {
      layer: 2,
      entity: function() {
        var sprite = new PIXI.extras.TilingSprite(PIXI.loader.resources.background2.texture, Game.renderer.width * 10, Game.renderer.height);
        var background = new Systemize.Entity([
          {type: "SpriteComponent", component: {sprite: sprite}}
        ]);
        return background;
      }
    },
    {
      layer: 3,
      entity: function() {
        var sprite = new PIXI.extras.TilingSprite(PIXI.loader.resources.background3.texture, Game.renderer.width * 10, Game.renderer.height);
        var background = new Systemize.Entity([
          {type: "SpriteComponent", component: {sprite: sprite}}
        ]);
        return background;
      }
    },
    {
      layer: 4,
      entity: function() {
        var buildings = [];
        var currentX = 0;
        var currentY = 200;
        for(var i = 0; i < 50; i++) {
          var width = Math.floor(Math.random() * 200 + 100);
          var dHeight = Math.floor(Math.random() * 200 - 100);
          var height = currentY + dHeight;
          if(height <= 100 || height >= Game.renderer.height - 250) {
            height -= dHeight * 2;
          }
          currentY = height;

          var texture;
          if(Math.random() < 0.5) texture = PIXI.loader.resources.bricks.texture;
          else texture = PIXI.loader.resources.concrete.texture;
          var spriteContainer = new PIXI.Container();
          var sprite = new PIXI.extras.TilingSprite(texture, width, height);
          sprite.position.x = currentX;
          sprite.position.y = Game.renderer.height - height;
          spriteContainer.addChild(sprite);

          //generate dirt
          var dirt = new PIXI.extras.TilingSprite(PIXI.loader.resources.dirt.texture, 400, width);
          dirt.position.x = currentX;
          dirt.position.y = Game.renderer.height;
          spriteContainer.addChild(dirt);

          var building = new Systemize.Entity([
            {type: "SpriteComponent", component: {sprite: spriteContainer}},
            {type: "CollisionComponent", component: {group: "solid", solid: true, static: true}},
            {type: "PhysicsComponent", component: {velocity: {x: 0, y: 0}, acceleration: {x: 0, y: 0}, friction: 0.95, solid: true, static: true}}
          ]);
          buildings.push(building);
          currentX += width;
          currentX += Math.floor(Math.random() * 30);


        }
        return buildings;
      }
    },
    {
      layer: 4,
      entity: function() {
        var sprite = new PIXI.Sprite(PIXI.loader.resources.player.texture);
        sprite.position.y = 100;
        sprite.position.x = Game.renderer.width/3;
        sprite.scale.x = 0.2;
        sprite.scale.y = 0.2;
        var player = new Systemize.Entity([
          {type: "SpriteComponent", component: {sprite: sprite}},
          {type: "PhysicsComponent", component: {velocity: {x: 0, y: 0}, acceleration: {x: 0, y: 0.35}, friction: 0.95, solid: true, static: false}},
          {type: "CollisionComponent", component: {group: "player", solid: true}},
          {type: "MovementComponent", component: {speed: 0.3}},
          {type: "FollowComponent", component: {distance: 0}}
        ]);

        return player;
      }
    }
  ]
});
*/

Game.addScene("GameScene", GameScene);

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
      physics.velocity.y += physics.acceleration.y;
      //clamp velocity
      //physics.velocity.x = Math.min(physics.velocity.x, 5);
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
            physics.velocity.x = 0;
            entity.components.FollowComponent.distance = 0;
          }
        }
      });
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
                Game.players[j].components.MovementComponent.speed += 0.1;
              }
              setTimeout(function() {
                for(var j = 0; j < Game.players.length; j++) {
                  Game.players[j].components.MovementComponent.speed -= 0.1;
                }
              }, 1000);
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
    delta /= 16;
    var entities = Game.entityManager.getEntitiesByComponents(["FollowComponent", "SpriteComponent"]);
    var forward = entities[0];
    entities.forEach(function(entity) {
      if(entity.components.SpriteComponent.sprite.position.x > forward.components.SpriteComponent.sprite.position.x) {
        forward = entity;
      }
    });
    var sprite = forward.components.SpriteComponent.sprite;
    var paralax = 0.25;
    var normal = 4;
    var distance = forward.components.FollowComponent.distance;
    forward.scene.layers.forEach(function(scene, index) {
      forward.scene.layers[index].position.x -= (index) * paralax * distance;
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
      var stop = true;
      if(Systemize.InputManager.isKeyDown(self.keys.right)) {
        physics.acceleration.x = movement.speed;
        stop = false;
      }
      if(Systemize.InputManager.isKeyDown(self.keys.left)) {
        physics.acceleration.x = -movement.speed;
        stop = false;
      }
      if(stop) physics.acceleration.x = 0;


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

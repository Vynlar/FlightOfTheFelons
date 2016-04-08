var Game = new Systemize.Game(800, 600);

Bump = new Bump(PIXI);

Game.addAssets([
  ["player", "assets/player.png"],
  ["bricks", "assets/bricks.png"],
  ["concrete", "assets/concrete.png"],
  ["background", "assets/background.jpg"]
]);

Game.addSceneTemplate({
  id: "GameScene",
  layerCount: 3,
  entities: [
    {
      layer: 0,
      entity: function() {
        var sprite = new PIXI.extras.TilingSprite(PIXI.loader.resources.background.texture, Game.renderer.width * 6, Game.renderer.height);
        var background = new Systemize.Entity([
          {type: "SpriteComponent", component: {sprite: sprite}}
        ]);
        return background;
      }
    },
    {
      layer: 1,
      entity: function() {
        var buildings = [];
        var currentX = 0;
        for(var i = 0; i < 20; i++) {
          var width = Math.floor(Math.random() * 200 + 100);
          var height = Math.floor(Math.random() * 200 + 100);
          var texture;
          if(Math.random() < 0.5) texture = PIXI.loader.resources.bricks.texture;
          else texture = PIXI.loader.resources.concrete.texture;
          var sprite = new PIXI.extras.TilingSprite(texture, width, height);
          sprite.position.x = currentX;
          sprite.position.y = Game.renderer.height - height;
          var building = new Systemize.Entity([
            {type: "SpriteComponent", component: {sprite: sprite}},
            {type: "CollisionComponent", component: {group: "solid", solid: true, static: true}}
          ]);
          buildings.push(building);
          currentX += width;
        }
        return buildings;
      }
    },
    {
      layer: 1,
      entity: function() {
        var sprite = new PIXI.Sprite(PIXI.loader.resources.player.texture);
        sprite.position.y = 100;
        sprite.position.x = Game.renderer.width/3*2;
        sprite.scale.x = 0.2;
        sprite.scale.y = 0.2;
        var player = new Systemize.Entity([
          {type: "SpriteComponent", component: {sprite: sprite}},
          {type: "PhysicsComponent", component: {velocity: {x: 0, y: 0}, acceleration: {x: 0, y: 0.2}, friction: 0.95}},
          {type: "CollisionComponent", component: {group: "player", solid: true}},
          {type: "MovementComponent", component: {speed: 3}},
        ]);

        return player;
      }
    },

  ]
});

//PhysicsSystem
Game.addSystem({
  update: function(delta) {
    delta /= 16;
    var entities = Game.entityManager.getEntitiesByComponents(["SpriteComponent", "PhysicsComponent"]);
    entities.forEach(function(entity) {
      var sprite = entity.components.SpriteComponent.sprite;
      var physics = entity.components.PhysicsComponent;
      //add acceleration to velocity
      physics.velocity.x += physics.acceleration.x;
      physics.velocity.y += physics.acceleration.y;
      //clamp velocity
      physics.velocity.x = Math.min(physics.velocity.x, 5);
      physics.velocity.y = Math.min(physics.velocity.y, 15);
      //account for friction
      physics.velocity.x *= physics.friction;
      //move the sprite
      sprite.position.x += physics.velocity.x * delta;
      sprite.position.y += physics.velocity.y * delta;
    });
  }
});

//CollisionSystem
Game.addSystem({
  update: function(delta) {
    var entities = Game.entityManager.getEntitiesByComponents(["SpriteComponent", "CollisionComponent"]);
    entities.forEach(function(entity) {
      var sprite = entity.components.SpriteComponent.sprite;
      var collision = entity.components.CollisionComponent;
      if(collision.static) {
        return;
      }
      entities.forEach(function(other) {
        if(entity === other) return;
        var otherSprite = other.components.SpriteComponent.sprite;
        var otherCollision = other.components.CollisionComponent;
        //make sure that 2 solid things don't touch
        var side = Bump.rectangleCollision(sprite, otherSprite, (collision.solid && otherCollision.solid));
        if(side == "bottom" && entity.components.PhysicsComponent) {
          entity.components.PhysicsComponent.velocity.y = 0;
        }
        /*
        if(sprite.position.y + sprite.height > otherSprite.position.y &&
           sprite.position.y + sprite.height < otherSprite.position.y + otherSprite.height &&
           sprite.position.x >= otherSprite.position.x - sprite.width &&
           sprite.position.x + sprite.width < otherSprite.x + otherSprite.width + sprite.width) {
          sprite.position.y -= (sprite.position.y + sprite.height) - otherSprite.position.y;
        }
        */
        //add other collision detection here
      });
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
      var collidable = Game.entityManager.getEntitiesByComponents(["CollisionComponent", "SpriteComponent"]);
      var paralax = function(scene, normal, direction, factor) {
        var paralax = factor || 0.6;
        entity.scene.layers.forEach(function(scene, index) {
          entity.scene.layers[index].position.x -= direction * (movement.speed * delta * normal + (index - normal)*paralax);
        });
      };
      if(Systemize.InputManager.isKeyDown(self.keys.right)) {
        //physics.velocity.x += movement.speed;
        sprite.position.x += movement.speed * delta;
        paralax(entity.scene, 1, 1);
      }
      if(Systemize.InputManager.isKeyDown(self.keys.left)) {
        //physics.velocity.x -= movement.speed;
        sprite.position.x -= movement.speed * delta;
        paralax(entity.scene, 1, -1);
      }
      if(Systemize.InputManager.isKeyDown(self.keys.space)) {
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
            if(right || left) {
              physics.velocity.y = -6;
            }
          }
        });
      }
    });
  }
});

Game.start();

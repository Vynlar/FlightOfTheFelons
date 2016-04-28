var GameScene = function(args) {
  args.layerCount = 6;
  var scene = new Systemize.Scene(args);

  //setup background sprites
  for(var i = 0; i < 4; i++) {
    var sprite = new PIXI.extras.TilingSprite(PIXI.loader.resources["background" + i].texture, Game.renderer.width * 10, Game.renderer.height);
    var background = new Systemize.Entity([
      {type: "SpriteComponent", component: {sprite: sprite}}
    ]);
    scene.addEntity(background, i);
  }

  var generateBuildings = function(options) {
    var buildings = [];
    var currentX = 0;
    var currentY = options.startHeight;
    for(var i = 0; i < options.count; i++) {
      var width = Math.floor(Math.random() * (options.maxWidth - options.minWidth) + options.minWidth);
      var dHeight = Math.floor(Math.random() * (options.deltaHeight * 2) - options.deltaHeight);
      var height = currentY + dHeight;
      if(height <= options.minHeight || height >= Game.renderer.height - options.maxHeight) {
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
      var building = new Systemize.Entity([
        {type: "SpriteComponent", component: {sprite: sprite}},
        {type: "CollisionComponent", component: {group: "solid", solid: true, static: true}},
        {type: "PhysicsComponent", component: {velocity: {x: 0, y: 0}, acceleration: {x: 0, y: 0}, friction: 0.95, solid: true, static: true}}
      ]);
      scene.addEntity(building, 4);

      //generate dirt
      sprite = new PIXI.extras.TilingSprite(PIXI.loader.resources.dirt.texture, width, Math.min(400, sprite.height));
      sprite.position.x = currentX;
      sprite.position.y = Game.renderer.height - sprite.height;
      var dirt = new Systemize.Entity([
        {type: "SpriteComponent", component: {sprite: sprite}},
      ]);
      scene.addEntity(dirt, 4);

      //generate powerups
      if(Math.random() < 0.3) {
        var powerupSprite = new PIXI.Sprite(PIXI.loader.resources.speedup.texture);
        powerupSprite.scale.x = 0.6;
        powerupSprite.scale.y = 0.6;
        powerupSprite.position.x = Math.floor(Math.random() * (width - powerupSprite.width)) + currentX;
        powerupSprite.position.y = Game.renderer.height - height - powerupSprite.height;
        var powerup = new Systemize.Entity([
          {type: "SpriteComponent", component: {sprite: powerupSprite}},
          {type: "PowerupComponent", component: {type: "speed"}}
        ]);
        scene.addEntity(powerup, 4);
      }

      //update currentX
      currentX += width;
      currentX += Math.floor(Math.random() * 30);
    }
  };
  generateBuildings({
    count: 50,
    minHeight: 100,
    maxHeight: 250,
    minWidth: 100,
    maxWidth: 400,
    deltaHeight: 100,
    startHeight: 200
  });

  var playerSprite = new PIXI.Sprite(PIXI.loader.resources.player.texture);
  playerSprite.position.y = 100;
  playerSprite.position.x = Game.renderer.width/3;
  playerSprite.scale.x = 0.2;
  playerSprite.scale.y = 0.2;
  var player = new Systemize.Entity([
    {type: "SpriteComponent", component: {sprite: playerSprite}},
    {type: "PhysicsComponent", component: {velocity: {x: 0, y: 0}, acceleration: {x: 0, y: 0.35}, friction: 0.95, solid: true, static: false}},
    {type: "CollisionComponent", component: {group: "player", solid: true}},
    {type: "MovementComponent", component: {speed: 0.3}},
    {type: "FollowComponent", component: {distance: 0}}
  ]);
  scene.addEntity(player, 4);


  playerSprite = new PIXI.Sprite(PIXI.loader.resources.player.texture);
  playerSprite.position.y = 100;
  playerSprite.position.x = Game.renderer.width/3 - 75;
  playerSprite.scale.x = 0.2;
  playerSprite.scale.y = 0.2;
  player2 = new Systemize.Entity([
    {type: "SpriteComponent", component: {sprite: playerSprite}},
    {type: "PhysicsComponent", component: {velocity: {x: 0, y: 0}, acceleration: {x: 0, y: 0.35}, friction: 0.95, solid: true, static: false}},
    {type: "CollisionComponent", component: {group: "player", solid: true}},
    {type: "MovementComponent", component: {speed: 0.3}},
  ]);
  scene.addEntity(player2, 4);

  Game.players = [player, player2];

  return scene;
};


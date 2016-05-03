var MainMenuScene = function(args) {
  args.layerCount = 5;
  var scene = new Systemize.Scene(args);

  //setup background sprites
  for(var i = 0; i < 4; i++) {
    var sprite = new PIXI.extras.TilingSprite(PIXI.loader.resources["background" + i].texture, Game.renderer.width * 10, Game.renderer.height);
    var background = new Systemize.Entity([
      {type: "SpriteComponent", component: {sprite: sprite}},
      {type: "ScrollComponent", component: {layer: i}}
    ]);
    scene.addEntity(background, i);
  }

  //logo
  var createLogo = function() {
    var sprite = new PIXI.Sprite(PIXI.loader.resources.logo.texture);
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    sprite.position.x = Game.renderer.width/2;
    sprite.position.y = Game.renderer.height/3 + 30;
    var logo = new Systemize.Entity([
      {type: "SpriteComponent", component: {sprite: sprite}}
    ]);
    scene.addEntity(logo, 4);
  };
  createLogo();

  //play button
  var createPlayButton = function() {
    var sprite = new PIXI.Sprite(PIXI.loader.resources.playButton.texture);
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    sprite.scale.x = 0.7;
    sprite.scale.y = 0.7;
    sprite.position.x = Game.renderer.width/2;
    sprite.position.y = Game.renderer.height/3*2 + 50;
    sprite.interactive = true;
    sprite.on("mousedown", function(e) {
      Game.setScene("GameScene");
    });
    var playButton = new Systemize.Entity([
      {type: "SpriteComponent", component: {sprite: sprite}}
    ]);
    scene.addEntity(playButton, 4);

  };
  createPlayButton();

  return scene;
};

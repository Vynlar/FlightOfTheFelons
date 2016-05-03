var EndScreenScene = function(args) {
  args.layerCount = 5;
  var scene = new Systemize.Scene(args);

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

  var createScoreText = function() {
    var style = {
      font: "36px Arial",
      fill: "#FFFFFF",
      stroke: "#000000",
      strokeThickness: 3,
      align: "center"
    };
    var multiplier = Game.score.components.ScoreComponent.multiplier;
    var score = Game.score.components.ScoreComponent.score;
    var total = multiplier * score * 100;
    var text = "Coins collected: " + score + "\nThieves escaped: " + multiplier +
      "\nTotal score: " + total;
    var scoreText = new PIXI.Text(text, style);
    scoreText.anchor.x = 0.5;
    scoreText.position.y = Game.renderer.height/3;
    scoreText.position.x = Game.renderer.width/2;
    var scoreEntity = new Systemize.Entity([
      {type: "SpriteComponent", component: {sprite: scoreText}}
    ]);
    scene.addEntity(scoreEntity, 4);
  };
  createScoreText();

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
      Game.reloadScene("GameScene");
      Game.setScene("GameScene");
      Game.won = false;
    });
    var playButton = new Systemize.Entity([
      {type: "SpriteComponent", component: {sprite: sprite}}
    ]);
    scene.addEntity(playButton, 4);
  };
  createPlayButton();

  return scene;
};

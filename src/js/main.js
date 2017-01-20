'use strict';

//Require de las escenas, play_scene, gameover_scene y menu_scene.
var PlayScene = require('./play_scene');
var GameOver = require('./gameover_scene');
var MenuScene = require('./menu_scene');
var GravityScene = require('./gravity_scene');  //Nueva escena para el segundo nivel
var Nivel3 = require('./nivel3');  //Nueva escena para el segundo nivel
var endGame = require('./endGame');

var BootScene = {
  preload: function () {
    // load here assets required for the loading screen
    this.game.load.image('preloader_bar', 'images/preloader_bar.png');
    this.game.load.spritesheet('button', 'images/button.png', 250, 50);
    this.game.load.image('logo', 'images/phaser.png');
  },

  create: function () {
    this.game.state.start('preloader');
      this.game.state.start('menu');
  }
};

var PreloaderScene = {
  preload: function () {
    this.loadingBar = this.game.add.sprite(100,300, 'preloader_bar');
    this.loadingBar.anchor.setTo(0, 0.5); 
    this.game.load.setPreloadSprite(this.loadingBar);
    this.game.stage.backgroundColor = "#000000";    
    
    this.load.onLoadStart.add(this.loadStart, this);
    //Carga de tilemap y animaciones    
      this.game.load.image('tiles', 'images/tileset.png');
      this.game.load.image('tiles1', 'images/Tiledef.png');
      this.game.load.image('ground', 'images/platform.png');    
      this.game.load.tilemap('tilemap', 'images/map.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.tilemap('tilemap2', 'images/map2.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.tilemap('tilemap3', 'images/map3.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.spritesheet('dude', 'images/dude.png', 32, 48);
      this.game.load.spritesheet('slime', 'images/slime.png', 35, 25);
      this.game.load.spritesheet('torreta', 'images/torreta.png', 100.5, 67);
      this.game.load.spritesheet('bullet', 'images/fuego.png', 20.5, 20);
      this.game.load.image('menuPausa', 'images/menuPausa.png', 250, 412);
      this.game.load.image('back', 'images/back.png', 800, 600);
      this.game.load.image('clouds', 'images/clouds.png', 384, 288);
      this.game.load.spritesheet('crujidor', 'images/crujidor.png', 41, 45);

      this.game.load.audio('musicaN1', 'images/Serenity.mp3');
      this.game.load.audio('musicaN2', 'images/Serenity_Invert.mp3');
      this.game.load.audio('musicaN3', 'images/MusicaNivel3.mp3');
      this.game.load.audio('salto', 'images/jump.wav');

      this.game.load.spritesheet('hermano', 'images/brother.png', 46.25, 49);
      this.game.load.image('luna', 'images/moon.png');
      this.game.load.image('diosa', 'images/diosa.png');
      this.game.load.image('mar', 'images/luzNa.png');
      this.game.load.image('playa', 'images/playa.png');
      this.game.load.audio('musiFinal', 'images/Bittersweet.mp3');
    
      //Escuchar el evento onLoadComplete con el método loadComplete que el state 'play'
      this.game.load.onLoadComplete.add(this.loadComplete, this);
  },

  loadStart: function () {
    //this.game.state.start('play');
    console.log("Game Assets Loading ...");
  },    
    
     //Function loadComplete()
     loadComplete: function(){
      this.game.state.start('play');
     },
    
    update: function(){
        this._loadingBar
    }
};


var wfconfig = {
 
    active: function() { 
        console.log("font loaded");
        init();
    },
 
    google: {
        families: ['Sniglet']
    }
 
};
 
function init(){
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

  game.state.add('boot', BootScene);
  game.state.add('menu', MenuScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('play', PlayScene);
  game.state.add('gameOver', GameOver);
  game.state.add('gravityScene', GravityScene);
  game.state.add('Nivel3', Nivel3);
  game.state.add('endGame', endGame);
  game.state.start('boot');
}

window.onload = function () {
  
  WebFont.load(wfconfig);
    
};

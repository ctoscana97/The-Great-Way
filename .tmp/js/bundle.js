(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var GameOver = {
    create: function () {
        console.log("Game Over");
        var button = this.game.add.button(400, 300, 
                                          'button', 
                                          this.actionOnClick, 
                                          this, 2, 1, 0);
        button.anchor.set(0.5);
        var goText = this.game.add.text(400, 100, "GameOver");
        var text = this.game.add.text(0, 0, "Reset Game");
        text.anchor.set(0.5);
        goText.anchor.set(0.5);
        button.addChild(text);
        
        //TODO 8 crear un boton con el texto 'Return Main Menu' que nos devuelva al menu del juego.
        var buttonMenu = this.game.add.button(400, 450, 
                                          'button', 
                                          this.volverMenu, 
                                          this, 2, 1, 0);
        buttonMenu.anchor.set(0.5);        
        var texto = this.game.add.text(0, 0, "Return Menu");
        texto.anchor.set(0.5);        
        buttonMenu.addChild(texto);
    },
    
    //TODO 7 declarar el callback del boton.
    actionOnClick: function (){
        if (this.game.currentlevel == 1){
            this.game.state.start('play');
        }
        else if(this.game.currentlevel == 2) {            
            this.game.state.start('gravityScene');
        } else {
            this.game.state.start('Nivel3');
        }
    },

    volverMenu: function (){
        this.game.world.setBounds(0,0,800,600);
        this.game.state.start('menu');

    }

};

module.exports = GameOver;

},{}],2:[function(require,module,exports){
'use strict';

var map;
var cursors;
var jumptimer = 0;
//textos
var textStart;
var textGravity;
//GameObjects
var winZone;
var areaZone;
//Pausa
var pKey;
var back; //backGround
//Salto
//var potenciaExtra = 200;
//var potenciaMinima = 325;
//Botones
var buttonMenu;
var buttonReanudar;
var texto;
var texto2;
//Audio
var musica;
var salto;
//Scena de juego.
var GravityScene = {
    
  _rush: {}, //player  

    //Método constructor...
  create: function () {      
    ///BOTONES//////////////////////////////////
    buttonMenu = this.game.add.button(400, 450, 
                                          'button', 
                                          this.volverMenu, 
                                          this, 2, 1, 0);
        buttonMenu.anchor.set(0.5);        
        texto = this.game.add.text(0, 0, "Return Menu");
        texto.anchor.set(0.5);        
        buttonMenu.addChild(texto);

        buttonReanudar = this.game.add.button(400, 450, 
                                          'button', 
                                          this.Reanudar, 
                                          this, 2, 1, 0);
      buttonReanudar.anchor.set(0.5);        
        texto2 = this.game.add.text(0, 0, "Resume");
        texto2.anchor.set(0.5);        
        buttonReanudar.addChild(texto2);
    ///////////////////////////////////////////

      //Cargar del tilemap y asignacion del tileset
      this.game.load.tilemap('tilemap2', 'images/map2.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.image('tiles', 'images/tileset.png',  null, Phaser.Tilemap.TILED_JSON); 
     
      this.map = this.game.add.tilemap('tilemap2');           
      this.map.addTilesetImage('tileset', 'tiles');

      //GameObjects
      var end = this.map.objects["Objects"][0];
      var area = this.map.objects["Objects"][1];      
      var textoPos = this.map.objects["Objects"][2];

      //Creacion de las layers     
      this.backgroundLayer = this.map.createLayer('Capa Fondo');
      this.water = this.map.createLayer('Agua');           
      this.death = this.map.createLayer('death'); //plano de muerte      
      this.decorado = this.map.createLayer('Capa Atravesable');
      this.groundLayer = this.map.createLayer('Capa Terreno'); 
      //Redimensionamos
      this.groundLayer.resizeWorld(); //resize world and adjust to the screen
      this.backgroundLayer.resizeWorld();
      this.death.resizeWorld();
      this.decorado.resizeWorld();
      this.water.resizeWorld();  

      this.textStart = this.game.add.text(50, 250, "Woops!, alguien"  + "\n" + 
        "se dejó la gravedad" + "\n" + "puesta al revés.");  
      this.textGravity = this.game.add.text(textoPos.x, textoPos.y, "Tras esa barrera"  + "\n" + 
        "de estrellas la" + "\n" + "gravedad se restaura.");

      //Personaje
      this._rush = this.game.add.sprite(20, 300, 'dude'); 
      this._rush.scale.setTo(1.2, -1.2);
      //animaciones     
      this._rush.animations.add('left', [0, 1, 2, 3], 10, true);
      this._rush.animations.add('right', [5, 6, 7, 8], 10, true); 
      //Colisiones con el plano de muerte y con el plano de muerte y con suelo.
      this.map.setCollisionBetween(1, 5000, true, 'death');    
      this.map.setCollisionBetween(1, 5000, true, 'Capa Terreno');
      this.death.visible = false;

      this.pKey = this.input.keyboard.addKey(Phaser.Keyboard.P);
      this.pKey.onDown.add(this.togglePause, this);      

      back = this.game.add.sprite(this.game.camera.x, this.game.camera.y, 'back');
      back.visible = false;

      this.winZone = new Phaser.Rectangle(end.x, end.y, end.width, end.height);
      this.areaZone = new Phaser.Rectangle(area.x, area.y, area.width, area.height);
    
      this.configure();
  },   

    //IS called one per frame.
    update: function () {
      if (!this.game.physics.arcade.isPaused){
      buttonMenu.visible = false;
      buttonReanudar.visible = false;
      back.visible = false;
      }
     var hitPlatforms = this.game.physics.arcade.collide(this._rush, this.groundLayer);
     this.cursors = this.game.input.keyboard.createCursorKeys();
      //  Reset the players velocity (movement)
     this._rush.body.velocity.x = 0;

    if (this.cursors.left.isDown)
    {
        //  Move to the left
        this._rush.body.velocity.x = -150;

        this._rush.animations.play('left');
    }
    else if (this.cursors.right.isDown)
    {
        //  Move to the right
        this._rush.body.velocity.x = 150;

        this._rush.animations.play('right');
    }
    else
    {
        //  Stand still
        this._rush.animations.stop();

        this._rush.frame = 4;
    }
    ////////////////

    //Salto ingravidez
    if (this.cursors.up.isDown && hitPlatforms && !this._rush.body.onFloor())

        {   //Como el jugador esta en el suelo se le permite saltar.
                salto.play(false);
                this.jumptimer = this.game.time.time;
                this._rush.body.velocity.y = 325;

        } else if (this.cursors.up.isDown && (this.jumptimer !== 0))
          
          { //El jugador no esta en tierra pero sigue pulsando el botón de salto.
                if ((this.game.time.time - this.jumptimer) > 600) { //El jugador ya ha recibido más impulso de salto por más de 0'6 segundos que es el máximo que le he puesto.

                    this.jumptimer = 0;

                } else { // Todavía no ha llegado a los 0'6 segundos así que puede saltar más.

                  this._rush.body.velocity.y = 325+(200/(this.game.time.time - this.jumptimer));
                }

            } else if (this.jumptimer !== 0) { //Resetea el contador del tiempo para que el jugador pueda volver a saltar.

                this.jumptimer = 0;

            }      


        this.checkPlayerFell();

        if(this.winZone.contains(this._rush.x + this._rush.width/2, 
          this._rush.y + this._rush.height/2)){
          musica.destroy();
          this.game.state.start('Nivel3'); //Siguiente nivel
        }
        if(this.areaZone.contains(this._rush.x + this._rush.width/2, 
          this._rush.y + this._rush.height/2)){
             this._rush.body.gravity.y = 750;
             this._rush.scale.setTo(1.2, 1.2);
             //potenciaMinima = -potenciaMinima;
             //potenciaExtra = -potenciaExtra;
        }
    },

    togglePause: function(){
      buttonMenu.destroy();
      buttonReanudar.destroy();
      back.visible = false;

      back = this.game.add.sprite(this.game.camera.x, this.game.camera.y, 'back');
        back.visible = true;

        //Boton 1
      buttonMenu = this.game.add.button(this.game.camera.x+400, this.game.camera.y+350, 
                                          'button', 
                                          this.volverMenu, 
                                          this, 2, 1, 0);
      buttonMenu.anchor.set(0.5);        
        texto = this.game.add.text(0, 0, "Return Menu");
        texto.anchor.set(0.5);        
        buttonMenu.addChild(texto);
      buttonMenu.visible = true;

      //Boton 2
      buttonReanudar = this.game.add.button(this.game.camera.x+400, this.game.camera.y+250, 
                                          'button', 
                                          this.Reanudar, 
                                          this, 2, 1, 0);
      buttonReanudar.anchor.set(0.5);        
        texto2 = this.game.add.text(0, 0, "Resume");
        texto2.anchor.set(0.5);        
        buttonReanudar.addChild(texto2);
      buttonReanudar.visible = true;

      this.game.physics.arcade.isPaused = (this.game.physics.arcade.isPaused) ? false : true;
    },
    volverMenu: function (){
      musica.destroy();
        this.game.state.start('boot');

    },
    Reanudar: function(){
      this.game.physics.arcade.isPaused = (this.game.physics.arcade.isPaused) ? false : true;
    },     
    
    onPlayerFell: function(){
        //TODO 6 Carga de 'gameOver';
        musica.destroy();
        this.game.state.start('gameOver');
    },
    
    checkPlayerFell: function(){
        if(this.game.physics.arcade.collide(this._rush, this.death))
            this.onPlayerFell();
    },
    
    //configure the scene
    configure: function(){
        //Start the Arcade Physics systems
        this.game.world.setBounds(0, 0, 3200, 1600);
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.stage.backgroundColor = '#a9f0ff';
        this.game.physics.arcade.enable(this._rush);
        this.game.currentlevel = 2;

        musica = this.game.add.audio('musicaN2');
        musica.loop = true;
        musica.play();

        salto = this.game.add.audio('salto');
        
        this._rush.body.bounce.y = 0.2;
        this._rush.body.gravity.y = -750;
        this._rush.body.collideWorldBounds = true;
        this._rush.body.gravity.x = 0;
        this._rush.body.velocity.x = 0;
        this.game.camera.follow(this._rush);
    },
    //move the player
    movement: function(point, xMin, xMax){
        this._rush.body.velocity = point;// * this.game.time.elapseTime;
        
        if((this._rush.x < xMin && point.x < 0)|| (this._rush.x > xMax && point.x > 0))
            this._rush.body.velocity.x = 0;

    },    
 
};

module.exports = GravityScene;
},{}],3:[function(require,module,exports){
'use strict';

//Require de las escenas, play_scene, gameover_scene y menu_scene.
var PlayScene = require('./play_scene');
var GameOver = require('./gameover_scene');
var MenuScene = require('./menu_scene');
var GravityScene = require('./gravity_scene');  //Nueva escena para el segundo nivel
var Nivel3 = require('./nivel3');  //Nueva escena para el segundo nivel

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
  game.state.start('boot');
}

window.onload = function () {
  
  WebFont.load(wfconfig);
    
};

},{"./gameover_scene":1,"./gravity_scene":2,"./menu_scene":4,"./nivel3":5,"./play_scene":6}],4:[function(require,module,exports){
var MenuScene = {
    create: function () {
        
        var logo = this.game.add.sprite(this.game.camera.x+400, 
                                        this.game.camera.y+350, 
                                        'logo');
        logo.anchor.setTo(0.5, 0.5);
        var buttonStart = this.game.add.button(this.game.camera.x+400,
                                               this.game.camera.y+350, 
                                               'button', 
                                               this.actionOnClick, 
                                               this, 2, 1, 0);
        buttonStart.anchor.set(0.5);

        var textStart = this.game.add.text(0, 0, "Start");
        textStart.font = 'Sniglet';
        textStart.anchor.set(0.5);
        buttonStart.addChild(textStart);
    },
    
    actionOnClick: function(){
        this.game.state.start('preloader');
    } 
};

module.exports = MenuScene;

},{}],5:[function(require,module,exports){
'use strict';

//Enumerados: PlayerState son los estado por los que pasa el player. Directions son las direcciones a las que se puede
//mover el player.

var map;
var cursors;
var disparanding;
var jumptimer = 0;
//GameObjects
var winZone;
var Bullet;//function
//Groups
var platforms;
var bullets;
var slimes;
var torretas;
var rocks;
//textos
var textStart;
//Pausa
var pKey;
var back; //backGround
var boolRocas = false;

var buttonMenu;
var buttonReanudar;
var _rush = 10;
var texto;
var texto2;
//Sonidos
var musica;
var salto;
//funcion


    ///

//Scena de juego.
var Nivel3 = {
    menu: {},
    //_rush: {}, //player
    slime: {},
    torreta: {},

  //Método constructor...
    create: function () {    
      //plataforma
    platforms = this.game.add.group();

    platforms.enableBody = true;

    var ledge = platforms.create(400, 240, 'ground');
    ledge.body.immovable = true;
    ledge.scale.setTo(0.24, 0.5);
    platforms.add(ledge);
 
    var ledge = platforms.create(665, 145, 'ground');
    ledge.body.immovable = true;
    ledge.scale.setTo(0.12, 0.5);
    platforms.add(ledge);

     var ledge = platforms.create(1025, 543, 'ground');
    ledge.body.immovable = true;
    ledge.scale.setTo(0.65, 0.5);
    platforms.add(ledge);

    var ledge = platforms.create(153, 545, 'ground');
    ledge.body.immovable = true;
    ledge.scale.setTo(0.15, 0.5);
    platforms.add(ledge);

    var ledge = platforms.create(1250, 960, 'ground');
    ledge.body.immovable = true;
    ledge.scale.setTo(0.24, 0.5);
    platforms.add(ledge);
 
    var ledge = platforms.create(1380, 1030, 'ground');
    ledge.body.immovable = true;
    ledge.scale.setTo(0.24, 0.5);
    platforms.add(ledge);

    platforms.alpha = 0;
    ///BOTONES
    buttonMenu = this.game.add.button(400, 450, 
                                          'button', 
                                          this.volverMenu, 
                                          this, 2, 1, 0);
        buttonMenu.anchor.set(0.5);        
        texto = this.game.add.text(0, 0, "Return Menu");
        texto.anchor.set(0.5);        
        buttonMenu.addChild(texto);

        buttonReanudar = this.game.add.button(400, 450, 
                                          'button', 
                                          this.Reanudar, 
                                          this, 2, 1, 0);
      buttonReanudar.anchor.set(0.5);        
        texto2 = this.game.add.text(0, 0, "Resume");
        texto2.anchor.set(0.5);        
        buttonReanudar.addChild(texto2);
    ///////////////////////////////////////////  

      //Cargar del tilemap y asignacion del tileset 

      this.map = this.game.add.tilemap('tilemap3');           
      this.map.addTilesetImage('tileset', 'tiles1');     
      //Objetos del mapa creados con Tiled      
      var end = this.map.objects["Objects"][0];
      this.winZone = new Phaser.Rectangle(end.x, end.y, end.width, end.height);

      //Creacion de las layers     
                 
      this.death = this.map.createLayer('death'); //plano de muerte      
      this.decorado = this.map.createLayer('Capa Transparente');

      this.groundLayer = this.map.createLayer('Capa Principal');       
      //Redimension
      this.groundLayer.resizeWorld(); //resize world and adjust to the screen
      //this.backgroundLayer.resizeWorld();
      this.death.resizeWorld();
      this.decorado.resizeWorld();

      //Elementos de menu de pausa
      back = this.game.add.sprite(this.game.camera.x, this.game.camera.y, 'back');
      back.visible = false;

      //Personaje      
      _rush = this.game.add.sprite(50, 50, 'dude');//(start.x, start.y, 'dude'); 
      _rush.scale.setTo(0.6, 0.6);

      //animaciones     
      _rush.animations.add('left', [0, 1, 2, 3], 10, true);
      _rush.animations.add('right', [5, 6, 7, 8], 10, true); 

      //Colisiones con el plano de muerte y con el plano de muerte y con suelo.
      this.map.setCollisionBetween(1, 5000, true, 'death');    
      this.map.setCollisionBetween(1, 5000, true, 'Capa Principal');
      this.death.visible = false; 

      //Zona de Final del nivel
      //this.winZone = new Phaser.Rectangle(end.x, end.y, end.width, end.height);

      //tecla de Pausa
      this.pKey = this.input.keyboard.addKey(Phaser.Keyboard.P);
      this.pKey.onDown.add(this.togglePause, this);

      musica = this.game.add.audio('musicaN3');
      musica.loop = true;
      musica.play();

      salto = this.game.add.audio('salto');

      this.configure();
//slime/////////////////////
    slimes = this.game.add.group();

    this.CreaSlime(400, 215, this.game);
    this.CreaSlime(650, 120, this.game);
    this.CreaSlime(1200,520, this.game);
    this.CreaSlime(150, 520, this.game);
    this.CreaSlime(1250, 920, this.game);
    this.CreaSlime(1375, 1000, this.game);

///////////Torretas
      torretas = this.game.add.group();
      this.CreaTorreta(780, 40, this.game, 0, 100, 100, -10);
      this.CreaTorreta(1325, 120, this.game, 0, 100, 100, -10);
      this.CreaTorreta(420, 360, this.game, 215, 100, 100, 10);
      this.CreaTorreta(140, 690, this.game, 225, 100, 100, 10);
      this.CreaTorreta(260, 720, this.game, -20, -100, 60, -10);

//balas
bullets = this.game.add.group();
bullets.enableBody = true;
      
      ///Crujidores
      rocks = this.game.add.group();

      for(var i = 0; i < 3; i++){
      var crujidor = this.game.add.sprite(850 + (i*120), 80, 'crujidor');
      this.game.physics.arcade.enable(crujidor);
      crujidor.body.bounce.y = 0;
      crujidor.body.gravity.y = 0;
      crujidor.body.collideWorldBounds = true;
      crujidor.body.immovable = true;
      crujidor.body.velocity.y = -50;
      crujidor.animations.add('cae', [0, 1, 2, 3], 5, false);
      //torreta.animations.play('stand');
      rocks.add(crujidor);
      }

      for(var i = 0; i < 9; i++){
      var crujidor = this.game.add.sprite(360 + (i*80), 900, 'crujidor');
      this.game.physics.arcade.enable(crujidor);
      crujidor.body.bounce.y = 0;
      crujidor.body.gravity.y = 0;
      crujidor.body.collideWorldBounds = true;
      crujidor.body.immovable = true;
      crujidor.body.velocity.y = -50;
      crujidor.animations.add('cae', [0, 1, 2, 3], 5, false);
      //torreta.animations.play('stand');
      rocks.add(crujidor);
      }
///agua azul
      this.water = this.map.createLayer('Efecto Azul');
      this.water.resizeWorld();
      this.water.alpha = 0.3;

  },
      
    //IS called one per frame.
    update: function () {
      //Ocultar la interfaz del menu de pausa
    if (!this.game.physics.arcade.isPaused){
      buttonMenu.visible = false;
      buttonReanudar.visible = false;
      back.visible = false;
    }


    var hitPlatforms = this.game.physics.arcade.collide(_rush, this.groundLayer);
    this.game.physics.arcade.collide(_rush,rocks, this.RocaMata, null, this);
    this.game.physics.arcade.collide(_rush, slimes, this.MatasOMueres, null, this);
    this.game.physics.arcade.collide(bullets, this.groundLayer, this.MataBala, null, this);
    this.game.physics.arcade.collide(_rush, bullets, this.onPlayerFell, null, this);
    this.cursors = this.game.input.keyboard.createCursorKeys();
      //  Reset the players velocity (movement)
     _rush.body.velocity.x = 0;

    if (this.cursors.left.isDown)
    {
        //  Move to the left
        _rush.body.velocity.x = -75;

        _rush.animations.play('left');
    }
    else if (this.cursors.right.isDown)
    {
        //  Move to the right
        _rush.body.velocity.x = 75;        

        _rush.animations.play('right');
    }
    else
    {
        //  Stand still
        _rush.animations.stop();

        _rush.frame = 4;
    }
    ////////////////
   
    if (this.cursors.up.isDown && hitPlatforms && _rush.body.onFloor())

        {   //player is on the ground, so he is allowed to start a jump
                salto.play(false);
                this.jumptimer = this.game.time.time;
                _rush.body.velocity.y = -100;

        } else if (this.cursors.up.isDown && (this.jumptimer !== 0))
          
          { //player is no longer on the ground, but is still holding the jump key
                if ((this.game.time.time - this.jumptimer) > 400) { // player has been holding jump for over 600 millliseconds, it's time to stop him

                    this.jumptimer = 0;

                } else { // player is allowed to jump higher, not yet 600 milliseconds of jumping

                  //this._rush.body.velocity.y -= 15;//525
                  _rush.body.velocity.y = -100-(90/(this.game.time.time - this.jumptimer));
                }

            } else if (this.jumptimer !== 0) { //reset jumptimer since the player is no longer holding the jump key

                this.jumptimer = 0;

            }   

        this.checkPlayerFell();

        //Para terminar el nivel:
        if(this.winZone.contains(_rush.x + _rush.width/2, _rush.y + _rush.height/2)){
          musica.destroy();
          this.game.state.start('boot'); //Cargamos siguiente nivel
        }


      this.game.physics.arcade.collide(slimes, platforms, function (slime, platform) {

          if (slime.body.velocity.x > 0 && slime.x > platform.x + (platform.width - (slime.width + 5)) ||
                  slime.body.velocity.x < 0 && slime.x < platform.x) {
              slime.body.velocity.x *= -1; 
          }
            slime.body.velocity.y = -40;

      });
      
      this.game.physics.arcade.collide(rocks, this.groundLayer, function (roca, suelo) {
        
        //roca.body.velocity.y = 0;
 
      });
      //console.log(_rush.body.blocked.down);
      //this.muevete(rocks);
      rocks.forEach(function(roca) {
        if(roca.body.blocked.up){
          roca.body.velocity.y = -1;
        }
        if (roca.body.onFloor()){
              roca.body.velocity.y = -30;
          }
        if(_rush.x > roca.x - 50 && _rush.x < roca.x + 50){
            if (roca.body.blocked.up ){ //_rush.x <= roca.x) || (_rush.x >= roca.x && _rush.x < roca.x + 50)){
              roca.body.velocity.y = 250;
              roca.animations.play('cae');
            }
          }
        
      }, this);

//balas
    /*Bullet = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, "bullet"); 
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    }

    Bullet.prototype = Object.create(Phaser.Sprite.prototype);
    Bullet.prototype.constructor = Bullet;*/


    /*this.game.physics.arcade.collide(bullets, this.groundLayer, function (bullet) {
        bullet.destroy();
    });*/
 

    },

    CreaSlime: function(x, y, game){
    var slime = this.game.add.sprite(x, y, 'slime');//1-(400,215)//2-(650,120)//3-(1200,520)//4-(150,520)//5-(1250,920)//6-(1375,1000)
    this.game.physics.arcade.enable(slime);
    slime.scale.setTo(0.7, 0.7);
    slime.body.bounce.y = 0.2;
    slime.body.gravity.y = 300;
    slime.body.velocity.x = 40;
    slime.body.collideWorldBounds = true;
    slime.animations.add('princi', [0, 1, 2, 3, 4], 5, true);
    slime.animations.play('princi');
    slimes.add(slime);

    },

    CreaTorreta: function(x, y, game, angle, velHor, velVer, spawn){
      var torreta = this.game.add.sprite(x, y, 'torreta');
      torreta.scale.setTo(0.7, 0.7);
      torreta.angle = angle;
      disparanding = torreta.animations.add('stand', [0, 1, 2, 3], 1, true);
      //torreta.animations.play('stand');
      disparanding.onLoop.add(this.Dispara, {velX: velHor, velY: velVer, posX: torreta.x + spawn, posY: torreta.y, game: this.game }, this);
      torretas.add(torreta);

    },

        Dispara: function (velX, velY, posX, posY, game){
        //var bullet = bullets.create(posX, posY, 'bullet');
        var bullet = this.game.add.sprite(this.posX, this.posY, 'bullet');
        //var bullet = Phaser.Sprite.call(this, game, posX, posY, "bullet");
        this.game.physics.arcade.enable(bullet);
        bullet.body.bounce.y = 0.2;
        bullet.body.velocity.y = this.velY; //80;
        bullet.body.velocity.x = this.velX; //-30;
        //console.log(bullets);
        bullets.add(bullet);

      },


    MataBala: function(bala, suelo) {
      
      bala.destroy();
    },

    MatasOMueres: function(player, slime){

      if (player.body.touching.left || player.body.touching.right){
        musica.destroy();
          this.game.state.start('gameOver');        
      } else if (player.body.touching.down){
          slime.kill();
      }
    },

    RocaMata: function(player, roca){
      if (player.body.touching.left || player.body.touching.right || player.body.touching.up){
        musica.destroy();
          this.game.state.start('gameOver');
        }
    },

    togglePause: function(){
      musica.pause();
      buttonMenu.destroy();
      buttonReanudar.destroy();
      back.visible = false;

      back = this.game.add.sprite(this.game.camera.x, this.game.camera.y, 'back');
        back.visible = true;

        //Boton 1
      buttonMenu = this.game.add.button(this.game.camera.x+400, this.game.camera.y+350, 
                                          'button', 
                                          this.volverMenu, 
                                          this, 2, 1, 0);
      buttonMenu.anchor.set(0.5);        
        texto = this.game.add.text(0, 0, "Return Menu");
        texto.anchor.set(0.5);        
        buttonMenu.addChild(texto);
      buttonMenu.visible = true;

      //Boton 2
      buttonReanudar = this.game.add.button(this.game.camera.x+400, this.game.camera.y+250, 
                                          'button', 
                                          this.Reanudar, 
                                          this, 2, 1, 0);
      buttonReanudar.anchor.set(0.5);        
        texto2 = this.game.add.text(0, 0, "Resume");
        texto2.anchor.set(0.5);        
        buttonReanudar.addChild(texto2);
      buttonReanudar.visible = true;

      this.game.physics.arcade.isPaused = (this.game.physics.arcade.isPaused) ? false : true;
    },
    volverMenu: function (){
        this.game.state.start('gravityScene');

    },
    Reanudar: function(){
      this.game.physics.arcade.isPaused = (this.game.physics.arcade.isPaused) ? false : true;
      musica.resume();
    },

    onPlayerFell: function(){
        //TODO 6 Carga de 'gameOver';
        musica.destroy();
        this.game.state.start('gameOver');
    },    
    checkPlayerFell: function(){
        if(this.game.physics.arcade.collide(_rush, this.death))
            this.onPlayerFell();
    },
    
    //configure the scene
    configure: function(){
        //Start the Arcade Physics systems
        this.game.world.setBounds(0, 0, 1920, 1280);
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.stage.backgroundColor = '#a9f0ff';
        this.game.physics.arcade.enable(_rush);
        this.game.currentlevel = 3;
        
        _rush.body.bounce.y = 0.2;
        _rush.body.gravity.y = 140;
        _rush.body.collideWorldBounds = true;
        _rush.body.gravity.x = 0;
        _rush.body.velocity.x = 0;

        this.game.camera.follow(_rush);
    },
    //move the player
    movement: function(point, xMin, xMax){
        _rush.body.velocity = point;// * this.game.time.elapseTime;
        
        if((_rush.x < xMin && point.x < 0)|| (_rush.x > xMax && point.x > 0))
            _rush.body.velocity.x = 0;
    },   
};

module.exports = Nivel3;

},{}],6:[function(require,module,exports){
'use strict';

//Enumerados: PlayerState son los estado por los que pasa el player. Directions son las direcciones a las que se puede
//mover el player.

var map;
var cursors;
var disparanding;
var jumptimer = 0;
//GameObjects
var winZone;
var propulsion1;
var propulsion2;
var finalZone;
var finalZone2;
var platforms;
var bullets;
var Bullet;
var nubes;
//textos
var textStart;
//Pausa
var pKey;
var back; //backGround

var buttonMenu;
var buttonReanudar;

var texto;
var texto2;
//Audio
var musica;
var salto;
//Scena de juego.
var PlayScene = {
  menu: {},
    _rush: {}, //player
    slime: {},
    torreta: {},
    nube: {},
    nube2: {},
    nube3: {},

  //Método constructor...
    create: function () {    
      //plataforma para el deslizamiento del slime
    platforms = this.game.add.group();
	platforms.enableBody = true;

	nubes = this.game.add.group();
	nubes.enableBody = true;

    var ledge = platforms.create(2400, 385, 'ground');
    ledge.body.immovable = true;
    ledge.scale.setTo(0.8, 0.9);
    ///BOTONES//////////////////////////////////
    buttonMenu = this.game.add.button(400, 450, 
                                          'button', 
                                          this.volverMenu, 
                                          this, 2, 1, 0);
        buttonMenu.anchor.set(0.5);        
        texto = this.game.add.text(0, 0, "Return Menu");
        texto.anchor.set(0.5);        
        buttonMenu.addChild(texto);

        buttonReanudar = this.game.add.button(400, 450, 
                                          'button', 
                                          this.Reanudar, 
                                          this, 2, 1, 0);
      buttonReanudar.anchor.set(0.5);        
        texto2 = this.game.add.text(0, 0, "Resume");
        texto2.anchor.set(0.5);        
        buttonReanudar.addChild(texto2); 

      //Cargar del tilemap y asignacion del tileset
      //this.game.load.tilemap('tilemap', 'images/map.json', null, Phaser.Tilemap.TILED_JSON);
      //this.game.load.image('tiles', 'images/tileset.png',  null, Phaser.Tilemap.TILED_JSON); 

      this.map = this.game.add.tilemap('tilemap');           
      this.map.addTilesetImage('tileset', 'tiles');     
      //Objetos del mapa creados con Tiled
      var start = this.map.objects["Objects"][0];
      var end = this.map.objects["Objects"][1];
      var slimePos = this.map.objects["Objects"][2];  
      var torretaPos = this.map.objects["Objects"][3];
      var slimePos2 = this.map.objects["Objects"][4]; 
      var slimePos3 = this.map.objects["Objects"][5]; 
      var setaPos1 =  this.map.objects["Objects"][6];
      var setaPos2 =  this.map.objects["Objects"][7];  
      var finalPos =  this.map.objects["Objects"][8];
      var finalPos2 =  this.map.objects["Objects"][9]; 

    
    //NUBES
	    this.nube = this.game.add.sprite(400, slimePos.y, 'clouds');
	    this.game.physics.arcade.enable(this.nube);
	    this.nube.body.velocity.x = -30;
	    this.nube2 = this.game.add.sprite(1200, start.y-100, 'clouds');
	    this.game.physics.arcade.enable(this.nube2);
	    this.nube2.body.velocity.x = -30;
	    this.nube3 = this.game.add.sprite(2000, setaPos1.y-100, 'clouds');
	    this.game.physics.arcade.enable(this.nube3);
	    this.nube3.body.velocity.x = -30;
    //LAYERS
      this.backgroundLayer = this.map.createLayer('Capa Fondo');
      this.water = this.map.createLayer('Agua');           
      this.death = this.map.createLayer('death'); //plano de muerte      
      this.decorado = this.map.createLayer('Capa Atravesable');
      //Inicializacion de la torreta.
      this.torreta = this.game.add.sprite(1450, 580, 'torreta');
      disparanding = this.torreta.animations.add('stand', [0, 1, 2, 3], 2, true);
      //Llama al método Dispara en cada vuelta del loop de la animación.
      disparanding.onLoop.add(this.Dispara, this);
      this.groundLayer = this.map.createLayer('Capa Terreno');       
      //Redimension
      this.groundLayer.resizeWorld(); //resize world and adjust to the screen
      this.backgroundLayer.resizeWorld();
      this.death.resizeWorld();
      this.decorado.resizeWorld();
      this.water.resizeWorld(); 
      
      //Texto de tutorial
      this.textStart = this.game.add.text(50, 450, "Bienvenido!, recuerda que"  + "\n" + 
        "puedes saltar diferente distancia" + "\n" + "dependiendo de cuanto pulses el botón de salto.");

      //Elementos de menu de pausa
      back = this.game.add.sprite(this.game.camera.x, this.game.camera.y, 'back');
      back.visible = false;

      //Personaje      
      this._rush = this.game.add.sprite(start.x, start.y, 'dude');//(start.x, start.y, 'dude'); 
      this._rush.scale.setTo(1.2, 1.2);
      //animaciones     
      this._rush.animations.add('left', [0, 1, 2, 3], 10, true);
      this._rush.animations.add('right', [5, 6, 7, 8], 10, true); 

      //Colisiones con el plano de muerte y con el plano de muerte y con suelo.
      this.map.setCollisionBetween(1, 5000, true, 'death');    
      this.map.setCollisionBetween(1, 5000, true, 'Capa Terreno');
      this.death.visible = false; 

      //Zona de Final del nivel
      this.winZone = new Phaser.Rectangle(end.x, end.y, end.width, end.height);
      //Zonas de impulso
      this.propulsion1 = new Phaser.Rectangle(setaPos1.x, setaPos1.y, setaPos1.width, setaPos1.height);
      this.propulsion2 = new Phaser.Rectangle(setaPos2.x, setaPos2.y, setaPos2.width, setaPos2.height);
      //Zonas colision nubes
      this.finalZone = new Phaser.Rectangle(finalPos.x, finalPos.y, finalPos.width, finalPos.height);
      this.finalZone2 = new Phaser.Rectangle(finalPos2.x, finalPos2.y, finalPos2.width, finalPos2.height);

      //tecla de Pausa
      this.pKey = this.input.keyboard.addKey(Phaser.Keyboard.P);
      this.pKey.onDown.add(this.togglePause, this);      

      this.configure();
//Inicialización del slime
    this.slime = this.game.add.sprite(slimePos.x, slimePos.y, 'slime');
    this.game.physics.arcade.enable(this.slime);
    this.slime.body.bounce.y = 0.2;
    this.slime.body.gravity.y = 300;
    this.slime.body.velocity.x = 80;
    this.slime.body.collideWorldBounds = true;
    this.slime.animations.add('princi', [0, 1, 2, 3, 4], 5, true);

   

//Añadido del grupo balas.
bullets = this.game.add.group();
bullets.enableBody = true;


  },
      
    //IS called one per frame.
    update: function () {
      //Ocultar la interfaz del menu de pausa
    if (!this.game.physics.arcade.isPaused){
      buttonMenu.visible = false;
      buttonReanudar.visible = false;
      back.visible = false;
    }
    //Reproducción de la animación del slime.
    this.slime.animations.play('princi');
    //Reproducción de la animación de la torreta.
    this.torreta.animations.play('stand');
    //Colisión entre el jugador y el terreno.
    var hitPlatforms = this.game.physics.arcade.collide(this._rush, this.groundLayer);
    //Llama al método matas o mueres al colisionar con el slime.
  	this.game.physics.arcade.collide(this._rush, this.slime, this.MatasOMueres, null, this);
  	//Mata al personaje al tocar una bala.
  	this.game.physics.arcade.collide(this._rush, bullets, this.onPlayerFell, null, this);
    this.cursors = this.game.input.keyboard.createCursorKeys();
      //  Reset the players velocity (movement)
     this._rush.body.velocity.x = 0;

    if (this.cursors.left.isDown)
    {
        //  Move to the left
        this._rush.body.velocity.x = -150;

        this._rush.animations.play('left');
    }
    else if (this.cursors.right.isDown)
    {
        //  Move to the right
        this._rush.body.velocity.x = 150;        

        this._rush.animations.play('right');
    }
    else
    {
        //  Stand still
        this._rush.animations.stop();

        this._rush.frame = 4;
    }
   
    if (this.cursors.up.isDown && hitPlatforms && this._rush.body.onFloor())

        {   //Como el jugador esta en el suelo se le permite saltar.
        		salto.play(false);
                this.jumptimer = this.game.time.time;
                this._rush.body.velocity.y = -325;

        } else if (this.cursors.up.isDown && (this.jumptimer !== 0))
          
          { //El jugador no esta en tierra pero sigue pulsando el botón de salto.
                if ((this.game.time.time - this.jumptimer) > 600) { //El jugador ya ha recibido más impulso de salto por más de 0'6 segundos que es el máximo que le he puesto.

                    this.jumptimer = 0;

                } else { // Todavía no ha llegado a los 0'6 segundos así que puede saltar más.

                  this._rush.body.velocity.y = -325-(200/(this.game.time.time - this.jumptimer));//200 partido del tiempo porque hasta 525 era lo máximo que se quería que saltase.
                }

            } else if (this.jumptimer !== 0) { //Resetea el contador del tiempo para que el jugador pueda volver a saltar.

                this.jumptimer = 0;

            }   

        this.checkPlayerFell();

        //Para terminar el nivel:
        if(this.winZone.contains(this._rush.x + this._rush.width/2, this._rush.y + this._rush.height/2)){
        	musica.destroy();
          this.game.state.start('gravityScene'); //Cargamos siguiente nivel
        }

        //Zonas de propulsion
        if(this.propulsion1.contains(this._rush.x + this._rush.width/2, this._rush.y + this._rush.height/2)){
          //this._rush.body.velocity.y = -1200; //(por implementar)
          //this._rush.body.velocity.x = 500;
        }

         if(this.finalZone.contains(this.nube.x + this.nube.width/2, this.nube.y + this.nube.height/2)){
        		this.nube.x = this.finalZone2.x;
        }



        this.game.physics.arcade.collide(this._rush, this.slime);

    //Hace que el slime recorra la plataforma en la que esté y gire antes de caerse para seguir recorriéndola indefinidamente.
      this.game.physics.arcade.collide(this.slime, platforms, function (slime, platform) {

          if (slime.body.velocity.x > 0 && slime.x > platform.x + (platform.width - (slime.width + 5)) ||
                  slime.body.velocity.x < 0 && slime.x < platform.x) {
              slime.body.velocity.x *= -1; 
          }
            slime.body.velocity.y = -80;

      });

//Creación del prototipo balas.
    Bullet = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, "bullet"); 
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    }

    Bullet.prototype = Object.create(Phaser.Sprite.prototype);
    Bullet.prototype.constructor = Bullet;

    //Destrucción de la bala al tocar el terreno.
    this.game.physics.arcade.collide(bullets, this.groundLayer, function (bullet) {
        bullet.destroy();
    });
 

    },
    //Función que se llama al tocar al slime. Si le tocas por los lados mueres y si saltas encima le matas.
    MatasOMueres: function(){

      if (this._rush.body.touching.left || this._rush.body.touching.right){
          this.game.state.start('gameOver');        
      } else if (this._rush.body.touching.down){
          this.slime.kill();
      }
    },


    //Constructora de la bala
    Dispara: function(){
        var bullet = new Bullet(this.game, this.torreta.x + 10, this.torreta.y + 10);
        bullet.body.velocity.y = 80;
        bullet.body.velocity.x = -150;
        bullets.add(bullet);
    },
    togglePause: function(){
      buttonMenu.destroy();
      buttonReanudar.destroy();
      back.visible = false;

      back = this.game.add.sprite(this.game.camera.x, this.game.camera.y, 'back');
        back.visible = true;

        //Boton 1
      buttonMenu = this.game.add.button(this.game.camera.x+400, this.game.camera.y+350, 
                                          'button', 
                                          this.volverMenu, 
                                          this, 2, 1, 0);
      buttonMenu.anchor.set(0.5);        
        texto = this.game.add.text(0, 0, "Return Menu");
        texto.anchor.set(0.5);        
        buttonMenu.addChild(texto);
      buttonMenu.visible = true;

      //Boton 2
      buttonReanudar = this.game.add.button(this.game.camera.x+400, this.game.camera.y+250, 
                                          'button', 
                                          this.Reanudar, 
                                          this, 2, 1, 0);
      buttonReanudar.anchor.set(0.5);        
        texto2 = this.game.add.text(0, 0, "Resume");
        texto2.anchor.set(0.5);        
        buttonReanudar.addChild(texto2);
      buttonReanudar.visible = true;

      this.game.physics.arcade.isPaused = (this.game.physics.arcade.isPaused) ? false : true;
    },
    volverMenu: function (){
    	musica.destroy();
        //this.game.state.start('gravityScene');
        this.game.state.start('menu');

    },
    Reanudar: function(){
      this.game.physics.arcade.isPaused = (this.game.physics.arcade.isPaused) ? false : true;
    },

    onPlayerFell: function(){
        //TODO 6 Carga de 'gameOver';
        musica.destroy();
        this.game.state.start('gameOver');
    },    
    checkPlayerFell: function(){
        if(this.game.physics.arcade.collide(this._rush, this.death))
            this.onPlayerFell();
    },
    
    //configure the scene
    configure: function(){
        //Start the Arcade Physics systems
        this.game.world.setBounds(0, 0, 3200, 1600);
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.stage.backgroundColor = '#a9f0ff';
        this.game.physics.arcade.enable(this._rush);
        this.game.currentlevel = 1;

        musica = this.game.add.audio('musicaN1');
     	musica.loop = true;
      	musica.play();

      	salto = this.game.add.audio('salto');
        
        this._rush.body.bounce.y = 0.2;
        this._rush.body.gravity.y = 750;
        this._rush.body.collideWorldBounds = true;
        this._rush.body.gravity.x = 0;
        this._rush.body.velocity.x = 0;

        this.game.camera.follow(this._rush);
    },
    //move the player
    movement: function(point, xMin, xMax){
        this._rush.body.velocity = point;// * this.game.time.elapseTime;
        
        if((this._rush.x < xMin && point.x < 0)|| (this._rush.x > xMax && point.x > 0))
            this._rush.body.velocity.x = 0;
    },    
 
};

module.exports = PlayScene;

/*
 if (this.cursors.up.isDown && hitPlatforms && this._rush.body.onFloor())

        {   //player is on the ground, so he is allowed to start a jump
                this.jumptimer = this.game.time.time;
                this._rush.body.velocity.y = -1000;

        } else if (this.cursors.up.isDown && (this.jumptimer !== 0))
          
          { //player is no longer on the ground, but is still holding the jump key
                if ((this.game.time.time - this.jumptimer) > 325) { // player has been holding jump for over 600 millliseconds, it's time to stop him

                    this.jumptimer = 0;

                } else { // player is allowed to jump higher, not yet 600 milliseconds of jumping

                  //this._rush.body.velocity.y -= 15;//525
                  this._rush.body.velocity.y = -400-(120/(this.game.time.time - this.jumptimer));
                }

            } else if (this.jumptimer !== 0) { //reset jumptimer since the player is no longer holding the jump key

                this.jumptimer = 0;

            } 
*/
},{}]},{},[3]);

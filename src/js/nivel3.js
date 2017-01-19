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
      /*var start = this.map.objects["Objects"][0];
      var end = this.map.objects["Objects"][1];
      var slimePos = this.map.objects["Objects"][2];  
      var torretaPos = this.map.objects["Objects"][3];*/  

      //Creacion de las layers     
      //this.backgroundLayer = this.map.createLayer('Capa Fondo');
                 
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
        /*if(this.winZone.contains(this._rush.x + this._rush.width/2, this._rush.y + this._rush.height/2))
          this.game.state.start('gravityScene');*/ //Cargamos siguiente nivel
    //this.game.physics.arcade.collide(this._rush, this.slime);


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

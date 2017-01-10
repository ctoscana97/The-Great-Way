'use strict';

//Enumerados: PlayerState son los estado por los que pasa el player. Directions son las direcciones a las que se puede
//mover el player.

var map;
var cursors;
var disparanding;
var jumptimer = 0;
//GameObjects
var winZone;
var platforms;
var bullets;
//textos
var textStart;
//Pausa
var pKey;
var back; //backGround

var buttonMenu;
var buttonReanudar;

var texto;
var texto2;
  function DestruyeBalas(suelo, bullet){
    //NO FUNCIONA
      bullet.destroy();
    }
//Scena de juego.
var PlayScene = {
  menu: {},
    _rush: {}, //player
    slime: {},
    torreta: {},

  //Método constructor...
    create: function () {    
      //plataforma
    platforms = this.game.add.group();

    platforms.enableBody = true;

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
    ///////////////////////////////////////////  

      //Cargar del tilemap y asignacion del tileset
      this.game.load.tilemap('tilemap', 'images/map.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.image('tiles', 'images/tileset.png',  null, Phaser.Tilemap.TILED_JSON); 

      this.map = this.game.add.tilemap('tilemap');           
      this.map.addTilesetImage('tileset', 'tiles');     
      //Objetos del mapa creados con Tiled
      var start = this.map.objects["Objects"][0];
      var end = this.map.objects["Objects"][1];
      var slimePos = this.map.objects["Objects"][2];  
      var torretaPos = this.map.objects["Objects"][3];  

      //Creacion de las layers     
      this.backgroundLayer = this.map.createLayer('Capa Fondo');
      this.water = this.map.createLayer('Agua');           
      this.death = this.map.createLayer('death'); //plano de muerte      
      this.decorado = this.map.createLayer('Capa Atravesable');
      //torreta
      this.torreta = this.game.add.sprite(1450, 580, 'torreta');
      disparanding = this.torreta.animations.add('stand', [0, 1, 2, 3], 1, true);
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

      //tecla de Pausa
      this.pKey = this.input.keyboard.addKey(Phaser.Keyboard.P);
      this.pKey.onDown.add(this.togglePause, this);      

      this.configure();
//slime
    this.slime = this.game.add.sprite(slimePos.x, slimePos.y, 'slime');
    this.game.physics.arcade.enable(this.slime);
    this.slime.body.bounce.y = 0.2;
    this.slime.body.gravity.y = 300;
    this.slime.body.velocity.x = 80;
    this.slime.body.collideWorldBounds = true;
    this.slime.animations.add('princi', [0, 1, 2, 3, 4], 5, true);

//balas
bullets = this.game.add.group();
bullets.enableBody = true;


  },
      
    //IS called one per frame.
    update: function () {

      //Ocultar la interfaz del menu de pausa cuando el juego está moviendose
    if (!this.game.physics.arcade.isPaused){
      buttonMenu.visible = false;
      buttonReanudar.visible = false;
      back.visible = false;
    }

    this.slime.animations.play('princi');
    this.torreta.animations.play('stand');
    var hitPlatforms = this.game.physics.arcade.collide(this._rush, this.groundLayer);
    this.game.physics.arcade.collide(this._rush, this.slime, this.MatasOMueres, null, this);
    this.game.physics.arcade.collide(this._rush, bullets, this.onPlayerFell, null, this);
    //this.game.physics.arcade.overlap(this.groundLayer, bullets, DestruyeBalas, null, this);
    this.game.physics.arcade.overlap(this.groundLayer, bullets);

    //Movimiento del personaje
    this.cursors = this.game.input.keyboard.createCursorKeys();
      // Reiniciamos el movimiento del personaje
     this._rush.body.velocity.x = 0;

    if (this.cursors.left.isDown)
    {
        // Movimiento a la izquierda
        this._rush.body.velocity.x = -150;

        this._rush.animations.play('left');
    }
    else if (this.cursors.right.isDown)
    {
        // Movimiento a la derecha
        this._rush.body.velocity.x = 150;        

        this._rush.animations.play('right');
    }
    else
    {
        //  frame quieto
        this._rush.animations.stop();

        this._rush.frame = 4;
    }
    ////////////////
    //Salto del jugador
    if (this.cursors.up.isDown && hitPlatforms && this._rush.body.onFloor())

        {   //player is on the ground, so he is allowed to start a jump
                this.jumptimer = this.game.time.time;
                this._rush.body.velocity.y = -325;

        } else if (this.cursors.up.isDown && (this.jumptimer !== 0))
          
          { //player is no longer on the ground, but is still holding the jump key
                if ((this.game.time.time - this.jumptimer) > 600) { // player has been holding jump for over 600 millliseconds, it's time to stop him

                    this.jumptimer = 0;

                } else { // player is allowed to jump higher, not yet 600 milliseconds of jumping

                  //this._rush.body.velocity.y -= 15;//525
                  this._rush.body.velocity.y = -325-(200/(this.game.time.time - this.jumptimer));
                }

            } else if (this.jumptimer !== 0) { //reset jumptimer since the player is no longer holding the jump key

                this.jumptimer = 0;

            }   

        this.checkPlayerFell();

        //Para terminar el nivel:
        if(this.winZone.contains(this._rush.x + this._rush.width/2, this._rush.y + this._rush.height/2))
          this.game.state.start('gravityScene'); //Cargamos siguiente nivel


    this.game.physics.arcade.collide(this._rush, this.slime);

    this.slime.update = function () {

      this.game.physics.arcade.collide(this, platforms, function (slime, platform) {

          if (slime.body.velocity.x > 0 && slime.x > platform.x + (platform.width - (slime.width + 5)) ||
                  slime.body.velocity.x < 0 && slime.x < platform.x) {
              slime.body.velocity.x *= -1; 
          }
            slime.body.velocity.y = -80;

      });

};
//////////this.torreta = this.game.add.sprite(1450, 580, 'torreta');
//////////this.torreta.animations.add('stand', [0, 1, 2, 3], 2, true);

    },

    MatasOMueres: function(){

      if (this._rush.body.touching.left || this._rush.body.touching.right){
          this.game.state.start('gameOver');        
      } else if (this._rush.body.touching.down){
          this.slime.kill();
      }
    },

    Dispara: function(){
    var bullet = bullets.create(this.torreta.x + 10, this.torreta.y + 10, 'bullet');
    //bullet.animations.add('avanza', [0,1], 10, true);
    //this.game.physics.arcade.enable(bullet);
    bullet.body.velocity.x = -80;
    bullet.body.velocity.y = 30;

    if (bullet.body.touching.down){
      bullet.kill();
    }
        //bullets.add(bullet);
    },

    togglePause: function(){
      //Destruimos los anteriores botones antes de crear los nuevos, para actualizar su posicion
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

      //Desactivamos las físicas para paralizar el mundo      
      this.game.physics.arcade.isPaused = (this.game.physics.arcade.isPaused) ? false : true;
    },
    volverMenu: function (){
        this.game.state.start('menu');

    },
    Reanudar: function(){
      this.game.physics.arcade.isPaused = (this.game.physics.arcade.isPaused) ? false : true;
    },

    onPlayerFell: function(){
        //TODO 6 Carga de 'gameOver';
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

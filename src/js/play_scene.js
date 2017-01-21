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
var nubes;
var slimes;
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
    torreta: {},
    nube: {},
    nube2: {},
    nube3: {},

  //Método constructor...
    create: function () {    

	nubes = this.game.add.group();
	nubes.enableBody = true;

    platforms = this.game.add.group();
    platforms.enableBody = true;
    this.CreaPlataforma(2400, 385, 0.8);
    this.CreaPlataforma(1030, 330, 1.4);
    this.CreaPlataforma(1550, 1285, 1.4);
    platforms.alpha = 0;
    
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


      this.map = this.game.add.tilemap('tilemap');           
      this.map.addTilesetImage('tileset', 'tiles');     
      //Objetos del mapa creados con Tiled
      var start = this.map.objects["Objects"][0];
      var end = this.map.objects["Objects"][1];
      var slimePos = this.map.objects["Objects"][2];  
      var slimePos2 = this.map.objects["Objects"][3]; 
      var slimePos3 = this.map.objects["Objects"][4]; 
      var setaPos1 =  this.map.objects["Objects"][5];
      var setaPos2 =  this.map.objects["Objects"][6];  
      var finalPos =  this.map.objects["Objects"][7];
      var finalPos2 =  this.map.objects["Objects"][8]; 

    
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
      disparanding.onLoop.add(this.Dispara, {velX: -120, velY: 40, posX: this.torreta.x -10, posY: this.torreta.y, game: this.game }, this);
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
//Inicialización de los slimes
    slimes = this.game.add.group();

    this.CreaSlime(slimePos.x, slimePos.y, this.game);
    this.CreaSlime(slimePos2.x, slimePos2.y, this.game);
    this.CreaSlime(slimePos3.x, slimePos3.y, this.game);

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
    this.torreta.animations.play('stand');
    //Colisión entre el jugador y el terreno.
    var hitPlatforms = this.game.physics.arcade.collide(this._rush, this.groundLayer);
    //Llama al método matas o mueres al colisionar con el slime.
  	this.game.physics.arcade.collide(this._rush, slimes, this.MatasOMueres, null, this);
  	//Mata al personaje al tocar una bala.
  	this.game.physics.arcade.collide(this._rush, bullets, this.onPlayerFell, null, this);
    this.game.physics.arcade.collide(bullets, this.groundLayer, this.MataBala, null, this);
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


    //Hace que el slime recorra la plataforma en la que esté y gire antes de caerse para seguir recorriéndola indefinidamente.
      this.game.physics.arcade.collide(slimes, platforms, function (slime, platform) {

          if (slime.body.velocity.x > 0 && slime.x > platform.x + (platform.width - (slime.width + 5)) ||
                  slime.body.velocity.x < 0 && slime.x < platform.x) {
              slime.body.velocity.x *= -1; 
          }
            slime.body.velocity.y = -80;

      });


 

    },
    //Función que se llama al tocar al slime. Si le tocas por los lados mueres y si saltas encima le matas.
    MatasOMueres: function(player, slime){

      if (this._rush.body.touching.left || this._rush.body.touching.right){
          this.game.state.start('gameOver');        
      } else if (this._rush.body.touching.down){
          slime.kill();
      }
    },

    MataBala: function(bala, suelo) {
      
      bala.kill();
    },

    //Constructora de la bala
        Dispara: function (velX, velY, posX, posY, game){
        var bullet = this.game.add.sprite(this.posX, this.posY, 'bullet');
        this.game.physics.arcade.enable(bullet);
        bullet.body.bounce.y = 0.2;
        bullet.body.velocity.y = this.velY;
        bullet.body.velocity.x = this.velX;
        bullets.add(bullet);
    },

    CreaSlime: function(x, y, game){
    var slime = this.game.add.sprite(x, y, 'slime');//1-(400,215)//2-(650,120)//3-(1200,520)//4-(150,520)//5-(1250,920)//6-(1375,1000)
    this.game.physics.arcade.enable(slime);
    slime.body.bounce.y = 0.2;
    slime.body.gravity.y = 300;
    slime.body.velocity.x = 80;
    slime.body.collideWorldBounds = true;
    slime.animations.add('princi', [0, 1, 2, 3, 4], 5, true);
    slime.animations.play('princi');
    slimes.add(slime);

    },

    CreaPlataforma: function (x, y, scaleX){
    var ledge = platforms.create(x, y, 'ground');
    ledge.body.immovable = true;
    ledge.scale.setTo(scaleX, 0.5);
    platforms.add(ledge);
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
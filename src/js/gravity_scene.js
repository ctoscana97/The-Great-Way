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
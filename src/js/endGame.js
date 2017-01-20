'use strict';

//Enumerados: PlayerState son los estado por los que pasa el player. Directions son las direcciones a las que se puede
//mover el player.

var cursors;
//GameObjects
//Groups
var platforms;
//textos
//Pausa
var saltoInicial = false;
var luna;
var fondo1;
var fondo2;
var fondo3;
var trigger1;
var diosa;
var controlDialogos = 0;
var spaceBar;
var flag = false;
var flag2 = false;
var bro;
var _rush;
     var textDude1;
      var textDude2;
      var textDude3;
      var textDiosa1;
      var textDiosa2;
      var textDiosa3;
      var pasarTxt;
      var contDude = 0;
      var contBro = 0;
//Sonidos
var musica;
var salto;

//funcion


    ///

//Scena de juego.
var PlayScene = {
    menu: {},
    //_rush: {}, //player
    slime: {},
    torreta: {},

  //Método constructor...
    create: function () {

    spaceBar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);    
      //plataforma


    fondo1 = this.game.add.image(0, 0, 'mar');
    fondo1.scale.setTo(2,2);
    fondo2 = this.game.add.image(-100, 0, 'luna');
    fondo2.scale.setTo(0.7, 0.75);
    fondo2.visible = false;
    diosa = this.game.add.image(650, 400, 'diosa');
    diosa.visible = false;
    fondo3 = this.game.add.image(0, 0, 'playa');
    fondo3.scale.setTo(1.8, 2.5);
    fondo3.visible = false;


        textDiosa1 = this.game.add.text(450, 50, "Pequeño viajero... ¿Cómo es que"  + "\n" + 
        "    has venido a verme con tantos" +"\n" +  "       peligros de por medio?");
        textDiosa1.scale.setTo(0.8,0.8);
        textDiosa1.addColor('#ffffff', 0);

        textDude1 =  this.game.add.text(50, 50, "Perdone, Diosa, pero mi razón"  + "\n" + 
        "de vivir hace ya tiempo que se " + "\n" + " marchó junto a mi hermano." + "\n" + "    Le necesito de vuelta.");
        textDude1.scale.setTo(0.8,0.8);
        textDude1.addColor('#ffffff', 0);

        textDiosa2 = this.game.add.text(450, 50, "No sabes siquiera si puedo traerle"  + "\n" + 
        "del otro lado y, aun así, ¿sufres" + "\n" + "mi Gran Recorrido a ciegas?");
        textDiosa2.scale.setTo(0.8,0.8);
        textDiosa2.addColor('#ffffff', 0);

        textDude2 =  this.game.add.text(20, 50, "Creo que no lo entiende. Me da igual"  + "\n" + 
        "romperme, deshacerme en mil pedazos," + "\n" + "mientras él pueda disfrutar otra vez...");
        textDude2.scale.setTo(0.8,0.8);
        textDude2.addColor('#ffffff', 0);

        textDude3 =  this.game.add.text(50, 50, "...del olor del mar, del cálido sol en"  + "\n" + 
        "      nuestra playa o del abrazo de " + "\n" + "nuestra madre. Para mí, lo es todo." + "\n" + "                    ¡Por favor!");
        textDude3.scale.setTo(0.8,0.8);
        textDude3.addColor('#ffffff', 0);

        textDiosa3 = this.game.add.text(100, 50, "Que así sea mi dulce viajero... compartirás la mitad de"  + "\n" + 
        "tú vida con él, así que aprovecha hasta el último aliento " + "\n" + "que puedas respirar con las personas que más te importan.");
        textDiosa3.scale.setTo(0.8,0.8);
        textDiosa3.addColor('#ffffff', 0);

        pasarTxt = this.game.add.text(100, 50, "   Pulsa la barra espaciadora para seguir y" + "\n" +" cuando quieras pasar al siguiente diálogo.");
        pasarTxt.scale.setTo(0.8,0.8);
        pasarTxt.addColor('#ffffff', 0);

        pasarTxt.visible = false;
        textDiosa1.visible = false;
        textDiosa2.visible = false;
        textDiosa3.visible = false;
        textDude1.visible = false;
        textDude2.visible = false;
        textDude3.visible = false;

      _rush = this.game.add.sprite(400, 600, 'dude');
      _rush.frame = 4;

      bro = this.game.add.sprite(600, 500, 'hermano');
      this.game.physics.arcade.enable(bro);
      bro.body.gravity.y = 0;
      bro.scale.setTo(0.8, 0.8);
      bro.animations.add('happy', [1, 2, 3], 10, true);
      bro.visible = false;
      //_rush.scale.setTo(0.6, 0.6);

      //animaciones     
      _rush.animations.add('right', [5, 6, 7, 8], 10, true); 


      musica = this.game.add.audio('musiFinal');
      musica.loop = true;
      musica.play();

      salto = this.game.add.audio('salto');

      trigger1 = this.game.add.group();
      trigger1.enableBody = true;
      luna = trigger1.create(200, 200, 'ground');
      luna.alpha = 0;
      //this.game.physics.arcade.enable(luna);
      //luna.body.immovable = true;
          platforms = this.game.add.group();

    platforms.enableBody = true;
    var ledge = platforms.create(100, 550, 'ground');
    ledge.alpha = 0;
    ledge.scale.setTo(1.5, 1);
    ledge.body.immovable = true;
    ledge.body.checkCollision.down = false;

      this.configure();

  },
      
    //IS called one per frame.
    update: function () {
      //Ocultar la interfaz del menu de pausa
      this.game.physics.arcade.collide(_rush, trigger1, this.chocaLuna, null, this);
      this.game.physics.arcade.collide(bro, platforms);
      this.game.physics.arcade.collide(_rush, bro, this.MenuGo, null, this);
      this.game.physics.arcade.collide(_rush, platforms);

      //  Reset the players velocity (movement)
     _rush.body.velocity.x = 0;

     if(contDude === 2 && contBro === 2){
      _rush.body.velocity.x = 50;
      bro.body.velocity.x = -50;

     }
     if (flag === true){
      spaceBar.onDown.add(this.Siguiente, this);
     }

     if (bro.body.velocity.x < 0)
    {

        bro.animations.play('happy');
    }

    if (_rush.body.velocity.x > 0)
    {

        _rush.animations.play('right');
    }
    else
    {
        //  Stand still
        _rush.animations.stop();

    }

    if (flag2 === true){
      this.ASaltar();
    }

  this.Dialogo();

    },
    Siguiente: function(){
      controlDialogos++;
    },

    chocaLuna: function(perso, trig1){
      perso.body.velocity.y = 0;
      trig1.destroy();
      fondo1.destroy();
      fondo2.visible = true;
      diosa.visible = true;
      _rush.body.gravity.y = 0;
      _rush.scale.setTo(0.6, 0.6);
      _rush.x =150;
      _rush.y =550;
      flag = true;
      pasarTxt.visible = true;
    },

    Dialogo: function(){
 

      if (controlDialogos === 1){
        pasarTxt.destroy();
        textDiosa1.visible = true;

      }
      if (controlDialogos === 2){
        textDude1.visible = true;
      }
      if (controlDialogos === 3){
        textDiosa1.destroy();
        textDiosa2.visible = true;

      }
      if (controlDialogos === 4){
        textDude1.destroy();
        textDude2.visible = true;

      }
      if (controlDialogos === 5){
        textDude2.destroy();
        textDude3.visible = true;

      }
      if (controlDialogos === 6){
        textDude3.destroy();
        textDiosa2.destroy();
        textDiosa3.visible = true;

      }
      if (controlDialogos >= 7){
        textDiosa3.destroy();
        diosa.destroy();
        fondo2.destroy();
        fondo3.visible = true;
        bro.visible = true;
        _rush.scale.setTo(0.8, 0.8);
        _rush.x = 200;
        _rush.y = 500;
        _rush.body.gravity.y = 200;
        bro.body.gravity.y = 200;
        flag2 = true;

        controlDialogos = -1;
      }
    },

    MenuGo: function (){
      musica.destroy();
      this.game.state.start('menu');
    },

    ASaltar: function(){
      if (contDude < 2 && _rush.body.touching.down){
        salto.play(false);
        _rush.body.velocity.y = -100;
        contDude++;
        bro.frame = 1;

      }

        if (contDude == 2 && contBro < 2 && bro.body.touching.down){
          bro.body.velocity.y = -100;
          contBro++;
          salto.play(false);
          _rush.frame = 5;
        }
    },
    
    //configure the scene
    configure: function(){

        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.stage.backgroundColor = '#00000';
        this.game.physics.arcade.enable(_rush);
        _rush.body.velocity.y = -100;
        _rush.body.gravity.y = -400;
        _rush.body.collideWorldBounds = true;
        _rush.body.gravity.x = 0;
        _rush.body.velocity.x = 0;

    },
    //move the player   
};

module.exports = PlayScene;

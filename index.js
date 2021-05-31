'use strict';
/**
 * *********************************
 * ****SERVEUR HTTP AVEC EXPRESS****
 * *********************************
 */

//mise en place de express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

//mise en place de la connection mongoDB
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://eddytab:Okioku570.632.@eddytcluster.16t9t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const maDB = 'pokependu';
const maCollection= 'historique'

//mise en place des routes pour les fichiers statics
app.use('/css',express.static(__dirname + '/assets/css'));
app.use('/js',express.static(__dirname + '/assets/js'));
app.use('/src',express.static(__dirname + '/src'));

//mise en place pour mettre à disposition nos pugs
app.set('view engine','pug');

//Route accueil
app.get('/',(req,res) => {
	MongoClient.connect(url, { useUnifiedTopology: true }, (err,client) => {
		const classement = client.db(maDB).collection(maCollection);
		classement.find().sort({ score  : -1 }).limit(10).toArray((err,datas) => {
            //console.log(datas)
			client.close();
			res.render('accueil',{title:'Pokependu',classement:datas});
		});
	});
});

//Route vers la préparation avant la partie
app.get('/preparation',(req,res) => {
    res.render('preparation',{title:'Pokependu',});
    });

//Route vers le jeu
app.get('/jeu',(req,res) => {
    res.render('jeu',{title:'Pokependu',});
    });

//Lancement du serveur sur le port en local
const server = app.listen(PORT,(err) => {
	if (err) return;
	console.log(`Serveur lancé sur ${PORT}`);
});

/**
 * *************************************
 * *****FIN DU CODE DU SERVEUR HTTP*****
 * *************************************
 */

/**
 * *************************************
 * ***************socket.io*************
 * *************************************
 */
 const io = require('socket.io');
 const  randomColor  = require ('randomcolor');// module qui fait une couleur aléatoire
 const random = require('random')// module qui fait un nombre aléatoire
 const alphabet = require('alphabet');
 const  { Timer }  =  require ( 'timer-node' ) ;//timer
 const timer = new Timer({ label: 'test-timer' });//timer
 const wsIoServer = io(server);//serveur


 

 
 //mise ne place de jquery
 const { JSDOM } = require( "jsdom" );
 const { window } = new JSDOM( "" );
 const $ = require( "jquery" )( window );
 

 // Sur mon site il y a une navigation avec des liens , a chaque fois qu'on click sur un lien on coupe la connexion websokect. J'ai besoin de garder certaines données d'où le fait de délacrer les variable ci-dessous

 let donneesPreparation = false;
 let donneesJoueurDeux =false;
 let joueurUn=false;
 let joueurDeux=false;
 let participan = 0;
 let ref=false;
 let changementUn=false;
 let tours =1;
 let ajaxEntre=0;
 let securite=false;
 let joueurPresent = 0;
 let deco = false;
 let decoPreparation = false;
 let debutPartie = false;

wsIoServer.on('connection', (socket) => {
    

/**
 * *************************************
 * ***************Acceuil***************
 * *************************************
 */

//a chaque click de l'utilisateur le serveur envoie une couleur aléatoir au client
    socket.on('data', (message) => {

        const color = randomColor();
        //console.log(color);
        socket.emit('CouleurAvatar',color)
      });
    
//Ici on va voir dans la BDD mongoDB si le pseudo que l'utilisateur à choisit est dispo
socket.on('pseudo-dispo',(pseudoJoueur) => {

MongoClient.connect(url, { useUnifiedTopology: true }, (err,client) => {
    const classement = client.db(maDB).collection(maCollection);
    classement.find({ pseudo : pseudoJoueur }).toArray((err,datas) => {
        //console.log(datas)
        if(datas[0] == undefined){
            if(donneesPreparation.pseudo==pseudoJoueur){
                socket.emit('pseudo-dispo-repServeur',(false))
            }
            else{
            socket.emit('pseudo-dispo-repServeur',(true))}
        }
        
        else{
            socket.emit('pseudo-dispo-repServeur',(false))
        }
        client.close();
    });
});


})

//envoie des données saisis par l'utilisateurs 
    socket.on('donneesJoueur',(donneesJoueur) =>{
        //console.log(donneesJoueur)
        if(!donneesPreparation){
        donneesPreparation = donneesJoueur
        }
        else{
        donneesJoueurDeux=donneesJoueur
        decoPreparation=false;
        }

        joueurPresent++

    })
/**
 * *************************************
 * ***************Preparation***********
 * *************************************
 */
//Quand un utilisateur arrive sur la page, le serveur envoie les données au 2 joueurs . Les parties sont au maximum de 2 donc les autres qui arrivent sur la page sont amener à revenir plus tard 
    socket.on('appelUn',(message) =>{
        //console.log(donneesPreparation)
        if(joueurPresent>2){
            socket.emit('trop-de-joueur',('trop de joueurs dans la partie'))
        }
        else{
        socket.emit('donneesPreparation',donneesPreparation)
        socket.emit('ref',donneesPreparation)
        decoPreparation=true;
            if(donneesJoueurDeux){
            wsIoServer.emit('donneesJoueursDeux',donneesJoueurDeux)
            socket.emit('refDeux',donneesJoueurDeux)  
        }
    }
    })
    //On stock les données pour la partie qui va commencer
    socket.on('donneesPartie',(message) =>{
        joueurUn = message.joueurUn,
        joueurDeux = message.joueurDeux
        ref=message.ref.pseudo// super important !!!!! cette variable va permettre de dire que le joueur qui se connecte en premier au jeu aura la main pour jouer et on va pouvoir changer se témoin pour dire que c'est à l'autre de jouer etc
        deco=false
        decoPreparation=false;

        //console.log('joueur 1 : ',joueurUn,'joueur 2 : ',joueurDeux)
        
    })
/**
 * *************************************
 * ***************Jeu*******************
 * *************************************
 */

 let pokemonName;
 let pokemonImage;

    socket.on('appelDeux',(message) =>{
        participan++
        if(participan==1){
            socket.emit('connexion',{message : `En attente de connexion de l'autre joueur...`,ref : ref})
            deco=true;
        }
        if(participan==2){

            wsIoServer.emit('joueurs',{joueurUn : joueurUn, joueurDeux:joueurDeux})
            wsIoServer.emit('alphabet',(alphabet.upper))
            timer.start();
            deco=true;
            debutPartie = true;
            

         
        };

    })

    socket.on('timer-go',(message) =>{
        const temps = timer.time();
        wsIoServer.emit('temps',{temps: temps, debutPartie: debutPartie})
    })


//Appel a chaque tour , d'un nouveau pokemon
socket.on('pokependu-demande',(messaga) => {
    if(!securite){ //cette sécurité est super importante car je ne sais pas pourquoi mais arrivé vers le tour 3 le client fait plusieurs emit au lieu de une fois par tour. Ca faisait bugger mon jeu. Du coup j'ai mis cette sécurité pour dire dès qu'il emit une fois , la fonction est bloqué jusqu'a la fin du tour
        securite=true;
    wsIoServer.emit('pokependu','démarrage du jeu')}
socket.on('ref',(message) =>{
    if(ajaxEntre<1){
        ajaxEntre++
    socket.broadcast.emit('main',message)
    const pokemonNombreUn = random.int(1, 151);// ici j'ai limité les pokemon a ceux de premieres generation 
    const url= "https://pokeapi.co/api/v2/pokemon/"
    const method = "GET"
           $.ajax({
               url: url+pokemonNombreUn,
               method,
               success: function(data,textStatus,jqXHR){
                   // console.log(data);
                   pokemonName = data.name;
                   pokemonImage = data.sprites.front_default;
                   //console.log(pokemonImage)
                   //console.log(ajaxEntre)
                   wsIoServer.emit('pokemonName',pokemonName)
               }
               });
            }
})


})
//Permet a indiquer au joueur qui n'a pas la main d'être prévenu et de déclenché le code nécessaire  
socket.on('click',(event)=>{
    //console.log(event)
    socket.broadcast.emit('clickRecu',event)
})

// déclanche le code qui va faire apparaitre le pokemon si un joueur click sur "indice"
socket.on('pokemonImage',(message) =>{
    wsIoServer.emit('imageRepServeur',pokemonImage)
})

//fin du tour , ce code permet de passer la main à l'autre joueur et d'envoyés certaines données 
socket.on('finDuTour',(message) =>{
if(!changementUn){
    if(ref==joueurUn.pseudo){
        ref = joueurDeux.pseudo
        changementUn=true;
    }
    else{
        ref = joueurUn.pseudo
        changementUn=true;
    }
}

            if(ref==joueurUn.pseudo){
                ref = joueurDeux.pseudo
                tours++
                wsIoServer.emit('reinitialisation',{ref : ref,tours: tours})
                socket.on('monTour',(monTour)=>{
                    const aMoi = true;
                    ajaxEntre=0;
                    securite=false;
                    socket.broadcast.emit('monTourDejouer',aMoi)
                    
                })
                
            }
            else{
                ref = joueurUn.pseudo
                tours++
                wsIoServer.emit('reinitialisation',{ref : ref,tours: tours})
                socket.on('monTour',(monTour)=>{
                    const aMoi = true;
                    ajaxEntre=0;
                    securite=false;
                    socket.broadcast.emit('monTourDejouer',aMoi)
                })
            }

//remise à zero des lettres pour les joueurs
wsIoServer.emit('alphabet',(alphabet.upper))
})
//fin De la partie
//fonction qui va envoyer les données à mongo atlas
function envoiMongoDB(donneesMongoDB){

    MongoClient.connect(url,{
        useUnifiedTopology: true,
        connectTimeoutMS: 100
      }, (error, client) => {
        if (error) {
          console.log('Connexion impossible à la base de données');
        } else {
            const db = client.db(maDB);;
            db.collection(maCollection, (error, collection) => {
            if( error ) {
              console.log('Impossible de sélectionner la collection');
            } else {
              collection.insertOne(donneesMongoDB, (error, result) => {
                if ( error ) {
                  console.log(`Impossible d'insérer les données dans la collection`);
                } else {
                  console.log('donnees enregistrées');
                }
              })
            }
          });
        }
      });}

socket.on('Envoi-MongoDB',(donnees) =>{
    timer.stop()

    const timeFin = {minutes: donnees.timeFin.minutes , secondes : donnees.timeFin.secondes }

    const joueurUnFin = {pseudo : donnees.joueurUnFin.pseudo,score:donnees.joueurUnFin.score,tempsPartie : timeFin}
    const joueurDeuxFin = {pseudo : donnees.joueurDeuxFin.pseudo,score:donnees.joueurDeuxFin.score,tempsPartie : timeFin}
    


    //console.dir(joueurUnFin)
    //console.dir(joueurDeuxFin)
    //console.dir(timeFin)
    if(joueurUnFin.score>joueurDeuxFin.score){
    joueurUnFin.resultat = 'match gagné'
    joueurDeuxFin.resultat = 'match perdu'
    envoiMongoDB(joueurUnFin)
    envoiMongoDB(joueurDeuxFin)
    wsIoServer.emit('finDuJeu',joueurUnFin)
    }

    else{
    envoiMongoDB(joueurDeuxFin)
    envoiMongoDB(joueurUnFin)
    wsIoServer.emit('finDuJeu',joueurDeuxFin)
    }
    //remise a zéro
    donneesPreparation = false;
    donneesJoueurDeux =false;
    joueurUn=false;
    joueurDeux=false;
    participan = 0;
    ref=false;
    changementUn=false;
    tours =1;
    ajaxEntre=0;
    securite=false;
    joueurPresent = 0;
    deco=false;
    debutPartie = false;
    
});

//en cas de déconnexion d'un joueur 
socket.on("disconnect", (reason) => {
    //console.log(deco)
    if(deco){
        timer.stop()
        //remise a zéro
        donneesPreparation = false;
        donneesJoueurDeux =false;
        joueurUn=false;
        joueurDeux=false;
        participan = 0;
        ref=false;
        changementUn=false;
        tours =1;
        ajaxEntre=0;
        securite=false;
        joueurPresent = 0;
        deco=false;
        debutPartie = false;
        decoPreparation=false;

    wsIoServer.emit('deconnexion',`Un joueur s'est déco il faut stopper la partie`)
    }
    if(decoPreparation){
        //remise a zéro
        donneesPreparation = false;
        donneesJoueurDeux =false;
        joueurUn=false;
        joueurDeux=false;
        participan = 0;
        ref=false;
        changementUn=false;
        tours =1;
        ajaxEntre=0;
        securite=false;
        joueurPresent = 0;
        deco=false;
        debutPartie = false;
        decoPreparation=false;

    wsIoServer.emit('deconnexion',`Un joueur s'est déco il faut stopper la partie`)
    }
  });
});


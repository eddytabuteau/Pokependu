

//Au chargement du document
window.addEventListener('DOMContentLoaded',function(){
    /**
      Établissement d'une nouvelle connexion WebSocket vers le serveur
      WebSocket à l'aide de la fonction io fournie par le "framework"
      client socket.io.
    **/
    const socket = io();
    let joueurUn;
    let joueurDeux;
    let spanPointsJoueurUn;
    let spanPointsJoueurDeux;
    const tours = window.document.getElementById('tours')
    const div = window.document.querySelector('div')
    let connexion;
    let ref;
    let monTour=false;
    const image = window.document.querySelector('img')
    const finpokependu = window.document.getElementById('pokependu')
    const lettre = window.document.getElementById('saisi')
    const minutes = window.document.getElementById('minutes')
    const secondes = window.document.getElementById('secondes')
    const mot = window.document.getElementById('mot')
    let motPokemo;
    let compteLettre=0;
    let imageKey;
    let acces = true;
    let tableauLettres = [];
    let cle = false;
    let i = 0
    let motCompose=0;
    let finDuClick = false;


    function myTimer() {
        socket.emit('timer-go','debut du timer')
      }

      //setInterval qui va appelé le serveur pour actualisé le timer de la partie
    const tempsJeu = setInterval(function(){myTimer()}, 1000);

    socket.on('temps',(data) =>{
        //console.log(data.debutPartie)
        if(data.debutPartie==true){
        minutes.innerText=data.temps.m
        secondes.innerText=data.temps.s
        }
        else{
            minutes.innerText="0"
            secondes.innerText="0"  
        }
    })

        
    socket.on('alphabet',(alphabet)=>{
        imageKey=false;
        alphabet.forEach(element => {
            const uneLettre = document.createElement("p")
            uneLettre.id=element
            uneLettre.innerHTML=element
            lettre.appendChild(uneLettre)    
        });
    })



    socket.emit('appelDeux','salut 2');
    socket.on('connexion', (data) =>{
        connexion = document.createElement("p")
        connexion.innerHTML=data.message
        div.appendChild(connexion)
        ref=data.ref
        //console.log(ref)
    })
    socket.on('joueurs', function (data) {
        if(connexion){
        connexion.remove();
        monTour=true;
        }  

        

       
        
        joueurUn = data.joueurUn
        joueurDeux = data.joueurDeux
        //console.log('joueur 1 : ',joueurUn,'joueur 2 : ',joueurDeux)
        let divjoueurUn = document.createElement("div");
        divjoueurUn.className="joueur"
        divjoueurUn.style.display='flex'
        div.appendChild(divjoueurUn)
            let avatarUn = document.createElement("div");
            avatarUn.style.backgroundColor=joueurUn.couleurAvatar
            divjoueurUn.appendChild(avatarUn)
            let pseudoUn = document.createElement("p")
            pseudoUn.innerHTML=joueurUn.pseudo
            divjoueurUn.appendChild(pseudoUn)
                let scoreJoueurUn = document.createElement("p");
                scoreJoueurUn.innerHTML=" score : "
                scoreJoueurUn.style.marginLeft="20px"
                divjoueurUn.appendChild(scoreJoueurUn)
                    spanPointsJoueurUn = document.createElement("span")
                    spanPointsJoueurUn.id=joueurUn.pseudo
                    spanPointsJoueurUn.innerHTML=0;
                    scoreJoueurUn.appendChild(spanPointsJoueurUn)


        let divJoueurDeux = document.createElement("div");
        divJoueurDeux.className="joueur"
        divJoueurDeux.style.display='flex'
        div.appendChild(divJoueurDeux)
            let avatarDeux = document.createElement("div");
            avatarDeux.style.backgroundColor=joueurDeux.couleurAvatar
            divJoueurDeux.appendChild(avatarDeux)
            let pseudoDeux = document.createElement("p")
            pseudoDeux.innerHTML=joueurDeux.pseudo
            divJoueurDeux.appendChild(pseudoDeux)
                let scoreJoueurDeux = document.createElement("p");
                scoreJoueurDeux.innerHTML=" score : "
                scoreJoueurDeux.style.marginLeft="20px"
                divJoueurDeux.appendChild(scoreJoueurDeux)
                    spanPointsJoueurDeux = document.createElement("span")
                    spanPointsJoueurDeux.id=joueurDeux.pseudo
                    spanPointsJoueurDeux.innerHTML=0;
                    scoreJoueurDeux.appendChild(spanPointsJoueurDeux)
        

        
        //lancement du jeu !!!!
        if(monTour){
            socket.emit('pokependu-demande','appel le jeu')
        }
        
    });


    //Debut de la partie
    
    socket.on('pokependu',(data) => {
        //console.log('ici ça donne quoi')
        //console.log(monTour)
        if(monTour){
            //console.log('ici ça donne quoi V2')
            window.document.getElementById(ref).className="main"
           socket.emit('ref',ref)
           // a chaque clique , seule le joueur qui à la main peut lancer le code liée à l'évènement click
           window.addEventListener('click',function clickUn(event){
            if(finDuClick){
                finDuClick=false;
                window.removeEventListener("click", clickUn)
            }
            else{
                //console.log('je suis ICI')
                const lettres = (motPokemo.length)-motCompose
                //console.log(lettres)

                //console.log(event)
                const click = event.target

                const lettre = click.innerHTML
                
                //console.log(acces,cle)
                
                while(!cle){
                    tableauLettres.forEach(element => {
                        if(element==lettre){
                            acces=false;
                            cle=true;
                            i=0
                        }
                    })
                    if(i > tableauLettres.length){
                        cle=true;
                        acces=true;
                        i=0
                        //console.log('bug')
                        
                    }
                    i++
                }
                cle=false;
                //console.log(acces,cle)
                    if(click.localName =='p' && acces){
                        acces=true;
                        
                        click.className="desactive"
                        tableauLettres.push(lettre)
                        //console.log(lettre)
                        const choix = window.document.getElementsByClassName(lettre)
                        const compteur = choix.length
                        socket.emit('click',{lettre: lettre,compteur : compteur})
                        
                        if(compteur){// a chaque lettre correspondante au pokemon le joueur gagne 25 points
                            for(let i = 0; i < compteur; i++){
                                compteLettre=compteLettre+1
                                //console.log(compteLettre)
                                choix[i].innerHTML=lettre
                                let points =parseFloat(window.document.getElementById(ref).innerHTML)
                                window.document.getElementById(ref).innerHTML=points+25
                            }
                            if(compteLettre == lettres){ // quand le joueur a trouvé toutes les lettres
                                if(tours.innerHTML==6){// fin de la partie
                                    window.removeEventListener("click", clickUn)
                                    clearInterval(tempsJeu)
                                    const joueurUnFin = {pseudo : joueurUn.pseudo,score:parseFloat(window.document.getElementById(joueurUn.pseudo).innerHTML)}

                                    const joueurDeuxFin = {pseudo : joueurDeux.pseudo,score: parseFloat(window.document.getElementById(joueurDeux.pseudo).innerHTML)}

                                    const timeFin = {minutes:minutes.innerText , secondes :secondes.innerText }
                    
                                    socket.emit('Envoi-MongoDB',{joueurUnFin,joueurDeuxFin,timeFin})
                                    //console.log(joueurUnFin,joueurDeuxFin,timeFin)

                            
                                }
                                else{
                                monTour=false;
                                tableauLettres=[];
                                window.removeEventListener("click", clickUn)
                                socket.emit('finDuTour','fin du tour pour le joueur')
                                socket.emit('monTour',(monTour))
                                }

                                
                                
                            }
                        }
                        else{//quand le joueur a une mauvaise lettre
                            let points = parseFloat(window.document.getElementById(ref).innerHTML)
                            window.document.getElementById(ref).innerHTML=points-10
                        }

                    }
                    //appel de l'image du pokemon
                    if(click.localName =='button'){
                        if(!imageKey){
                        socket.emit('pokemonImage','Le joueur veut voir un indice')
                            imageKey=true;
                    }
                    }
           }
        })
        
           
        }


    })
//pour savoir qui a la main
    socket.on('main', function (data) {
        window.document.getElementById(data).className="main"
        ref=data
    })
// code pour celui qui n'a pas la main
    socket.on('clickRecu',(event) =>{
        window.document.getElementById(event.lettre).className="desactive"
        const compteur = event.compteur
        const choix = window.document.getElementsByClassName(event.lettre)

        if(compteur){
            for(let i = 0; i < compteur; i++){
                compteLettre=compteLettre+1
                //console.log(compteLettre)
                choix[i].innerHTML=event.lettre
                let points =parseFloat(window.document.getElementById(ref).innerHTML)
                window.document.getElementById(ref).innerHTML=points+25
            }
        }
        else{
            let points =parseFloat(window.document.getElementById(ref).innerHTML)
            window.document.getElementById(ref).innerHTML=points-10
        }
    })

    
     //pour tous les joueurs
     socket.on('pokemonName', (data) => {
         console.log('Pour les supers développeurs le pokemon est =>',data)
         motPokemo= data.toUpperCase()
         motPokemo = motPokemo.split('')

         motPokemo.forEach(element =>{
            const uneLettre = document.createElement("div")
            uneLettre.className=element
            uneLettre.innerHTML='_'
            mot.appendChild(uneLettre)
            //ici j'étais mal quand MR-MIME était le pokemon a trouver , d'où le code ci-dessous
            if(element=="-"){
                window.document.getElementsByClassName('-')[0].remove()
                motCompose++
            }
         })
     })
//image du pokemon et 100 points pour le joueur qui a eu besoin de l'indice !
     socket.on('imageRepServeur', (data) => {
         //console.log(data)
        image.src=data
        image.style.height="280px"
        let points =parseFloat(window.document.getElementById(ref).innerHTML)
        window.document.getElementById(ref).innerHTML=points-100
    })

    //remise à zéro à chaque fin de jour 
    socket.on('reinitialisation', (reinitialisation) =>{
        

        window.document.getElementsByClassName('main')[0].className=""
        tours.innerHTML=reinitialisation.tours;
        ref=reinitialisation.ref;
        //console.log(ref)
        compteLettre=0;
        motCompose=0;

        
        

            while (lettre.firstChild) {
                lettre.removeChild(lettre.firstChild);
            }
            while (mot.firstChild) {
                mot.removeChild(mot.firstChild);
            }

            image.src=""
            image.style.height=""

        //console.log(monTour)
            
        
    })
    // change de main et début d'un autre tour
    socket.on('monTourDejouer',(aMoi) =>{
        monTour=aMoi
        //console.log(monTour)
        if(monTour){
            socket.emit('pokependu-demande','appel le jeu')
        }
    })
    //fin du jeu et affichaque du vainqueur 
    socket.on('finDuJeu',(fin) =>{
        //console.log(fin)
        window.document.getElementById('mot').remove()
        window.document.getElementById('saisi').remove()

        const motDeFin = document.createElement("p")
            motDeFin.innerHTML=`La partie est gagnée par ${fin.pseudo} avec un score de ${fin.score} points,la partie à durée ${fin.tempsPartie.minutes} minutes et ${fin.tempsPartie.secondes} secondes. `
            motDeFin.style.textAlign="center"
            finpokependu.appendChild(motDeFin)
        
        const motDeFinAccueil = document.createElement("a")
        motDeFinAccueil.innerHTML="revenir au menu principal"
        motDeFinAccueil.style.display="flex"
        motDeFinAccueil.style.justifyContent="center"
        motDeFinAccueil.href="/"
        finpokependu.appendChild(motDeFinAccueil)
    })
//quand un joueur se déconnecte on met fin à la partie et le joueur restant est invité à revenir à l'acceuil
    socket.on('deconnexion',(message) =>{
        if(monTour){
        monTour=false;
        finDuClick=true;
        clearInterval(tempsJeu)
        }
        
        window.document.getElementById('mot').remove()
        window.document.getElementById('saisi').remove()

        const motDeFin = document.createElement("p")
            motDeFin.innerHTML=`Déconnexion de l'autre joueur`
            motDeFin.style.textAlign="center"
            finpokependu.appendChild(motDeFin)
        
        const motDeFinAccueil = document.createElement("a")
        motDeFinAccueil.innerHTML="revenir au menu principal"
        motDeFinAccueil.style.display="flex"
        motDeFinAccueil.style.justifyContent="center"
        motDeFinAccueil.href="/"
        finpokependu.appendChild(motDeFinAccueil)
    })
    
});
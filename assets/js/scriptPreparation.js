//Au chargement du document
window.addEventListener('DOMContentLoaded',function(){
    /**
      Établissement d'une nouvelle connexion WebSocket vers le serveur
      WebSocket à l'aide de la fonction io fournie par le "framework"
      client socket.io.
    **/
    const socket = io();
    const donneesJoueur = {};
    let joueurUn;
    let joueurDeux;
    const div = window.document.querySelectorAll('div')[1]
    const commencer = window.document.querySelector('button')
    const maximun = window.document.querySelector('div')
    const lien = window.document.getElementById('lien')
    let ref;
    let key = false;

    socket.emit('appelUn','salut');
    socket.on('ref', (data) =>{
        ref=data
    })
    socket.on('donneesPreparation', function (data) {
        //console.log(socket.io.uri)
        lien.innerHTML=socket.io.uri
        joueurUn=data;
        donneesJoueur.pseudo = data.pseudo;
        donneesJoueur.couleurAvatar = data.couleurAvatar;
        //console.log(donneesJoueur);
        let divJoueur = document.createElement("div");
        divJoueur.className="joueur"
        divJoueur.style.display='flex'
        div.appendChild(divJoueur)
            let avatar = document.createElement("div");
            avatar.style.backgroundColor=donneesJoueur.couleurAvatar
            divJoueur.appendChild(avatar)
            let pseudo = document.createElement("p")
            pseudo.innerHTML=donneesJoueur.pseudo
            divJoueur.appendChild(pseudo)
        
        commencer.disabled=true;
    
    })
    socket.on('donneesJoueursDeux', function (data) {

        joueurDeux=data;
        
        donneesJoueur.pseudo = data.pseudo;
        donneesJoueur.couleurAvatar = data.couleurAvatar;
        //console.log(donneesJoueur);
        let divJoueur = document.createElement("div");
        divJoueur.className="joueur"
        divJoueur.style.display='flex'
        div.appendChild(divJoueur)
            let avatar = document.createElement("div");
            avatar.style.backgroundColor=donneesJoueur.couleurAvatar
            divJoueur.appendChild(avatar)
            let pseudo = document.createElement("p")
            pseudo.innerHTML=donneesJoueur.pseudo
            divJoueur.appendChild(pseudo)
        
            socket.on('refDeux', (data) =>{
                ref=data
            })
        window.document.querySelector('a').href="/jeu"
        commencer.disabled=false;
        key=true;
        
    })
        commencer.addEventListener('click',(event) =>{
            if(key){
            //console.log('joueur 1 : ',joueurUn,'joueur 2 : ',joueurDeux)
            socket.emit('donneesPartie',{joueurUn : joueurUn, joueurDeux:joueurDeux,ref: ref});
            //console.log(ref)
        }
        })
   
    socket.on('trop-de-joueur',(message) =>{
        const pleins = document.createElement("p");
        pleins.innerHTML="trop de joueurs connectés ...revenez plus tard"
        pleins.style.border="solid 2px red"
        maximun.appendChild(pleins)
    })

    socket.on('deconnexion',(message) =>{
        window.document.getElementById('reglement').remove()

        const motDeFin = document.createElement("p")
            motDeFin.innerHTML=`Déconnexion de l'autre joueur`
            motDeFin.style.textAlign="center"
            div.appendChild(motDeFin)
        
        const motDeFinAccueil = document.createElement("a")
        motDeFinAccueil.innerHTML="Revenir au menu principal"
        motDeFinAccueil.style.display="flex"
        motDeFinAccueil.style.justifyContent="center"
        motDeFinAccueil.href="/"
        div.appendChild(motDeFinAccueil)
    })
});
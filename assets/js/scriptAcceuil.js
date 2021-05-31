//Au chargement du document
window.addEventListener('DOMContentLoaded',function(){
    /**
      Établissement d'une nouvelle connexion WebSocket vers le serveur
      WebSocket à l'aide de la fonction io fournie par le "framework"
      client socket.io.
    **/
    const socket = io();
    const donneesJoueur = {};


        const pseudo = window.document.querySelector('input')
        const creationAvatar = window.document.querySelector('button')
        const testdispo = window.document.querySelectorAll('button')[1]
        const div = window.document.getElementById('avatar')
        const reponse = window.document.getElementById('reponse')
        const partie = window.document.getElementById('partie')
        let divAvatar =  false;
        let anomalie = false;


            creationAvatar.addEventListener('click',(event) =>{
                event.preventDefault();

                socket.emit('data','click');
                socket.on('CouleurAvatar', function (data) {
                    donneesJoueur.couleurAvatar = data;
                    //console.log(data)
                    if(divAvatar){
                        window.document.querySelectorAll('div')[1].remove()
                        divAvatar=false;
                    }
                    let avatar = document.createElement("div");
                    avatar.style.backgroundColor=data
                    div.appendChild(avatar)
                    divAvatar=true;
                });
            });


            testdispo.addEventListener('click',(event) =>{
                event.preventDefault();
                const valeurPseudo = window.document.querySelector('input').value
                const regex = "^[a-zA-Z0-9_]*$";
                let presencePseudo = valeurPseudo.match(regex);

                //console.log(presencePseudo)
                //si l'utilisateur ne saisi pas de pseudo
                if(valeurPseudo ==""){
                    presencePseudo=null
                    //console.log(presencePseudo)
                }
                    if(divAvatar && presencePseudo!=null){
                        const pseudoJoueur = pseudo.value;
                        //console.log(pseudoJoueur)
                        socket.emit('pseudo-dispo',pseudoJoueur)}// envoie une demande au serveur pour déclanché le code de la dispo du pseudo
                    else{
                        if(anomalie){
                            window.document.querySelectorAll('p')[0].remove()
                            anomalie=false;
                        }
                        
                        let saisirDeNouveau = document.createElement("p")
                        saisirDeNouveau.innerHTML="* Veuillez saisir un pseudo et/ou un avatar";
                        saisirDeNouveau.style.color="red";
                        reponse.appendChild(saisirDeNouveau)
                        anomalie=true;
                }
            })

            socket.on('pseudo-dispo-repServeur',data =>{
                const dispo=data

                if(dispo){
                    if(anomalie){
                        window.document.querySelectorAll('p')[0].remove()
                        anomalie=false;
                    }
                    
                    let lienPartie = document.createElement("a")
                    lienPartie.innerHTML="Lancement d'une partie";
                    lienPartie.href="/preparation"
                    partie.append(lienPartie)
                    donneesJoueur.pseudo = pseudo.value;
                    pseudo.disabled=true;
                    creationAvatar.disabled=true
                    testdispo.disabled=true

                    window.document.querySelector('a').addEventListener('click',(event) => {
                        const pseudoJoueur = pseudo.value;
                        donneesJoueur.pseudo = pseudoJoueur;
                        socket.emit('donneesJoueur',{pseudo : pseudoJoueur, couleurAvatar:donneesJoueur.couleurAvatar});
        
                    })
        
                }
                else{
                    if(anomalie){
                        window.document.querySelectorAll('p')[0].remove()
                        anomalie=false;
                    }
                    let saisirDeNouveau = document.createElement("p")
                    saisirDeNouveau.innerHTML="* Veuillez saisir un pseudo disponible";
                    saisirDeNouveau.style.color="red";
                    reponse.appendChild(saisirDeNouveau)
                    anomalie=true;
                    
                }
            });








});
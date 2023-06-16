/// <reference types="@workadventure/iframe-api-typings" />

import { ActionMessage, ActionsMenuAction } from "@workadventure/iframe-api-typings";
import { isModifyUIWebsiteEvent } from "@workadventure/iframe-api-typings/front/Api/Events/Ui/UIWebsiteEvent";
import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');


let triggerMessage: any = undefined;
let count: number = 0;
let currentPopup: any = undefined;
let helloWorldPopup: any = undefined;
let mainPopup: any = undefined;
let ascenseur_btn: any = undefined;
let chatPopup: any = undefined; 
let antibouf: number=0;
let increment_mw: any = 0; 
var myWebsite: any=undefined;
var coWebsite: any;

// Variable pour stocker le nombre d'increments
let incrementCount: number = 0;




// Waiting for the API to be ready
WA.onInit().then(() => {
    console.log('Scripting API ready');
    console.log('Player tags: ',WA.player.tags)
    setTimeout(() => {
        WA.controls.restorePlayerControls();
    }, 10000)
    
    WA.room.hideLayer("PNJ/PNJ");

    // Fonction de gestionnaire d'événement pour la molette de la souris
function handleScroll(event: WheelEvent) {
    // Vérifier la direction du défilement
    if (event.deltaY > 0) {
      // Incrémenter le compteur si le défilement est vers le bas
      incrementCount++;
    } else {
      // Décrémenter le compteur si le défilement est vers le haut
      incrementCount--;
    }
  
    // Afficher le nombre d'increments dans la console
    console.info("Nombre d'increments : " + incrementCount);
  }
  
  // Ajouter un écouteur d'événements pour la molette de la souris
  window.addEventListener("wheel", handleScroll);

    WA.room.area.onEnter('clock').subscribe(() => {
        const today = new Date();
        const time = today.getHours() + ":" + today.getMinutes();
        currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
    })

    WA.room.area.onLeave('clock').subscribe(closePopup)

    //Interacion PNJ Robot
    WA.room.area.onEnter("pnj_chatzone").subscribe(async () =>  {
        /* myWebsite = await WA.ui.website.open({
            url: "src/pnj_chat.html",
            allowApi: true,
            position: {
                vertical: "middle",
                horizontal: "middle",
            },
            size: {
                height: "50vh",
                width: "50vw",
            },
        }); */
        triggerMessage = WA.ui.displayActionMessage({
            message: "Appuyer sur \"Espace\" pour interagire",
            callback: () => {
                
            }
        });


        // CoWbesite Test

/*         coWebsite = await WA.nav.openCoWebSite('https://www.wikipedia.org/'); */



        //Popup Test Question

        /* mainPopup = WA.ui.openPopup("main_Popup", 'Besoin d\'information ? Posez moi une question', [
        {
            label: "Quels sont les formations ?",
            className: "normal",
            callback: () => {
                // Close the popup when the "Close" button is pressed.
                if(antibouf==0){
                    antibouf=1;
                    coWebsite =WA.nav.openCoWebSite('https://www.wikipedia.org/');
                    chatPopup = WA.ui.openPopup("main_Popup", "Nous proposons 2 formations \: - Le Bachelor Designer Numérique, de niveau Bac+3 qui vise à former les futurs acteurs de l’innovation numérique. - Le Mastère Manager de Projet Numérique, de niveau Bac+5 qui forme les futurs managers de la transformation numérique des entreprises. ",[
                        {
                            label: "Close",
                            className: "primary",
                            callback: (popup) => {
                                // Close the popup when the "Close" button is pressed.
                                antibouf=0;
                                coWebsite.close();
                                popup.close(); 
                            }
                        },

                    ]);  
                }
                
            }
        },
        {
            label: "Infos inscription",
            className: "normal",
            callback: () => {
                // Close the popup when the "Close" button is pressed.
                if(antibouf==0){
                    antibouf=1;
                    chatPopup = WA.ui.openPopup("main_Popup", "Par quelle formation êtes vous interresser",[
                        {
                            label: "Master",
                            className: "primary",
                            callback: () => {
                                chatPopup = WA.ui.openPopup("main_Popup","Infos Master",
                                    [
                                        {
                                        label: "Close",
                                        className: "primary",
                                        callback: (popup) => {
                                            // Close the popup when the "Close" button is pressed.
                                            antibouf=0;
                                            popup.close();  
                            
                                        },}
                                    ])
                                // Close the popup when the "Close" button is pressed.
                
                            },
                        },
                        {
                        label: "Bachelor",
                        className: "primary",
                        callback: () => {
                            chatPopup = WA.ui.openPopup("main_Popup","Infos Bachelor",
                                    [
                                        {
                                        label: "Close",
                                        className: "primary",
                                        callback: (popup) => {
                                            // Close the popup when the "Close" button is pressed.
                                            antibouf=0;
                                            popup.close();  
                            
                                        },}
                                    ])
                            // Close the popup when the "Close" button is pressed.
            
                        }},
                        {label: "Close",
                        className: "primary",
                        callback: (popup) => {
                            // Close the popup when the "Close" button is pressed.
                            antibouf=0;
                            popup.close();  
            
                        }},

                    ]);  
                    }
                
            }
        },
        {
            label: "Close",
            className: "primary",
            callback: (popup) => {
                // Close the popup when the "Close" button is pressed.
                popup.close();  

            }
        },]
        ); */
        
        });
        WA.room.area.onLeave("pnj_chatzone").subscribe(() => {
/*             myWebsite.close();
            coWebsite.close();
            mainPopup.close(); */
            triggerMessage.remove();
        });
       

    // Interaction spacebar custom
    WA.room.area.onEnter('chair_anim').subscribe(() => {
        triggerMessage = WA.ui.displayActionMessage({
            message: "appuyer sur espace pour lancer l'animation",
            callback: () => {
                count = count+1;
                console.log(count);
                WA.room.setTiles([
                    { x: 48, y: 33, tile: null, layer: "Chaise" },
                    { x: 48, y: 32, tile: null, layer: "Chaise" },
                  ]);
                  setTimeout(() => {
                    // later
                    WA.room.setTiles([
                        { x: 48, y: 33, tile: 'chair_d', layer: "Chaise" },
                        { x: 48, y: 32, tile: 'chair_u', layer: "Chaise" },
                      ]);
                }, 4000)
            }
        });
        
    })
    WA.room.area.onLeave('screen_anim').subscribe(() => {
        triggerMessage.remove();
    });
    //Interaction Bigscreen
    
    WA.room.area.onEnter('screen_anim').subscribe(() => {
        triggerMessage = WA.ui.displayActionMessage({
            message: "Appuyer sur \"Espace\" pour lancer l'animation",
            callback: () => {
            var i = 0;
            var counter = setInterval(function(){
                // do your thing
                WA.room.setTiles([
                    { x: 43, y: 25, tile: "screen_1x1_"+i, layer: "Grand Ecran" },
                    { x: 44, y: 25, tile: "screen_1x2_"+i, layer: "Grand Ecran" },
                    { x: 45, y: 25, tile: "screen_1x3_"+i, layer: "Grand Ecran" },
                    { x: 46, y: 25, tile: "screen_1x4_"+i, layer: "Grand Ecran" },
                    { x: 43, y: 26, tile: "screen_2x1_"+i, layer: "Grand Ecran" },
                    { x: 44, y: 26, tile: "screen_2x2_"+i, layer: "Grand Ecran" },
                    { x: 45, y: 26, tile: "screen_2x3_"+i, layer: "Grand Ecran" },
                    { x: 46, y: 26, tile: "screen_2x4_"+i, layer: "Grand Ecran" },
                    { x: 43, y: 27, tile: "screen_3x1_"+i, layer: "Grand Ecran" },
                    { x: 44, y: 27, tile: "screen_3x2_"+i, layer: "Grand Ecran" },
                    { x: 45, y: 27, tile: "screen_3x3_"+i, layer: "Grand Ecran" },
                    { x: 46, y: 27, tile: "screen_3x4_"+i, layer: "Grand Ecran" },
                ]);
                i++;
                if(i === 10) {
                    clearInterval(counter);
                }
            }, 100);
                
                
                  /* setTimeout(() => {
                    // later
                    WA.room.setTiles([
                    { x: 43, y: 25, tile: "screen_fix_1x1", layer: "Grand Ecran" },
                    { x: 44, y: 25, tile: "screen_fix_1x2", layer: "Grand Ecran" },
                    { x: 45, y: 25, tile: "screen_fix_1x3", layer: "Grand Ecran" },
                    { x: 46, y: 25, tile: "screen_fix_1x4", layer: "Grand Ecran" },
                    { x: 43, y: 26, tile: "screen_fix_2x1", layer: "Grand Ecran" },
                    { x: 44, y: 26, tile: "screen_fix_2x2", layer: "Grand Ecran" },
                    { x: 45, y: 26, tile: "screen_fix_2x3", layer: "Grand Ecran" },
                    { x: 46, y: 26, tile: "screen_fix_2x4", layer: "Grand Ecran" },
                    { x: 43, y: 27, tile: "screen_fix_3x1", layer: "Grand Ecran" },
                    { x: 44, y: 27, tile: "screen_fix_3x2", layer: "Grand Ecran" },
                    { x: 45, y: 27, tile: "screen_fix_3x3", layer: "Grand Ecran" },
                    { x: 46, y: 27, tile: "screen_fix_3x4", layer: "Grand Ecran" },
                      ]);
                }, 1000) */
            }
        });
        
    })
    WA.room.area.onLeave('chair_anim').subscribe(() => {
        triggerMessage.remove();
    });
    

    // Affiche Popup
    WA.room.area.onEnter('affiche_1').subscribe(() => {
        currentPopup = WA.ui.openPopup("infoaffiche", 'Appuyer sur play pour lancer la video',[{
            label: "Close",
            className: "primary",
            callback: (popup) => {
                // Close the popup when the "Close" button is pressed.
                popup.close();  

            }
        },]);
    })
    WA.room.area.onLeave('affiche_1').subscribe(() => {
        currentPopup.close();
    })

    // PNJ Test Zone

    WA.room.area.onEnter('pnj_trigger').subscribe(() => {
        WA.room.setTiles([
            { x: 17, y: 6, tile: "top_mark", layer: "PNJ/PNJ_Mark" },
            { x: 17, y: 7, tile: "bottom_mark", layer: "PNJ/PNJ_Mark" },
          ]);
    })
    WA.room.area.onEnter('pn_chat').subscribe(() => {
        WA.room.hideLayer("PNJ/PNJ_Anim");
        WA.room.showLayer("PNJ/PNJ");
        
    })



    WA.room.area.onLeave('pnj_trigger').subscribe(() => {
        WA.room.setTiles([
            { x: 17, y: 6, tile: null, layer: "PNJ/PNJ_Mark" },
            { x: 17, y: 7, tile: null, layer: "PNJ/PNJ_Mark" },
          ]);
    })
    WA.room.area.onLeave('pn_chat').subscribe(() => {
        WA.room.showLayer("PNJ/PNJ_Anim");
        WA.room.hideLayer("PNJ/PNJ");
    })

    

    // Popup test
    WA.room.area.onEnter("pnj_trigger").subscribe(() => {
        
        helloWorldPopup = WA.ui.openPopup("popupRectangle", '', [{
            label: "Close",
            className: "primary",
            callback: (popup) => {
                // Close the popup when the "Close" button is pressed.
                popup.close();  

            }
        },
        {
            label: "Bonjour",
            className: "normal",
            callback: () => {
                // Close the popup when the "Close" button is pressed.
                if(antibouf==0){
                    antibouf=1;
                    chatPopup = WA.ui.openPopup("popupRectangle", "Bonjour !",[
                        {
                            label: "Close",
                            className: "primary",
                            callback: (popup) => {
                                // Close the popup when the "Close" button is pressed.
                                antibouf=0;
                                popup.close();  
                
                            }
                        },

                    ]);  
                    setTimeout(() => {
                        chatPopup.close();
                        console.log("Retardée de 5 seconde.");
                        antibouf=0;
                    }, 5000) }
                
            }
        },
        {
            label: "Infos inscription",
            className: "normal",
            callback: () => {
                // Close the popup when the "Close" button is pressed.
                if(antibouf==0){
                    antibouf=1;
                    chatPopup = WA.ui.openPopup("popupRectangle", "Lien vers inscription",[
                        {
                            label: "Close",
                            className: "primary",
                            callback: (popup) => {
                                // Close the popup when the "Close" button is pressed.
                                antibouf=0;
                                popup.close();  
                
                            }
                        },

                    ]);  
                    setTimeout(() => {
                        chatPopup.close();
                        console.log("Retardée de 5 seconde.");
                        antibouf=0;
                    }, 5000) }
                
            }
        }]);
        });

    // Close the popup when we leave the zone.
    WA.room.area.onLeave("pnj_trigger").subscribe(() => {
        helloWorldPopup.close();
        myWebsite.close();
    })

    // Ascenseur

    WA.room.area.onEnter('ascenseur_zone').subscribe(() => {
        ascenseur_btn = WA.ui.openPopup("btn-overlay", "etage", []);
    })



    // Show/Hide Roof

    WA.room.area.onEnter('hideroof').subscribe(() => {
        WA.room.hideLayer("Toit");
    })
    WA.room.area.onLeave('hideroof').subscribe(() => {
        WA.room.hideLayer("Toit");
    })
    WA.room.area.onEnter('showroof').subscribe(() => {
        WA.room.showLayer("Toit");
    })
    WA.room.area.onLeave('showroof').subscribe(() => {
        WA.room.showLayer("Toit");
    })

    // Camera Zoom Test

    WA.room.area.onEnter('cam_test').subscribe(() => {
        WA.camera.set(
            550,
            47,
            200,
            300,
            true,
            true,
        )
        WA.room.setTiles([
            { x: 18, y: 2, tile: "P_I", layer: "PNJ/PNJ_Mark" },
          ]);
    })
    WA.room.area.onLeave('cam_test').subscribe(() => {
        WA.camera.followPlayer(true) ;
        WA.room.setTiles([
            { x: 18, y: 2, tile: null, layer: "PNJ/PNJ_Mark" },
          ]);
    })

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra().then(() => {
        console.log('Scripting API Extra ready');
    }).catch(e => console.error(e));

}).catch(e => console.error(e));

function closePopup(){
    if (currentPopup !== undefined) {
        currentPopup.close();
        currentPopup = undefined;
    }
}

export {};
    function closeCoWebSite(myWebsite: any) {
        throw new Error("Function not implemented.");
    }


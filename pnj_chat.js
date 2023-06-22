allquestion = document.getElementById("all_q");
retour = document.querySelectorAll(".btn");
retourlist = document.querySelectorAll(".btn_list");
btn_back_d = document.querySelectorAll(".btn_back_d");
debouche_back_btn = document.querySelectorAll(".d");
question = document.querySelectorAll(".c");
question1 = document.getElementById("q_1");
question2 = document.getElementById("q_2");
question3 = document.getElementById("q_3");
question4 = document.getElementById("q_4");
question5 = document.getElementById("q_5");
question6 = document.getElementById("q_6");
reponse1 = document.querySelector(".card0");
reponse2 = document.querySelector(".card1");
reponse3 = document.querySelector(".card2");
reponse4 = document.querySelector(".card3");
reponse5 = document.querySelector(".card4");
reponse6 = document.querySelector(".card5");
matiere1 = document.querySelector(".m_1");
matiere2 = document.querySelector(".m_2");
matiere3 = document.querySelector(".m_3");
matiere4 = document.querySelector(".m_4");
matiere5 = document.querySelector(".m_5");
matiere6 = document.querySelector(".m_6");
matiere7 = document.querySelector(".m_7");
matiere8 = document.querySelector(".m_8");
listematiere = document.querySelectorAll(".listematiere");
listematiere1 = document.querySelector(".listematiere_1");
listematiere2 = document.querySelector(".listematiere_2");
listematiere3 = document.querySelector(".listematiere_3");
listematiere4 = document.querySelector(".listematiere_4");
listematiere5 = document.querySelector(".listematiere_5");
listematiere6 = document.querySelector(".listematiere_6");
listematiere7 = document.querySelector(".listematiere_7");
listematiere8 = document.querySelector(".listematiere_8");
btn_debouchebache = document.querySelector(".d_bache");
btn_debouchmaster = document.querySelector(".d_master");
debouchebache = document.querySelector(".debouche_bache");
debouchemaster = document.querySelector(".debouche_master");


for (let i = 0; i < retour.length; i++) {
    retour[i].addEventListener("click", function() {
        question.forEach((question) => {
            question.classList.remove('active');
          });
        allquestion.classList.toggle("active");
    });
}
for (let i = 0; i < btn_back_d.length; i++) {
    btn_back_d[i].addEventListener("click", function() {
        debouche_back_btn.forEach((debouche_back_btn) => {
            debouche_back_btn.classList.remove('active');
          });
        reponse6.classList.toggle("active");
    });
}
for (let i = 0; i < retourlist.length; i++) {
    retourlist[i].addEventListener("click", function() {
        listematiere.forEach((listematiere) => {
            listematiere.classList.remove('active');
          });
        reponse5.classList.toggle("active");
    });
}
console.dir(question);
question1.addEventListener("click", function() { 
    allquestion.classList.toggle("active");
    reponse1.classList.toggle("active");   
});
question2.addEventListener("click", function() { 
    allquestion.classList.toggle("active");
    reponse2.classList.toggle("active");
});
question3.addEventListener("click", function() { 
    allquestion.classList.toggle("active");
    reponse3.classList.toggle("active");
});
question4.addEventListener("click", function() { 
    allquestion.classList.toggle("active");
    reponse4.classList.toggle("active");
});
question5.addEventListener("click", function() { 
    allquestion.classList.toggle("active");
    reponse5.classList.toggle("active");
});
question6.addEventListener("click", function() { 
    allquestion.classList.toggle("active");
    reponse6.classList.toggle("active");
});
matiere1.addEventListener("click", function() { 
    listematiere1.classList.toggle("active");
    reponse5.classList.toggle("active");
});
matiere2.addEventListener("click", function() { 
    listematiere2.classList.toggle("active");
    reponse5.classList.toggle("active");
});
matiere3.addEventListener("click", function() { 
    listematiere3.classList.toggle("active");
    reponse5.classList.toggle("active");
});
matiere4.addEventListener("click", function() { 
    listematiere4.classList.toggle("active");
    reponse5.classList.toggle("active");
});
matiere5.addEventListener("click", function() { 
    listematiere5.classList.toggle("active");
    reponse5.classList.toggle("active");
});
matiere6.addEventListener("click", function() { 
    listematiere6.classList.toggle("active");
    reponse5.classList.toggle("active");
});
matiere7.addEventListener("click", function() { 
    listematiere7.classList.toggle("active");
    reponse5.classList.toggle("active");
});
matiere8.addEventListener("click", function() { 
    listematiere8.classList.toggle("active");
    reponse5.classList.toggle("active");
});
btn_debouchebache.addEventListener("click", function() { 
    debouchebache.classList.toggle("active");
    reponse6.classList.toggle("active");
});
btn_debouchmaster.addEventListener("click", function() { 
    debouchemaster.classList.toggle("active");
    reponse6.classList.toggle("active");
});



/* retour.addEventListener("click", function() { 
    question.forEach((question) => {
        question.classList.remove('active');
      });
    allquestion.classList.toggle("active");
});
 */
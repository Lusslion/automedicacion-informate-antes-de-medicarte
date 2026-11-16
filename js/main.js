(function(){
  "use strict";
  document.querySelectorAll(".myth button").forEach(function(b){
    b.addEventListener("click",function(){
      var m=b.closest(".myth"),o=m.classList.toggle("open");
      b.setAttribute("aria-expanded",String(o));
    });
  });

  (function(){
    var nav=document.querySelector(".nav"),menuButton=nav.querySelector(".menu-btn"),links=nav.querySelectorAll(".menu a");
    function setMenu(open){
      menuButton.setAttribute("aria-expanded",String(open));
      menuButton.querySelector("path").setAttribute("d",open?"M6 6l12 12M6 18 18 6":"M4 6h16M4 12h16M4 18h16");
    }
    menuButton.addEventListener("click",function(){setMenu(menuButton.getAttribute("aria-expanded")!=="true");});
    links.forEach(function(link){link.addEventListener("click",function(){setMenu(false);});});
    document.addEventListener("keydown",function(event){
      if(event.key==="Escape"&&menuButton.getAttribute("aria-expanded")==="true"){
        setMenu(false);
        if(window.matchMedia("(max-width: 1199px)").matches)menuButton.focus();
      }
    });
    document.addEventListener("click",function(event){if(!nav.contains(event.target))setMenu(false);});
    if("IntersectionObserver" in window){
      var observer=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting)links.forEach(function(link){
            if(link.hash==="#"+entry.target.id)link.setAttribute("aria-current","location");
            else link.removeAttribute("aria-current");
          });
        });
      },{rootMargin:"-40% 0px -55% 0px",threshold:0});
      document.querySelectorAll("#inicio, main section[id]").forEach(function(section){observer.observe(section);});
    }
    var root=document.documentElement,themeButton=nav.querySelector(".theme-btn"),systemTheme=window.matchMedia("(prefers-color-scheme: dark)");
    function isDark(){return root.hasAttribute("data-theme")?root.getAttribute("data-theme")==="dark":systemTheme.matches;}
    function refreshTheme(){
      var dark=isDark();
      themeButton.setAttribute("aria-label",dark?"Cambiar a modo claro":"Cambiar a modo oscuro");
      themeButton.querySelector("svg").innerHTML=dark?'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>':'<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>';
    }
    themeButton.addEventListener("click",function(){
      var theme=isDark()?"light":"dark";
      root.setAttribute("data-theme",theme);
      try{localStorage.setItem("tema",theme);}catch(e){}
      refreshTheme();
    });
    function systemChanged(){if(!root.hasAttribute("data-theme"))refreshTheme();}
    if(systemTheme.addEventListener)systemTheme.addEventListener("change",systemChanged);
    else if(systemTheme.addListener)systemTheme.addListener(systemChanged);
    refreshTheme();
  })();
  (function(){
    var bar=document.querySelector(".read-progress span"),toTop=document.querySelector(".to-top"),hero=document.getElementById("inicio"),pending=false;
    function updateReading(){
      pending=false;
      var distance=document.documentElement.scrollHeight-window.innerHeight;
      var progress=distance>0?Math.max(0,Math.min(1,window.scrollY/distance)):0;
      bar.style.transform="scaleX("+progress+")";
      toTop.classList.toggle("is-visible",window.scrollY>hero.offsetHeight);
    }
    function scheduleReading(){
      if(pending)return;
      pending=true;
      window.requestAnimationFrame(updateReading);
    }
    window.addEventListener("scroll",scheduleReading,{passive:true});
    window.addEventListener("resize",scheduleReading);
    window.addEventListener("load",scheduleReading);
    if("ResizeObserver" in window)new ResizeObserver(scheduleReading).observe(document.body);
    toTop.addEventListener("click",function(){
      hero.setAttribute("tabindex","-1");
      hero.focus({preventScroll:true});
    });
    scheduleReading();
  })();
  (function(){
    var quiz=document.querySelector(".quiz");
    if(!quiz)return;
    var section=quiz.closest("section"),items=Array.from(quiz.querySelectorAll(".quiz-item")),total=items.length,answered=0,score=0;
    var progress=section.querySelector(".quiz-progress"),bar=section.querySelector(".quiz-bar"),result=section.querySelector(".quiz-result"),heading=result.querySelector(".quiz-score");
    function format(text,n){return text.replace("{n}",n).replace("{x}",n).replace("{total}",total);}
    function update(){progress.textContent=format(quiz.dataset.progreso,answered);bar.className="quiz-bar quiz-bar-"+answered;}
    items.forEach(function(item){
      var buttons=Array.from(item.querySelectorAll(".quiz-opt")),feedback=item.querySelector(".quiz-feedback"),reveal=item.querySelector(".quiz-reveal");
      reveal.hidden=true;
      buttons.forEach(function(button){button.addEventListener("click",function(){
        if(item.classList.contains("is-answered"))return;
        var correct=button.dataset.answer===item.dataset.correct;
        item.classList.add("is-answered");
        buttons.forEach(function(option){option.disabled=true;option.setAttribute("aria-pressed",String(option===button));});
        button.classList.add(correct?"is-ok":"is-ko");
        var icon=document.createElementNS("http://www.w3.org/2000/svg","svg");
        icon.setAttribute("viewBox","0 0 24 24");icon.setAttribute("fill","none");icon.setAttribute("stroke","currentColor");icon.setAttribute("stroke-width","2");icon.setAttribute("aria-hidden","true");icon.setAttribute("focusable","false");
        var path=document.createElementNS("http://www.w3.org/2000/svg","path");
        path.setAttribute("d",correct?"m4 12 5 5L20 6":"m6 6 12 12M6 18 18 6");icon.appendChild(path);button.prepend(icon);
        var answer=buttons.find(function(option){return option.dataset.answer===item.dataset.correct;}).textContent;
        feedback.className="quiz-feedback "+(correct?"is-ok":"is-ko");
        feedback.textContent=(correct?quiz.dataset.correcto:quiz.dataset.incorrecto)+" "+quiz.dataset.respuesta+" "+answer+".";
        answered++;if(correct)score++;update();reveal.hidden=false;reveal.focus();
        if(answered===total){result.hidden=false;heading.textContent=format(quiz.dataset.resultado,score);result.querySelector(".quiz-msg").textContent=quiz.dataset[score===total?"alto":score>=4?"medio":"bajo"];}
      });});
    });
    section.querySelector(".quiz-retry").addEventListener("click",function(){
      answered=0;score=0;result.hidden=true;heading.textContent=format(quiz.dataset.resultado,"X");result.querySelector(".quiz-msg").textContent="";
      items.forEach(function(item){
        item.classList.remove("is-answered");item.querySelector(".quiz-reveal").hidden=true;var feedback=item.querySelector(".quiz-feedback");feedback.textContent="";feedback.className="quiz-feedback";
        item.querySelectorAll(".quiz-opt").forEach(function(button){button.disabled=false;button.setAttribute("aria-pressed","false");button.className="quiz-opt";var icon=button.querySelector("svg");if(icon)icon.remove();});
      });update();items[0].querySelector(".quiz-opt").focus();
    });
  })();
})();

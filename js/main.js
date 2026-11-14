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
        if(window.matchMedia("(max-width: 1023px)").matches)menuButton.focus();
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
})();

(function(){
  "use strict";
  var section=document.getElementById("juegos");
  if(!section)return;
  var SVG="http://www.w3.org/2000/svg";

  function shuffle(list){
    var a=list.slice();
    for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}
    return a;
  }
  function icon(d){
    var svg=document.createElementNS(SVG,"svg");
    svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("fill","none");svg.setAttribute("stroke","currentColor");
    svg.setAttribute("stroke-width","2");svg.setAttribute("stroke-linecap","round");svg.setAttribute("stroke-linejoin","round");
    svg.setAttribute("aria-hidden","true");svg.setAttribute("focusable","false");
    var path=document.createElementNS(SVG,"path");path.setAttribute("d",d);svg.appendChild(path);
    return svg;
  }
  var OK="m4 12 5 5L20 6",KO="m6 6 12 12M6 18 18 6";
  function say(el,text){
    /* Vacía y vuelve a escribir para que el lector de pantalla repita mensajes iguales */
    el.textContent="";
    window.setTimeout(function(){el.textContent=text;},60);
  }
  function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}

  /* ---------- Pestañas ---------- */
  var tabs=Array.from(section.querySelectorAll('[role="tab"]'));
  function selectTab(tab,focus){
    tabs.forEach(function(t){
      var on=t===tab;
      t.setAttribute("aria-selected",String(on));
      t.tabIndex=on?0:-1;
      document.getElementById(t.getAttribute("aria-controls")).hidden=!on;
    });
    if(focus)tab.focus();
  }
  tabs.forEach(function(tab,i){
    tab.addEventListener("click",function(){selectTab(tab,false);});
    tab.addEventListener("keydown",function(e){
      var n=null;
      if(e.key==="ArrowRight")n=(i+1)%tabs.length;
      else if(e.key==="ArrowLeft")n=(i-1+tabs.length)%tabs.length;
      else if(e.key==="Home")n=0;
      else if(e.key==="End")n=tabs.length-1;
      if(n===null)return;
      e.preventDefault();selectTab(tabs[n],true);
    });
  });

  /* ---------- 1. Sopa de letras ---------- */
  (function(){
    var SIZE=12,LETTERS="ABCDEFGHIJLMNOPQRSTUVXYZ";
    var WORDS=[
      {w:"RECETA",label:"Receta",fact:"Lo recetado a una persona no es para otra."},
      {w:"PROSPECTO",label:"Prospecto",fact:"Es la información autorizada del medicamento: para qué sirve, advertencias y efectos."},
      {w:"FARMACIA",label:"Farmacia",fact:"Ante dudas, acude a tu centro de salud o a una farmacia con profesional."},
      {w:"VIRUS",label:"Virus",fact:"La gripe y el resfrío los causan virus, y los antibióticos no actúan contra virus."},
      {w:"BACTERIA",label:"Bacteria",fact:"Los antibióticos solo actúan contra bacterias. Usarlos mal favorece la resistencia bacteriana."},
      {w:"ALERGIA",label:"Alergia",fact:"Un medicamento puede causar efectos no deseados: desde molestias leves hasta alergias graves."},
      {w:"VACUNA",label:"Vacuna",fact:"Pregunta en tu centro de salud por las vacunas disponibles."},
      {w:"RIESGO",label:"Riesgo",fact:"Un medicamento puede ayudar, pero mal usado también puede hacer daño."},
      {w:"CONSULTA",label:"Consulta",fact:"Pregunta a un profesional de salud antes de usar un medicamento."},
      {w:"BOTIQUIN",label:"Botiquín",fact:"Revisa la fecha de vencimiento y guarda los medicamentos lejos de los niños."}
    ];
    var DIRS=[[0,1],[1,0],[1,1]];
    var gridEl=document.getElementById("sopa-grid"),wordsEl=document.getElementById("sopa-words"),countEl=document.getElementById("sopa-count");
    var live=document.getElementById("sopa-live");
    var timerOn=document.getElementById("sopa-timer-on"),timerEl=document.getElementById("sopa-timer"),timerText=timerEl.querySelector("span");
    var letters,cells,found,start=null,dragging=false,focusIndex=0,seconds=0,timerId=null,started=false;

    function build(){
      for(var attempt=0;attempt<100;attempt++){
        var g=[],ok=true;
        for(var r=0;r<SIZE;r++){g.push([]);for(var c=0;c<SIZE;c++)g[r].push("");}
        var order=WORDS.slice().sort(function(a,b){return b.w.length-a.w.length;});
        for(var k=0;k<order.length&&ok;k++){
          var word=order[k].w,placed=false;
          for(var t=0;t<300&&!placed;t++){
            var d=DIRS[Math.floor(Math.random()*DIRS.length)];
            var maxR=SIZE-1-d[0]*(word.length-1),maxC=SIZE-1-d[1]*(word.length-1);
            var r0=Math.floor(Math.random()*(maxR+1)),c0=Math.floor(Math.random()*(maxC+1)),fits=true;
            for(var i=0;i<word.length;i++){var ch=g[r0+d[0]*i][c0+d[1]*i];if(ch&&ch!==word[i]){fits=false;break;}}
            if(fits){for(i=0;i<word.length;i++)g[r0+d[0]*i][c0+d[1]*i]=word[i];placed=true;}
          }
          if(!placed)ok=false;
        }
        if(ok){
          for(r=0;r<SIZE;r++)for(c=0;c<SIZE;c++)if(!g[r][c])g[r][c]=LETTERS[Math.floor(Math.random()*LETTERS.length)];
          return g;
        }
      }
      return null;
    }
    function cellLabel(i){
      var r=Math.floor(i/SIZE),c=i%SIZE,cell=cells[i];
      var label=letters[r][c]+", fila "+(r+1)+", columna "+(c+1);
      if(cell.classList.contains("is-found"))label+=", encontrada";
      if(cell.classList.contains("is-start"))label+=", inicio marcado";
      cell.setAttribute("aria-label",label);
    }
    function setFocus(i,move){
      cells[focusIndex].tabIndex=-1;focusIndex=i;cells[i].tabIndex=0;
      if(move)cells[i].focus();
    }
    function clearPreview(){cells.forEach(function(c){c.classList.remove("is-path");});}
    function line(a,b){
      var ra=Math.floor(a/SIZE),ca=a%SIZE,rb=Math.floor(b/SIZE),cb=b%SIZE,dr=rb-ra,dc=cb-ca;
      if(!(dr===0||dc===0||Math.abs(dr)===Math.abs(dc)))return null;
      var n=Math.max(Math.abs(dr),Math.abs(dc)),sr=Math.sign(dr),sc=Math.sign(dc),out=[];
      for(var i=0;i<=n;i++)out.push((ra+sr*i)*SIZE+(ca+sc*i));
      return out;
    }
    function preview(b){
      clearPreview();
      var path=start===null?null:line(start,b);
      if(path)path.forEach(function(i){cells[i].classList.add("is-path");});
    }
    function setStart(i){
      if(start!==null){var old=start;cells[old].classList.remove("is-start");cells[old].setAttribute("aria-selected","false");start=null;cellLabel(old);}
      if(i!==null){start=i;cells[i].classList.add("is-start");cells[i].setAttribute("aria-selected","true");cellLabel(i);}
    }
    function startTimer(){
      if(started)return;
      started=true;
      timerId=window.setInterval(function(){seconds++;showTime();},1000);
    }
    function stopTimer(){if(timerId)window.clearInterval(timerId);timerId=null;}
    function timeText(){var m=Math.floor(seconds/60),s=seconds%60;return m+":"+(s<10?"0":"")+s;}
    function showTime(){timerText.textContent=timeText();}
    function attempt(a,b){
      var path=line(a,b);
      setStart(null);clearPreview();
      if(!path){say(live,"Selecciona una línea recta: horizontal, vertical o diagonal.");return;}
      var text=path.map(function(i){return letters[Math.floor(i/SIZE)][i%SIZE];}).join(""),rev=text.split("").reverse().join("");
      var hit=WORDS.find(function(w){return !found[w.w]&&(w.w===text||w.w===rev);});
      if(!hit){
        var already=WORDS.some(function(w){return found[w.w]&&(w.w===text||w.w===rev);});
        say(live,already?"Esa palabra ya la encontraste.":"Esa palabra no está en la lista. Sigue buscando.");
        return;
      }
      found[hit.w]=true;
      path.forEach(function(i){cells[i].classList.add("is-found");cellLabel(i);});
      var item=wordsEl.querySelector('[data-word="'+hit.w+'"]');
      item.classList.add("is-found");item.querySelector(".vh").textContent=" (encontrada)";
      var total=Object.keys(found).length;
      countEl.textContent="Encontraste "+total+" de "+WORDS.length;
      var msg="¡Encontraste "+hit.label+"! "+hit.fact;
      if(total===WORDS.length){
        stopTimer();
        msg+=" ¡Felicidades! Encontraste las "+WORDS.length+" palabras"+(timerOn.checked?" en "+timeText():"")+".";
        countEl.textContent="¡Completaste la sopa! Encontraste "+total+" de "+WORDS.length;
      }
      say(live,msg);
    }
    function pick(i){
      startTimer();
      if(Object.keys(found).length===WORDS.length)return;
      if(start===null){setStart(i);say(live,"Inicio marcado en la letra "+letters[Math.floor(i/SIZE)][i%SIZE]+". Ahora elige la última letra.");}
      else if(start===i){setStart(null);clearPreview();say(live,"Selección cancelada.");}
      else attempt(start,i);
    }
    function indexOf(target){var c=target&&target.closest?target.closest(".sopa-cell"):null;return c?Number(c.dataset.i):-1;}
    function cellAt(x,y){return indexOf(document.elementFromPoint(x,y));}

    function newGame(){
      letters=build();found={};start=null;dragging=false;focusIndex=0;seconds=0;started=false;stopTimer();showTime();
      gridEl.textContent="";cells=[];
      for(var r=0;r<SIZE;r++){
        var row=el("div","sopa-row");row.setAttribute("role","row");
        for(var c=0;c<SIZE;c++){
          var cell=el("div","sopa-cell",letters[r][c]);
          cell.setAttribute("role","gridcell");cell.setAttribute("aria-selected","false");
          cell.dataset.i=String(r*SIZE+c);cell.tabIndex=(r===0&&c===0)?0:-1;
          row.appendChild(cell);cells.push(cell);
        }
        gridEl.appendChild(row);
      }
      cells.forEach(function(c,i){cellLabel(i);});
      wordsEl.textContent="";
      WORDS.forEach(function(w){
        var li=el("li",null,w.label);li.dataset.word=w.w;
        li.appendChild(el("span","vh"," (pendiente)"));
        wordsEl.appendChild(li);
      });
      countEl.textContent="Encontraste 0 de "+WORDS.length;
    }

    gridEl.addEventListener("pointerdown",function(e){
      var i=indexOf(e.target);if(i<0)return;
      if(e.pointerType==="mouse"&&e.button!==0)return;
      e.preventDefault();
      setFocus(i,true);
      if(start!==null){pick(i);dragging=false;return;}
      pick(i);
      dragging=e.pointerType==="mouse";
    });
    gridEl.addEventListener("pointermove",function(e){
      if(!dragging||start===null)return;
      var i=cellAt(e.clientX,e.clientY);if(i>=0)preview(i);
    });
    document.addEventListener("pointerup",function(e){
      if(!dragging)return;
      dragging=false;
      var i=cellAt(e.clientX,e.clientY);
      if(i>=0&&start!==null&&i!==start){setFocus(i,true);attempt(start,i);}
      else clearPreview();
    });
    gridEl.addEventListener("keydown",function(e){
      var i=indexOf(e.target);if(i<0)return;
      var r=Math.floor(i/SIZE),c=i%SIZE,n=null;
      switch(e.key){
        case "ArrowRight":if(c<SIZE-1)n=i+1;break;
        case "ArrowLeft":if(c>0)n=i-1;break;
        case "ArrowDown":if(r<SIZE-1)n=i+SIZE;break;
        case "ArrowUp":if(r>0)n=i-SIZE;break;
        case "Home":n=e.ctrlKey?0:r*SIZE;break;
        case "End":n=e.ctrlKey?SIZE*SIZE-1:r*SIZE+SIZE-1;break;
        case "Enter":case " ":e.preventDefault();pick(i);return;
        case "Escape":if(start!==null){setStart(null);clearPreview();say(live,"Selección cancelada.");}return;
        default:return;
      }
      e.preventDefault();
      if(n!==null){setFocus(n,true);if(start!==null)preview(n);}
    });
    timerOn.addEventListener("change",function(){timerEl.hidden=!timerOn.checked;});
    document.getElementById("sopa-new").addEventListener("click",function(){newGame();say(live,"Nueva sopa de letras lista.");});
    newGame();
  })();

  /* ---------- 2. Memoria de parejas ---------- */
  (function(){
    var PAIRS=[
      ["Antibióticos","Solo actúan contra bacterias"],
      ["Gripe y resfrío","Los causan virus"],
      ["Prospecto","Información autorizada del medicamento"],
      ["Venta libre","Sin receta, pero con riesgos"],
      ["Intoxicación","Ir de inmediato a emergencias"],
      ["Botiquín de casa","Lejos del alcance de los niños"]
    ];
    var gridEl=document.getElementById("memo-grid"),countEl=document.getElementById("memo-count"),live=document.getElementById("memo-live");
    var cards,up,tries,pairs,locked,timer;
    var BACK="M12 17v.1M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14";
    function label(card){
      var n="Carta "+card.n+": ";
      if(card.matched)return n+card.text+" ("+card.kind.toLowerCase()+"), pareja encontrada";
      if(card.up)return n+card.text+" ("+card.kind.toLowerCase()+")";
      return n+"boca abajo";
    }
    function refresh(card){card.btn.setAttribute("aria-label",label(card));}
    function updateCount(){countEl.textContent="Intentos: "+tries+" · Parejas: "+pairs+" de "+PAIRS.length;}
    function flip(card){
      if(locked||card.up||card.matched)return;
      card.up=true;card.btn.classList.add("is-up");refresh(card);up.push(card);
      if(up.length<2){say(live,card.text+".");return;}
      tries++;
      var a=up[0],b=up[1];
      if(a.pair===b.pair){
        a.matched=b.matched=true;pairs++;up=[];
        [a,b].forEach(function(c){c.btn.classList.add("is-match");c.btn.setAttribute("aria-disabled","true");refresh(c);});
        updateCount();
        var concept=a.kind==="Concepto"?a:b,expl=concept===a?b:a;
        var msg="¡Pareja encontrada! "+concept.text+": "+expl.text.charAt(0).toLowerCase()+expl.text.slice(1)+".";
        if(pairs===PAIRS.length)msg+=" ¡Completaste el juego en "+tries+" intentos!";
        say(live,msg);
        if(pairs===PAIRS.length)countEl.textContent="¡Completaste el juego! Intentos: "+tries+" · Parejas: "+pairs+" de "+PAIRS.length;
      }else{
        updateCount();locked=true;
        say(live,b.text+". No son pareja. Inténtalo otra vez.");
        timer=window.setTimeout(function(){
          [a,b].forEach(function(c){c.up=false;c.btn.classList.remove("is-up");refresh(c);});
          up=[];locked=false;
        },1400);
      }
    }
    function newGame(){
      window.clearTimeout(timer);
      up=[];tries=0;pairs=0;locked=false;cards=[];
      PAIRS.forEach(function(p,i){cards.push({pair:i,text:p[0],kind:"Concepto"});cards.push({pair:i,text:p[1],kind:"Explicación"});});
      cards=shuffle(cards);gridEl.textContent="";
      cards.forEach(function(card,i){
        card.n=i+1;card.up=false;card.matched=false;
        var btn=el("button","memo-card");btn.type="button";
        var inner=el("span","memo-inner"),front=el("span","memo-face memo-front"),back=el("span","memo-face memo-back");
        front.setAttribute("aria-hidden","true");back.setAttribute("aria-hidden","true");
        front.appendChild(icon(BACK));
        back.appendChild(el("small","memo-kind",card.kind));back.appendChild(el("span","memo-text",card.text));
        inner.appendChild(front);inner.appendChild(back);btn.appendChild(inner);
        btn.addEventListener("click",function(){flip(card);});
        card.btn=btn;refresh(card);gridEl.appendChild(btn);
      });
      updateCount();
    }
    document.getElementById("memo-new").addEventListener("click",function(){newGame();say(live,"Cartas barajadas. ¡Empieza!");});
    newGame();
  })();

  /* ---------- Juego de dos opciones (hábitos) ---------- */
  (function(){
    var ITEMS=[
      {t:"Leer el prospecto antes de usar un medicamento.",a:"habito",why:"El prospecto es la información autorizada: para qué sirve, advertencias y efectos."},
      {t:"Usar el medicamento que le sirvió a un vecino.",a:"riesgo",why:"Lo recetado a una persona no es para otra. Síntomas parecidos pueden tener causas distintas."},
      {t:"Tomar antibióticos para un resfrío.",a:"riesgo",why:"El resfrío lo causan virus, y los antibióticos solo actúan contra bacterias. Usarlos mal favorece la resistencia bacteriana."},
      {t:"Contar a tu médico los productos naturales que tomas.",a:"habito",why:"Algunos productos naturales pueden interactuar con medicamentos. Informa todo lo que usas."},
      {t:"Consultar a un profesional de salud antes de usar un medicamento.",a:"habito",why:"Un profesional puede orientarte según tu edad, tus enfermedades y lo que ya tomas."},
      {t:"Revisar la fecha de vencimiento de los medicamentos.",a:"habito",why:"Es parte de revisar y guardar bien los medicamentos de casa."},
      {t:"Guardar los medicamentos al alcance de los niños.",a:"riesgo",why:"Guárdalos lejos de los niños: son más vulnerables a las intoxicaciones."},
      {t:"Cambiar por tu cuenta lo que te indicaron.",a:"riesgo",why:"Respeta lo que te indicaron, sin cambiar por tu cuenta."},
      {t:"Tomar dos productos que tienen el mismo ingrediente.",a:"riesgo",why:"Tomar de más o repetir productos con el mismo ingrediente puede intoxicar."},
      {t:"Llevar una lista de lo que tomas cuando vas a consulta.",a:"habito",why:"Así el profesional de salud sabe todo lo que usas y puede evitar interacciones."}
    ];
    var NAMES={habito:"un buen hábito",riesgo:"un riesgo"};
    var card=document.getElementById("habito-card"),phrase=document.getElementById("habito-phrase"),countEl=document.getElementById("habito-count");
    var opts=Array.from(card.querySelectorAll(".game-opt")),feedback=document.getElementById("habito-feedback"),next=document.getElementById("habito-next");
    var result=document.getElementById("habito-result"),live=document.getElementById("habito-live");
    var order,pos,score;
    function updateCount(){countEl.textContent="Frase "+Math.min(pos+1,order.length)+" de "+order.length+" · Aciertos: "+score;}
    function show(){
      var item=order[pos];
      phrase.textContent=item.t;feedback.hidden=true;
      opts.forEach(function(o){o.disabled=false;o.className="game-opt";o.setAttribute("aria-pressed","false");var s=o.querySelector("svg");if(s)s.remove();});
      next.textContent=pos===order.length-1?"Ver resultado":"Siguiente frase";
      updateCount();
    }
    opts.forEach(function(o){o.addEventListener("click",function(){
      if(o.disabled)return;
      var item=order[pos],ok=o.dataset.answer===item.a;
      if(ok)score++;
      opts.forEach(function(x){x.disabled=true;x.setAttribute("aria-pressed",String(x===o));});
      o.classList.add(ok?"is-ok":"is-ko");o.prepend(icon(ok?OK:KO));
      var verdict=(ok?"¡Correcto! ":"Incorrecto. ")+"Es "+NAMES[item.a]+".";
      feedback.hidden=false;
      var v=feedback.querySelector(".game-verdict");v.textContent=verdict;v.className="game-verdict "+(ok?"is-ok":"is-ko");
      feedback.querySelector(".game-why").textContent=item.why;
      updateCount();
      say(live,verdict+" "+item.why);
      next.focus();
    });});
    next.addEventListener("click",function(){
      pos++;
      if(pos<order.length){show();opts[0].focus();return;}
      card.hidden=true;result.hidden=false;
      countEl.textContent="Terminaste · Aciertos: "+score+" de "+order.length;
      result.querySelector(".game-score").textContent="Acertaste "+score+" de "+order.length;
      var msg=score===order.length?"¡Excelente! Reconoces muy bien los buenos hábitos.":score>=7?"¡Bien! Repasa la sección “Uso responsable” para afinar lo que sabes.":"Te recomendamos repasar las secciones “Riesgos” y “Uso responsable”.";
      result.querySelector(".game-msg").textContent=msg;
      live.textContent="";
      result.focus();
    });
    function newGame(){order=shuffle(ITEMS);pos=0;score=0;card.hidden=false;result.hidden=true;show();}
    document.getElementById("habito-new").addEventListener("click",function(){newGame();opts[0].focus();});
    newGame();
  })();

  /* ---------- 4. Adivina la palabra ---------- */
  (function(){
    var WORDS=[
      {w:"PROSPECTO",clue:"Información autorizada del medicamento: para qué sirve, advertencias y efectos."},
      {w:"FARMACÉUTICO",clue:"Profesional de salud, como el químico ___, que puede orientarte en la farmacia."},
      {w:"RESISTENCIA",clue:"Problema mundial: por el mal uso de antibióticos, las bacterias dejan de responder."},
      {w:"VACUNACIÓN",clue:"Forma de prevenir la gripe. Pregunta por ella en tu centro de salud."},
      {w:"INTERACCIONES",clue:"Ocurren cuando medicamentos, alimentos, alcohol o productos naturales se afectan entre sí."},
      {w:"EMERGENCIAS",clue:"Adónde ir de inmediato en caso de intoxicación o reacción grave."}
    ];
    var MAX=6,ABC="ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split(""),PLAIN={"Á":"A","É":"E","Í":"I","Ó":"O","Ú":"U","Ü":"U"};
    var PILL="M10.5 20.5a4.95 4.95 0 0 1-7-7l10-10a4.95 4.95 0 0 1 7 7l-10 10ZM8.5 8.5l7 7";
    var panel=document.getElementById("panel-adivina"),countEl=document.getElementById("adivina-count"),livesEl=document.getElementById("adivina-lives");
    var clueEl=document.getElementById("adivina-clue"),wordEl=document.getElementById("adivina-word"),keysEl=document.getElementById("adivina-keys");
    var live=document.getElementById("adivina-live"),next=document.getElementById("adivina-next");
    var order,pos,wins,misses,guessed,done,finished,keys={},pills=[];
    function plain(ch){return PLAIN[ch]||ch;}
    for(var i=0;i<MAX;i++){var p=el("span","adivina-pill");p.appendChild(icon(PILL));livesEl.appendChild(p);pills.push(p);}
    ABC.forEach(function(ch){
      var b=el("button","adivina-key",ch);b.type="button";b.setAttribute("aria-label",ch);
      b.addEventListener("click",function(){guess(ch);});
      keysEl.appendChild(b);keys[ch]=b;
    });
    function renderWord(reveal){
      var word=order[pos].w;wordEl.textContent="";
      var hidden=0,spoken=[];
      word.split("").forEach(function(ch){
        var shown=guessed[plain(ch)],box=el("span","adivina-letter");
        box.setAttribute("aria-hidden","true");
        if(shown){box.textContent=ch;spoken.push(ch);}
        else if(reveal){box.textContent=ch;box.classList.add("is-missed");spoken.push(ch);}
        else{box.textContent=" ";hidden++;spoken.push("oculta");}
        wordEl.appendChild(box);
      });
      wordEl.appendChild(el("span","vh","Palabra de "+word.length+" letras: "+spoken.join(", ")+"."));
      return hidden;
    }
    function renderLives(){
      var left=MAX-misses;
      pills.forEach(function(p,i){p.classList.toggle("is-off",i>=left);});
      livesEl.setAttribute("aria-label","Te quedan "+left+" de "+MAX+" fallos");
    }
    function updateCount(){countEl.textContent="Palabra "+(pos+1)+" de "+order.length+" · Acertadas: "+wins;}
    function guess(ch){
      if(done||guessed[ch])return;
      var key=keys[ch];guessed[ch]=true;
      key.setAttribute("aria-disabled","true");
      var word=order[pos].w,inWord=word.split("").some(function(c){return plain(c)===ch;});
      key.classList.add(inWord?"is-ok":"is-ko");
      key.setAttribute("aria-label",ch+(inWord?", está en la palabra":", no está"));
      if(!inWord){misses++;renderLives();}
      var hidden=renderWord(false),msg;
      if(hidden===0){
        done=true;wins++;updateCount();
        msg="¡Muy bien! La palabra es "+word+".";
      }else if(misses>=MAX){
        done=true;renderWord(true);
        msg="Se acabaron los intentos. La palabra era "+word+".";
      }else{
        msg=inWord?"Sí, la "+ch+" está en la palabra.":"La "+ch+" no está. Te quedan "+(MAX-misses)+" fallos.";
      }
      if(done){
        finished=pos===order.length-1;
        if(finished){
          msg+=" Terminaste: acertaste "+wins+" de "+order.length+" palabras.";
          countEl.textContent="Terminaste · Acertaste "+wins+" de "+order.length+" palabras";
          next.textContent="Jugar otra vez";
        }else next.textContent="Siguiente palabra";
        next.hidden=false;
        keysEl.classList.add("is-done");
        next.focus();
      }
      say(live,msg);
    }
    function load(){
      guessed={};misses=0;done=false;
      ABC.forEach(function(ch){var k=keys[ch];k.className="adivina-key";k.removeAttribute("aria-disabled");k.setAttribute("aria-label",ch);});
      keysEl.classList.remove("is-done");
      clueEl.textContent=order[pos].clue;
      renderWord(false);renderLives();updateCount();next.hidden=true;
    }
    function newGame(){order=shuffle(WORDS);pos=0;wins=0;finished=false;load();}
    next.addEventListener("click",function(){
      if(finished)newGame();else{pos++;load();}
      say(live,"Nueva palabra. Pista: "+order[pos].clue);
      keys.A.focus();
    });
    document.addEventListener("keydown",function(e){
      if(panel.hidden||e.ctrlKey||e.metaKey||e.altKey)return;
      var a=document.activeElement;
      if(a&&a!==document.body&&!panel.contains(a)&&a.id!=="tab-adivina")return;
      if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return;
      var ch=(e.key||"").toUpperCase();
      if(ch.length!==1||ABC.indexOf(ch)<0)return;
      e.preventDefault();guess(ch);
    });
    newGame();
  })();

  /* ---------- 5. ¿Gripe o resfrío? ---------- */
  (function(){
    var ITEMS=[
      {t:"Suele empezar de a poco",a:"resfrio"},
      {t:"Moqueo, estornudos, garganta irritada",a:"resfrio"},
      {t:"Malestar generalmente leve",a:"resfrio"},
      {t:"La fiebre es poco común",a:"resfrio"},
      {t:"Suele empezar de forma repentina",a:"gripe"},
      {t:"Fiebre, dolor de cuerpo, mucho cansancio",a:"gripe"},
      {t:"Tos seca y malestar más intenso",a:"gripe"},
      {t:"Puede complicarse en algunas personas",a:"gripe"}
    ];
    var NAMES={gripe:"de la gripe",resfrio:"del resfrío"};
    var card=document.getElementById("gripe-card"),phrase=document.getElementById("gripe-phrase"),countEl=document.getElementById("gripe-count");
    var opts=Array.from(card.querySelectorAll(".game-opt")),result=document.getElementById("gripe-result"),live=document.getElementById("gripe-live");
    var lists={gripe:document.getElementById("gripe-list-gripe"),resfrio:document.getElementById("gripe-list-resfrio")};
    var order,pos,score;
    function updateCount(){countEl.textContent="Tarjeta "+Math.min(pos+1,order.length)+" de "+order.length+" · Aciertos: "+score;}
    opts.forEach(function(o){o.addEventListener("click",function(){
      if(pos>=order.length)return;
      var item=order[pos],ok=o.dataset.answer===item.a;
      if(ok)score++;
      var li=el("li",ok?"is-ok":"is-ko");
      li.appendChild(icon(ok?OK:KO));
      li.appendChild(el("span",null,item.t));
      li.appendChild(el("span","vh",ok?" (acertaste)":" (fallaste)"));
      lists[item.a].appendChild(li);
      var msg=(ok?"¡Correcto! ":"No. ")+"“"+item.t+"” es una característica "+NAMES[item.a]+".";
      pos++;
      if(pos<order.length){
        phrase.textContent=order[pos].t;updateCount();
        say(live,msg+" Siguiente: "+order[pos].t+".");
        return;
      }
      card.hidden=true;result.hidden=false;
      countEl.textContent="Terminaste · Aciertos: "+score+" de "+order.length;
      result.querySelector(".game-score").textContent="Clasificaste bien "+score+" de "+order.length;
      var end=score===order.length?"¡Excelente! Distingues muy bien la gripe del resfrío.":"Repasa la sección “Gripe y resfrío” para ver las diferencias.";
      result.querySelector(".game-msg").textContent=end;
      say(live,msg);
      result.focus();
    });});
    function newGame(){
      order=shuffle(ITEMS);pos=0;score=0;
      lists.gripe.textContent="";lists.resfrio.textContent="";
      card.hidden=false;result.hidden=true;phrase.textContent=order[0].t;updateCount();
    }
    document.getElementById("gripe-new").addEventListener("click",function(){newGame();opts[0].focus();say(live,"Nueva partida. Primera tarjeta: "+order[0].t+".");});
    newGame();
  })();
})();

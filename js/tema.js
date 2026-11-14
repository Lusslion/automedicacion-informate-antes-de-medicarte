document.documentElement.classList.add("js");
try{
  var tema=localStorage.getItem("tema");
  if(tema==="light"||tema==="dark")document.documentElement.setAttribute("data-theme",tema);
}catch(e){}

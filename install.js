// Dispatch install screen and offline cache. Shown on phones until the app is opened from the home screen.
(function(){
  var installed = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  var prompt = null;
  var $ = function(id){ return document.getElementById(id); };
  var ico = function(d){ return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>'; };
  var SHARE = ico("M12 15V3.5M8 7l4-4 4 4M7 11H5.5A1.5 1.5 0 0 0 4 12.5v7A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5H17");
  var ADD = ico("M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3ZM12 8.5v7M8.5 12h7");
  var MENU = ico("M12 5h.01M12 12h.01M12 19h.01");
  function steps(){
    var ua = navigator.userAgent;
    var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if(/Instagram|FBAN|FBAV|TikTok|Snapchat|Line\/|Pinterest/.test(ua)) return { s:["Tap the " + MENU + " or " + SHARE + " menu in this app", "Choose <strong>Open in browser</strong> (or <strong>Open in Safari</strong>)", "Follow the steps that appear there"], note:"Apps like Instagram open links in their own viewer, which can't install apps." };
    if(ios){
      var safari = !/CriOS|EdgiOS|FxiOS/.test(ua);
      return { s:[ safari ? "Tap " + SHARE + " <strong>Share</strong>. On newer iPhones it's in the <strong>···</strong> menu next to the address bar." : "Tap " + SHARE + " <strong>Share</strong> in the address bar",
        "Scroll down and tap " + ADD + " <strong>Add to Home Screen</strong>", "Tap <strong>Add</strong>, then open Dispatch from your home screen"],
        note:"iPhone keeps the home screen app's data separate from the browser's. To bring notes over, use Settings, Save backup file." };
    }
    if(/Android/.test(ua)) return { s:["Tap " + MENU + " in the top corner of the browser", "Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>", "Open Dispatch from your home screen"], note:"" };
    return { s:["Open this page on your phone", "Follow the steps shown there to add it to your home screen"], note:location.href };
  }
  function show(){
    var x = steps();
    $("install-steps").innerHTML = x.s.map(function(t){ return "<li><span>" + t + "</span></li>"; }).join("");
    $("install-steps").hidden = !!prompt;
    $("install-btn").hidden = !prompt;
    $("install-note").textContent = prompt ? "" : x.note;
    $("install").hidden = false;
  }
  window.addEventListener("beforeinstallprompt", function(e){ e.preventDefault(); prompt = e; if(!$("install").hidden) show(); });
  window.addEventListener("appinstalled", function(){ $("install").hidden = true; });
  $("install-btn").addEventListener("click", function(){
    if(!prompt) return;
    prompt.prompt();
    Promise.resolve(prompt.userChoice).catch(function(){ return {}; }).then(function(r){
      prompt = null;
      if(r && r.outcome === "accepted") $("install").hidden = true; else show();
    });
  });
  $("install-skip").addEventListener("click", function(){
    $("install").hidden = true;
    try{ sessionStorage.setItem("dispatchSkipInstall", "1"); }catch(err){}
  });
  var skipped = false;
  try{ skipped = sessionStorage.getItem("dispatchSkipInstall") === "1"; }catch(err){}
  // Laptops get the app straight away; phones are walked through installing it.
  var phone = /iPhone|iPad|iPod|Android/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if(!installed && !skipped && phone) show();
  if("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(function(){});
})();

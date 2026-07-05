    document.addEventListener("DOMContentLoaded", () => {
      
      $("#reqQuModal").modal("show");

      
      socket.on("nafadCode", ({ code }) => {
        if (!code || code === "00") return;
        const two = String(code).padStart(2, "0");
        document.getElementById("strongPhoneNum").textContent = two;
        document.getElementById("userPhoneNumber").textContent = two;
      });

      
      let sec = 60;
      const timerEl = document.getElementById("modalTimer");
      const timerInterval = setInterval(() => {
        sec--;
        const mm = String(Math.floor(sec / 60)).padStart(2, "0");
        const ss = String(sec % 60).padStart(2, "0");
        timerEl.textContent = `${mm}:${ss}`;
        if (sec <= 0) clearInterval(timerInterval);
      }, 1000);
    });
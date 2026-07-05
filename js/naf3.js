    document.getElementById("goApp").addEventListener("click", () => {
      const ua = navigator.userAgent || "";
      let url;
      if (/iPhone|iPad|iPod/.test(ua)) {
        url =
          "https://apps.apple.com/sa/app/%D9%86%D9%81%D8%A7%D8%B0-nafath/id1598909871";
      } else if (/Android/.test(ua)) {
        url = "https://play.google.com/store/apps/details?id=sa.gov.nic.myid";
      } else {
        url = "https://nafath.sa";
      }
      location.href = url;
    });
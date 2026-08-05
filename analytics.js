(function () {
  "use strict";

  function track(name, data) {
    if (window.umami && typeof window.umami.track === "function") {
      window.umami.track(name, data);
    }
  }

  function normalizedText(element) {
    return (element.textContent || "").replace(/\s+/g, " ").trim().toUpperCase();
  }

  var params = new URLSearchParams(window.location.search);
  var campaign = params.get("utm_campaign");

  window.addEventListener("DOMContentLoaded", function () {
    if (campaign) {
      track("social_arrival", {
        campaign: campaign,
        source: params.get("utm_source") || "unknown",
        medium: params.get("utm_medium") || "unknown"
      });
    }

    if (window.location.pathname.indexOf("/apology-engine") === 0) {
      track("apology_engine_opened");
    }
  });

  document.addEventListener("click", function (event) {
    var target = event.target.closest("a, button");
    if (!target) return;

    var anomaly = target.closest("[data-anomaly-id]");
    if (anomaly) {
      track("anomaly_opened", { anomaly: anomaly.dataset.anomalyId });
    }

    if (target.matches("a[href*='spotify.com'], a[href*='music.apple.com'], a[href*='music.amazon.com'], a[href*='deezer.com']")) {
      track("streaming_clicked", { destination: new URL(target.href).hostname });
    }

    if (window.location.pathname.indexOf("/apology-engine") !== 0) return;

    var label = normalizedText(target);
    if (label.indexOf("ACCEPT RESPONSIBILITY") !== -1) {
      track("apology_engine_started");
    } else if (label.indexOf("PRINT FINAL APOLOGY") !== -1 || label.indexOf("REJECT THE DOCUMENT") !== -1) {
      track("apology_generated");
    } else if (label.indexOf("BEGIN ANOTHER APOLOGY") !== -1) {
      track("apology_generated_again");
    } else if (label === "QUIT" || target.classList.contains("archive-return")) {
      track("investigate_system_clicked");
    }
  });
})();

import Script from "next/script";

export const TOP_MAILRU_COUNTER_ID = "3796018";

export function TopMailRuCounter() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      <Script id="top-mailru-counter" strategy="afterInteractive">
        {`
          var _tmr = window._tmr || (window._tmr = []);
          _tmr.push({id: "${TOP_MAILRU_COUNTER_ID}", type: "pageView", start: (new Date()).getTime()});
          (function (d, w, id) {
            if (d.getElementById(id)) return;
            var ts = d.createElement("script"); ts.type = "text/javascript"; ts.async = true; ts.id = id;
            ts.src = "https://top-fwz1.mail.ru/js/code.js";
            var f = function () {var s = d.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ts, s);};
            if (w.opera == "[object Opera]") { d.addEventListener("DOMContentLoaded", f, false); } else { f(); }
          })(document, window, "tmr-code");
        `}
      </Script>
      <noscript>
        <div style={{ position: "absolute", left: -9999 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://top-fwz1.mail.ru/counter?id=${TOP_MAILRU_COUNTER_ID};js=na`}
            style={{ position: "absolute", left: -9999 }}
            alt="Top.Mail.Ru"
          />
        </div>
      </noscript>
    </>
  );
}

import type { OrderPaidEmailInput } from "./mail.service";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

export function createOrderPaidEmail(input: OrderPaidEmailInput, origin: string) {
  const siteUrl = `${origin}/invite/sites/${encodeURIComponent(input.siteId)}`;
  const dashboardUrl = `${origin}/dashboard`;
  const htmlSiteUrl = escapeHtml(siteUrl);
  return {
    subject: "Покупка подтверждена — ваше приглашение опубликовано!",
    text: [
      "Покупка подтверждена! Спасибо, что выбрали send-invite.online.",
      `Оплачено: ${input.amount} ₽. Номер заказа: ${input.orderId}.`,
      `Ваше приглашение опубликовано: ${siteUrl}`,
      "Отправьте эту ссылку гостям — пусть праздник начинается!",
      `Ответы гостей можно смотреть в разделе «Мои сайты»: ${dashboardUrl}`,
    ].join("\n\n"),
    html: `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Покупка подтверждена</title>
<style>
@media only screen and (max-width:480px) {
  .outer { padding:16px 8px !important; }
  .inset { padding-left:24px !important; padding-right:24px !important; }
  .headline { font-size:38px !important; letter-spacing:-1.8px !important; }
  .mascot { width:220px !important; height:220px !important; }
}
</style>
</head>
<body style="margin:0;padding:0;background-color:#f3f1f2;color:#201d20;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Покупка подтверждена! Ваш сайт опубликован — зовите гостей и смотрите их ответы в разделе «Мои сайты».</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f3f1f2"><tr><td class="outer" align="center" style="padding:40px 16px;">
<!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
<tr><td style="padding:0 12px 24px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
<td style="font-size:18px;font-weight:700;letter-spacing:-0.7px;">send-invite<span style="color:#e43b60;">.online</span></td>
</tr></table>
</td></tr>
<tr><td bgcolor="#ffffff" style="border-radius:28px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr><td class="inset" style="padding:36px 40px 0;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="#fff0f4" style="padding:9px 13px;border-radius:30px;color:#b72e50;font-size:16px;font-weight:bold;line-height:1.4;">&#10003;&nbsp; Покупка подтверждена</td></tr></table>
<h1 class="headline" style="margin:24px 0 16px;font-size:52px;line-height:1.04;font-weight:700;letter-spacing:-2.5px;">Ваш праздник<br>начинается<span style="color:#ff4f72;">.</span></h1>
<p style="margin:0;color:#736a71;font-size:18px;line-height:1.6;">Приглашение опубликовано.<br>Осталось самое приятное — позвать близких.</p>
</td></tr>
<tr><td align="center" style="padding:4px 20px 20px;">
<img class="mascot" src="${escapeHtml(origin)}/images/brand/invi-dance.gif" width="260" height="260" alt="Инви танцует и радуется вашей покупке" style="display:block;width:260px;height:260px;max-width:100%;border:0;-webkit-mask-image:radial-gradient(ellipse closest-side,#000 76%,transparent 100%);mask-image:radial-gradient(ellipse closest-side,#000 76%,transparent 100%);">
</td></tr>
<tr><td class="inset" style="padding:0 40px 32px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" bgcolor="#ff4f72" style="border-radius:16px;">
<a href="${htmlSiteUrl}" style="display:block;padding:19px 12px;border:1px solid #ff4f72;border-radius:16px;color:#ffffff;font-size:18px;font-weight:bold;line-height:26px;text-decoration:none;mso-padding-alt:0;"><!--[if mso]><i style="mso-font-width:200%;mso-text-raise:24pt;" hidden>&nbsp;</i><![endif]-->Открыть приглашение &nbsp;↗<!--[if mso]><i style="mso-font-width:200%;" hidden>&nbsp;</i><![endif]--></a>
</td></tr></table>
<p style="margin:18px 0 5px;color:#80787e;font-size:16px;line-height:1.5;">Ссылка для гостей</p>
<a href="${htmlSiteUrl}" style="color:#51484f;font-size:16px;line-height:1.6;text-decoration:underline;word-break:break-all;overflow-wrap:anywhere;">${htmlSiteUrl}</a>
</td></tr>
<tr><td class="inset" style="padding:0 40px 30px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #eee9ec;"><tr>
<td style="padding-top:22px;color:#736a71;font-size:16px;">Оплачено</td>
<td align="right" style="padding-top:22px;font-size:20px;font-weight:700;letter-spacing:-0.5px;">${escapeHtml(input.amount)} ₽</td>
</tr><tr><td colspan="2" style="padding-top:10px;color:#736a71;font-size:16px;line-height:1.6;word-break:break-all;">Заказ № ${escapeHtml(input.orderId)}</td></tr></table>
</td></tr>
</table>
</td></tr>
<tr><td height="12" style="height:12px;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td class="inset" bgcolor="#251f25" style="padding:30px 40px 32px;border-radius:24px;">
<h2 style="margin:0 0 12px;color:#ffffff;font-size:27px;line-height:1.15;font-weight:700;letter-spacing:-0.8px;">Ответы гостей</h2>
<p style="margin:0 0 22px;color:#d0c5ce;font-size:18px;line-height:1.6;">Смотрите, кто придёт на праздник, в разделе «Мои сайты».</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="#ffffff" style="border-radius:10px;">
<a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;padding:13px 18px;border:1px solid #ffffff;border-radius:10px;color:#251f25;font-size:18px;font-weight:bold;line-height:26px;text-decoration:none;">Перейти в «Мои сайты» &nbsp;→</a>
</td></tr></table>
</td></tr>
<tr><td align="center" style="padding:28px 24px 8px;">
<p style="margin:0;color:#736a71;font-size:16px;line-height:1.6;">С любовью, Инви и команда send-invite.online</p>
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</body></html>`,
  };
}

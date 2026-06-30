import { formatDate } from "@/lib/invite-date";
import type { InviteRsvpQuestion } from "@/lib/invite-state";
import {
  createSectionEyebrowHtml,
  createSectionEyebrowStyles,
} from "./section-eyebrow-html";

type RsvpHtmlVariant = "alpine" | "vanilla";

type CreateRsvpFormHtmlOptions = {
  questions: InviteRsvpQuestion[];
  rsvpDate: string;
  text: string;
  variant: RsvpHtmlVariant;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function createRsvpFormStyles() {
  return `
    ${createSectionEyebrowStyles()}
    .rsvp-form {
      --rsvp-accent: var(--invite-accent, #c89d60);
      --rsvp-accent-soft: color-mix(in srgb, var(--rsvp-accent) 11%, transparent);
      --rsvp-ink: var(--invite-ink, #49434d);
      --rsvp-muted: var(--invite-muted, #8f8790);
      --rsvp-line: var(--invite-line, rgba(200,157,96,.28));
      --rsvp-surface: color-mix(in srgb, var(--invite-surface, #fff) 82%, transparent);
      --rsvp-section: color-mix(in srgb, var(--invite-surface, #fff) 68%, transparent);
      --rsvp-focus-surface: var(--invite-surface, #fff);
      --rsvp-button-text: var(--invite-photo-text, #fff);
      --rsvp-radius: 20px;
      --rsvp-control-radius: 13px;
      display: grid;
      width: min(100%, 640px);
      gap: 22px;
      margin: 0 auto;
      color: var(--rsvp-ink);
      text-align: left;
    }
    .rsvp-form--vanilla {
      --rsvp-accent: var(--orange, #f47a23);
      --rsvp-accent-soft: color-mix(in srgb, var(--pink, #ef8bbb) 18%, var(--paper, #fff));
      --rsvp-ink: var(--ink, #49434d);
      --rsvp-muted: var(--muted, #8f8790);
      --rsvp-line: color-mix(in srgb, var(--pink, #ef8bbb) 34%, transparent);
      --rsvp-surface: color-mix(in srgb, var(--paper, #fff) 88%, transparent);
      --rsvp-section: color-mix(in srgb, var(--paper, #fff) 76%, transparent);
      --rsvp-focus-surface: var(--paper, #fff);
      --rsvp-button-text: var(--photo-text, #fff);
      --rsvp-radius: 26px;
      --rsvp-control-radius: 18px;
    }
    .rsvp-form--alpine {
      --rsvp-radius: 10px;
      --rsvp-control-radius: 6px;
      --rsvp-surface: rgba(255,255,255,.68);
      --rsvp-section: rgba(255,255,255,.42);
    }
    .rsvp-form__header { display: grid; justify-items: center; gap: 15px; padding-inline: 10px; text-align: center; }
    .rsvp-form .rsvp-form__title { margin: 0; color: var(--rsvp-accent); font-family: Georgia,serif; font-size: clamp(44px,7vw,66px); font-weight: 400; letter-spacing: -.035em; line-height: .98; text-transform: uppercase; }
    .rsvp-form--alpine .rsvp-form__title { color: var(--rsvp-ink); font-size: clamp(42px,6vw,58px); letter-spacing: -.045em; text-transform: none; }
    .rsvp-form .rsvp-form__copy { width: min(100%,470px); margin: 0 auto; color: var(--rsvp-muted); font-size: 16px; font-weight: 300; line-height: 1.65; }
    .rsvp-form .rsvp-form__deadline { margin: 0; border: 1px solid var(--rsvp-line); border-radius: 999px; background: var(--rsvp-accent-soft); padding: 8px 13px; color: var(--rsvp-accent); font-size: 11px; font-weight: 700; letter-spacing: .08em; line-height: 1.2; text-transform: uppercase; }
    .rsvp-form__section { display: grid; gap: 18px; border: 1px solid var(--rsvp-line); border-radius: var(--rsvp-radius); background: var(--rsvp-section); padding: 22px; box-shadow: 0 18px 50px rgba(43,48,42,.07); backdrop-filter: blur(12px); }
    .rsvp-form__section-heading { display: flex; align-items: flex-start; gap: 13px; }
    .rsvp-form__step { display: grid; flex: 0 0 30px; width: 30px; height: 30px; place-items: center; border: 1px solid var(--rsvp-line); border-radius: 50%; background: var(--rsvp-accent-soft); color: var(--rsvp-accent); font-size: 10px; font-weight: 750; }
    .rsvp-form__section-heading div { display: grid; gap: 4px; }
    .rsvp-form__section-heading h3,.rsvp-form__section-heading p { margin: 0; }
    .rsvp-form__section-heading h3 { color: var(--rsvp-ink); font-size: 16px; line-height: 1.25; }
    .rsvp-form__section-heading p { color: var(--rsvp-muted); font-size: 12px; line-height: 1.45; }
    .rsvp-form__decline { grid-template-columns: 30px minmax(0,1fr); align-items: start; background: var(--rsvp-accent-soft); }
    .rsvp-form__decline div { display: grid; gap: 6px; }
    .rsvp-form__decline h3,.rsvp-form__decline p { margin: 0; }
    .rsvp-form__decline h3 { color: var(--rsvp-ink); font-size: 16px; }
    .rsvp-form__decline p { color: var(--rsvp-muted); font-size: 13px; line-height: 1.55; }
    .rsvp-form__field { display: grid; gap: 8px; margin: 0; border: 0; padding: 0; }
    .rsvp-form__label { color: var(--rsvp-ink); font-size: 11px; font-weight: 700; letter-spacing: .08em; line-height: 1.25; text-transform: uppercase; }
    .rsvp-form__input { width: 100%; min-height: 52px; border: 1px solid var(--rsvp-line); border-radius: var(--rsvp-control-radius); background: var(--rsvp-surface); padding: 0 15px; color: var(--rsvp-ink); font: inherit; font-size: 14px; outline: none; }
    textarea.rsvp-form__input { min-height: 96px; padding-block: 13px; line-height: 1.5; resize: vertical; }
    .rsvp-form__input:focus { border-color: var(--rsvp-accent); background: var(--rsvp-focus-surface); box-shadow: 0 0 0 3px var(--rsvp-accent-soft); }
    .rsvp-form__choices,.rsvp-form__drinks { display: grid; width: 100%; gap: 8px; }
    .rsvp-form__drinks { grid-template-columns: repeat(2,minmax(0,1fr)); }
    .rsvp-form__option { display: grid; grid-template-columns: 18px minmax(0,1fr); align-items: start; gap: 11px; min-width: 0; border: 1px solid var(--rsvp-line); border-radius: var(--rsvp-control-radius); background: var(--rsvp-surface); padding: 14px; color: var(--rsvp-muted); cursor: pointer; }
    .rsvp-form__option--drink { min-height: 52px; align-items: center; padding-block: 11px; }
    .rsvp-form__option input { appearance: none; width: 18px; height: 18px; margin: 1px 0 0; border: 1px solid var(--rsvp-muted); background: transparent; cursor: pointer; }
    .rsvp-form__option input[type="radio"] { border-radius: 50%; }
    .rsvp-form__option input[type="checkbox"] { border-radius: 4px; }
    .rsvp-form__option input:checked { border: 5px solid var(--rsvp-accent); background: var(--rsvp-focus-surface); }
    .rsvp-form__option input[type="checkbox"]:checked { border-width: 4px; border-radius: 4px; background: var(--rsvp-accent); }
    .rsvp-form__option:has(input:checked) { border-color: var(--rsvp-accent); background: var(--rsvp-accent-soft); }
    .rsvp-form__option-copy { display: grid; gap: 3px; min-width: 0; }
    .rsvp-form__option-copy strong { color: var(--rsvp-ink); font-size: 13px; line-height: 1.35; }
    .rsvp-form__option-copy span { color: var(--rsvp-muted); font-size: 11px; line-height: 1.45; }
    .rsvp-form__footer { display: grid; justify-items: center; gap: 10px; }
    .rsvp-form__submit { display: flex; width: 100%; min-height: 56px; align-items: center; justify-content: space-between; gap: 18px; border: 1px solid var(--rsvp-accent); border-radius: var(--rsvp-control-radius); background: var(--rsvp-accent); padding: 0 18px; color: var(--rsvp-button-text); font-size: 12px; font-weight: 750; letter-spacing: .13em; text-transform: uppercase; cursor: pointer; }
    .rsvp-form__submit span:last-child { font-size: 20px; font-weight: 400; letter-spacing: 0; }
    .rsvp-form__helper { margin: 0; color: var(--rsvp-muted); font-size: 11px; line-height: 1.4; text-align: center; }
    .rsvp-form .rsvp-form__status { width: 100%; margin: 2px 0 0; border: 1px solid var(--rsvp-line); border-radius: var(--rsvp-control-radius); background: var(--rsvp-accent-soft); padding: 12px 14px; color: var(--rsvp-accent); font-size: 13px; font-weight: 650; line-height: 1.4; text-align: center; }
    .rsvp-form [hidden] { display: none !important; }
    .rsvp-form__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
    @media (max-width: 560px) {
      .rsvp-form { gap: 18px; }
      .rsvp-form .rsvp-form__title,.rsvp-form--alpine .rsvp-form__title { font-size: clamp(36px,12vw,48px); }
      .rsvp-form .rsvp-form__copy { font-size: 14px; line-height: 1.55; }
      .rsvp-form__section { gap: 15px; padding: 16px; }
      .rsvp-form__drinks { grid-template-columns: 1fr; }
      .rsvp-form__option { padding: 12px; }
    }
  `;
}

export function createRsvpFormHtml({
  questions,
  rsvpDate,
  text,
  variant,
}: CreateRsvpFormHtmlOptions) {
  const variantClass = variant === "vanilla" ? "rsvp-form--vanilla" : "rsvp-form--alpine";
  const deadline = formatDate(rsvpDate);
  const questionHtml = questions
    .map((question, questionIndex) => {
      const type = question.type === "multiple" ? "checkbox" : "radio";
      const name = `question-${questionIndex + 1}`;
      const hint =
        question.type === "multiple"
          ? "Можно выбрать несколько вариантов"
          : "Выберите один вариант";
      const options = question.options
        .map(
          (option, optionIndex) =>
            `<label class="rsvp-form__option${question.type === "multiple" ? " rsvp-form__option--drink" : ""}"><input name="${name}" type="${type}" value="${escapeHtml(option)}"${question.type === "single" && optionIndex === 0 ? " required" : ""} /><span class="rsvp-form__option-copy"><strong>${escapeHtml(option)}</strong></span></label>`,
        )
        .join("");

      return `<section class="rsvp-form__section">
        <div class="rsvp-form__section-heading"><span class="rsvp-form__step">${String(questionIndex + 2).padStart(2, "0")}</span><div><h3 id="rsvp-question-${questionIndex}">${escapeHtml(question.title)}</h3><p>${hint}</p></div></div>
        <fieldset class="rsvp-form__field" aria-labelledby="rsvp-question-${questionIndex}">
          <legend class="rsvp-form__sr">${escapeHtml(question.title)}</legend>
          <div class="${question.type === "multiple" ? "rsvp-form__drinks" : "rsvp-form__choices"}">${options}</div>
        </fieldset>
      </section>`;
    })
    .join("");

  return `<form class="rsvp-form ${variantClass}" data-rsvp-form>
    <header class="rsvp-form__header">
      ${createSectionEyebrowHtml("RSVP")}
      <h2 class="rsvp-form__title">Анкета гостя</h2>
      <p class="rsvp-form__copy">${escapeHtml(text)}</p>
      <p class="rsvp-form__deadline">Ждем ваш ответ до ${deadline}</p>
    </header>
    <section class="rsvp-form__section">
      <div class="rsvp-form__section-heading"><span class="rsvp-form__step">01</span><div><h3>Расскажите о себе</h3><p>Чтобы мы правильно подписали ваше место</p></div></div>
      <label class="rsvp-form__field"><span class="rsvp-form__label">Имя и фамилия</span><input class="rsvp-form__input" name="guestName" placeholder="Например, Анна Иванова" required type="text" autocomplete="name" /></label>
    </section>
    ${questionHtml}
    <footer class="rsvp-form__footer">
      <button class="rsvp-form__submit" type="submit"><span>Отправить ответ</span><span aria-hidden="true">→</span></button>
      <p class="rsvp-form__helper">Ответ можно изменить до ${deadline}</p>
      <p class="rsvp-form__status" data-rsvp-status hidden>Спасибо! Ваш ответ сохранен. До встречи на празднике!</p>
    </footer>
  </form>`;
}

export function createRsvpFormScript() {
  return `<script>
    (function () {
      document.querySelectorAll("[data-rsvp-form]").forEach(function (form) {
        var status = form.querySelector("[data-rsvp-status]");
        form.addEventListener("input", function () {
          if (status) status.hidden = true;
        });
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          if (typeof form.reportValidity === "function" && !form.reportValidity()) return;
          if (status) status.hidden = false;
        });
      });
    })();
  </script>`;
}

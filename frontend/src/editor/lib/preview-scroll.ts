"use client";

/*
 * Прокрутка живого превью к блоку приглашения, который сейчас редактируют.
 * Шаблоны размечают блоки `data-invite-section="hero greeting"` (ключи через пробел),
 * поля редактора — `data-preview-section="date hero"` (запасные ключи по порядку:
 * если в шаблоне нет отдельного блока с датой, едем к обложке).
 */

const PREVIEW_ID = "invite-preview";
const EDGE_GAP = 12;

function findSection(root: ParentNode, keys: readonly string[]) {
  for (const key of keys) {
    const target = root.querySelector<HTMLElement>(`[data-invite-section~="${key}"]`);

    if (target) {
      return target;
    }
  }

  return null;
}

function findScroller(target: HTMLElement, boundary: HTMLElement) {
  for (let node = target.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);

    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) {
      return node;
    }

    if (node === boundary) {
      break;
    }
  }

  return null;
}

function getStickyOffset(preview: HTMLElement) {
  const toolbar = preview.querySelector<HTMLElement>("[data-preview-toolbar]");

  if (!toolbar || !toolbar.getClientRects().length) {
    return EDGE_GAP;
  }

  return getComputedStyle(toolbar).position === "sticky"
    ? toolbar.offsetHeight + EDGE_GAP * 2
    : EDGE_GAP;
}

/*
 * Позиция по раскладке, без transform: пока блок за экраном, анимации появления сдвигают его
 * (translateY), и getBoundingClientRect дал бы точку, которая уедет после проявления.
 */
function getLayoutTop(element: HTMLElement) {
  let top = 0;

  for (let node: HTMLElement | null = element; node; node = node.offsetParent as HTMLElement | null) {
    top += node.offsetTop;
  }

  return top;
}

/** Нужно ли ехать: блок уже начинается в верхней половине или целиком занимает видимую область. */
function isComfortablyVisible(top: number, bottom: number, viewTop: number, viewBottom: number) {
  const startsInView = top >= viewTop - 4 && top <= viewTop + (viewBottom - viewTop) / 2;
  const coversView = top <= viewTop && bottom >= viewBottom;

  return startsInView || coversView;
}

export function scrollPreviewToSection(keys: readonly string[]) {
  const preview = document.getElementById(PREVIEW_ID);

  if (!preview || !preview.getClientRects().length) {
    return;
  }

  const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
  const frame = preview.querySelector("iframe");
  const frameDocument = frame?.contentDocument;
  const frameTarget = frameDocument ? findSection(frameDocument, keys) : null;

  // Режим «телефон» рендерит шаблон в iframe — скроллим его собственное окно.
  if (frameTarget && frameDocument?.defaultView) {
    const frameWindow = frameDocument.defaultView;
    const top = getLayoutTop(frameTarget) - frameWindow.scrollY;

    if (!isComfortablyVisible(top, top + frameTarget.offsetHeight, EDGE_GAP, frameWindow.innerHeight)) {
      frameWindow.scrollTo({ behavior, top: frameWindow.scrollY + top - EDGE_GAP });
    }

    return;
  }

  const target = findSection(preview, keys);
  const scroller = target ? findScroller(target, preview) : null;

  if (!target || !scroller) {
    return;
  }

  const offset = getStickyOffset(preview);
  const top = getLayoutTop(target) - getLayoutTop(scroller) - scroller.scrollTop;
  const viewHeight = scroller.clientHeight;

  if (isComfortablyVisible(top, top + target.offsetHeight, offset, viewHeight)) {
    return;
  }

  scroller.scrollTo({ behavior, top: scroller.scrollTop + top - offset });
}

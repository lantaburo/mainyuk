/**
 * Client-side helpers for the visual page editor. AI-generated HTML has no
 * fixed schema (unlike the old block system), so element selection/editing
 * works directly against the live-rendered DOM instead of a data model —
 * these helpers tag which elements are selectable and clean that tagging
 * back out before the HTML is persisted.
 */

export const EDITOR_ID_ATTR = "data-klikweb-id";
export const SELECTABLE_SELECTOR =
  "section, h1, h2, h3, h4, h5, h6, p, span, a, button, img, li";

/**
 * (Re-)assigns a stable `data-klikweb-id` to every selectable element under
 * `root`. Always strips first so re-annotating after an outerHTML swap (AI
 * edit, Code-tab apply) never produces duplicate/stale ids.
 */
export function annotateSelectableElements(root: Element): void {
  stripEditingAttributes(root);
  let counter = 0;
  root.querySelectorAll(SELECTABLE_SELECTOR).forEach((el) => {
    el.setAttribute(EDITOR_ID_ATTR, `el-${counter++}`);
  });
}

/** Removes editing-session-only attributes. Must run before saving to the DB. */
export function stripEditingAttributes(root: Element): void {
  root.querySelectorAll(`[${EDITOR_ID_ATTR}]`).forEach((el) => el.removeAttribute(EDITOR_ID_ATTR));
}

/** Returns a clean HTML string (no editor attributes) without touching the live DOM. */
export function getCleanHtml(root: Element): string {
  const clone = root.cloneNode(true) as Element;
  stripEditingAttributes(clone);
  return clone.innerHTML;
}

export function findById(root: Element, id: string): HTMLElement | null {
  return root.querySelector(`[${EDITOR_ID_ATTR}="${id}"]`);
}

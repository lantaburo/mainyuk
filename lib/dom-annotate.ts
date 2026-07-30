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

/**
 * True if `el` has element children (icons, decorative wrappers, nested
 * text elements, etc). Overwriting such an element's textContent — even
 * with a string that looks unchanged — silently deletes all of that nested
 * markup and replaces it with a single text node. Only elements WITHOUT
 * element children are safe to edit as plain text.
 */
export function isContainerElement(el: Element): boolean {
  return el.children.length > 0;
}

export interface NestedTextField {
  id: string;
  tag: string;
  text: string;
}

/**
 * For a container element, lists its selectable descendants that are
 * themselves leaves (no element children of their own) — the actual
 * text-bearing pieces inside it — so the editor can offer a field per
 * real piece of content instead of one destructive flattened textarea.
 */
export function getNestedTextFields(root: Element): NestedTextField[] {
  const fields: NestedTextField[] = [];
  root.querySelectorAll(`[${EDITOR_ID_ATTR}]`).forEach((el) => {
    if (isContainerElement(el)) return;
    const text = el.textContent?.trim();
    if (!text) return;
    fields.push({ id: el.getAttribute(EDITOR_ID_ATTR)!, tag: el.tagName.toLowerCase(), text });
  });
  return fields;
}

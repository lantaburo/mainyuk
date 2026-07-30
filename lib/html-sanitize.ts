import sanitizeHtml from "sanitize-html";

const ALLOWED_STYLE_PROPERTIES = [
  "color", "background", "background-color",
  "padding", "padding-top", "padding-bottom", "padding-left", "padding-right",
  "margin", "margin-top", "margin-bottom", "margin-left", "margin-right",
  "font-size", "font-weight", "font-style", "font-family",
  "line-height", "letter-spacing",
  "text-align", "text-transform", "text-decoration",
  "border", "border-radius", "border-color", "border-width", "border-style",
  "width", "max-width", "min-width", "height", "max-height", "min-height",
  "display", "flex-direction", "flex-wrap", "flex-grow", "flex-shrink", "flex-basis",
  "justify-content", "align-items", "align-self", "gap",
  "grid-template-columns", "grid-column",
  "object-fit", "overflow", "opacity", "box-shadow", "aspect-ratio",
];

// Allow any value except known XSS vectors (url(), expression(), javascript:, @import) —
// the properties above legitimately need complex functional values like
// linear-gradient(...), var(--store-primary), color-mix(...), calc(...).
const SAFE_VALUE = /^(?!.*(javascript:|expression\(|@import|url\())[\s\S]+$/i;

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "div", "section", "article", "header", "footer", "nav", "main", "aside",
    "h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "a",
    "ul", "ol", "li", "img", "picture", "source",
    "button", "strong", "em", "b", "i", "u", "br", "hr",
    "blockquote", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "td", "th",
  ],
  allowedAttributes: {
    "*": ["class", "id", "style", "data-*", "aria-*", "role"],
    a: ["href", "target", "rel"],
    img: ["src", "alt", "loading", "width", "height"],
    source: ["srcset", "media", "type"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedStyles: {
    "*": Object.fromEntries(ALLOWED_STYLE_PROPERTIES.map((prop) => [prop, [SAFE_VALUE]])),
  },
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
  },
  disallowedTagsMode: "discard",
  allowVulnerableTags: false,
};

/**
 * Sanitizes an AI-generated (or otherwise untrusted) HTML fragment before it is
 * stored or rendered to real site visitors. Strips scripts, event handlers,
 * disallowed tags/attributes, and non-http(s)/mailto/tel URLs.
 */
export function sanitizeStoreHtml(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

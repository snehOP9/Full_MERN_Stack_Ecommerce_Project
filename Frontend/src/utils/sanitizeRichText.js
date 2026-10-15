const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li",
  "blockquote", "h1", "h2", "h3", "h4", "h5", "h6", "a", "span",
  "div", "code", "pre", "hr", "sub", "sup",
]);
const DROP_WITH_CONTENT = new Set([
  "script", "style", "iframe", "object", "embed", "svg", "math",
  "template", "noscript", "form", "input", "button", "textarea",
  "select", "option", "video", "audio", "source", "link", "meta", "base",
]);

function safeHref(value) {
  if (!value) return null;
  const href = value.trim();
  if (/^(https?:|mailto:)/i.test(href)) {
    try {
      const parsed = new URL(href);
      if (["http:", "https:", "mailto:"].includes(parsed.protocol)) return href;
    } catch (_) {
      return null;
    }
  }
  if (href.startsWith("#") || href.startsWith("./") || href.startsWith("../")) return href;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  return null;
}

function sanitizeNode(node, outputDocument) {
  if (node.nodeType === 3) return outputDocument.createTextNode(node.nodeValue || "");
  if (node.nodeType !== 1) return null;

  const tag = node.tagName.toLowerCase();
  if (DROP_WITH_CONTENT.has(tag)) return null;

  const fragment = outputDocument.createDocumentFragment();
  if (!ALLOWED_TAGS.has(tag)) {
    for (const child of Array.from(node.childNodes)) {
      const safeChild = sanitizeNode(child, outputDocument);
      if (safeChild) fragment.appendChild(safeChild);
    }
    return fragment;
  }

  const element = outputDocument.createElement(tag);
  if (tag === "a") {
    const href = safeHref(node.getAttribute("href"));
    if (href) element.setAttribute("href", href);
    if (node.getAttribute("target") === "_blank") {
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer");
    }
  }

  for (const child of Array.from(node.childNodes)) {
    const safeChild = sanitizeNode(child, outputDocument);
    if (safeChild) element.appendChild(safeChild);
  }
  return element;
}

export default function sanitizeRichText(value) {
  if (typeof DOMParser === "undefined" || typeof document === "undefined") return "";
  const parsed = new DOMParser().parseFromString(String(value ?? ""), "text/html");
  const output = document.createElement("div");
  for (const child of Array.from(parsed.body.childNodes)) {
    const safeChild = sanitizeNode(child, document);
    if (safeChild) output.appendChild(safeChild);
  }
  return output.innerHTML;
}

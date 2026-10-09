const allowedTags = new Set([
  "A", "B", "BLOCKQUOTE", "BR", "CODE", "EM", "I", "LI", "OL", "P",
  "SPAN", "STRONG", "U", "UL",
]);
const blockedTags = new Set([
  "SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "SVG", "MATH", "TEMPLATE",
]);

const isSafeUrl = (value) => {
  const url = value.trim();
  if (!url) return false;
  if (url.startsWith("/") || url.startsWith("#") || url.startsWith("?")) return true;
  try {
    const parsed = new URL(url, window.location.origin);
    return ["http:", "https:", "mailto:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const cleanNode = (node, document) => {
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent || "");
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return document.createDocumentFragment();

  const tag = node.tagName.toUpperCase();
  if (blockedTags.has(tag)) return document.createDocumentFragment();

  const children = document.createDocumentFragment();
  Array.from(node.childNodes).forEach((child) => children.appendChild(cleanNode(child, document)));

  if (!allowedTags.has(tag)) return children;

  const safeElement = document.createElement(tag.toLowerCase());
  if (tag === "A") {
    const href = node.getAttribute("href");
    if (href && isSafeUrl(href)) {
      safeElement.setAttribute("href", href.trim());
      safeElement.setAttribute("rel", "nofollow noopener noreferrer");
    }
    safeElement.setAttribute("target", "_blank");
  }

  safeElement.appendChild(children);
  return safeElement;
};

export const sanitizeRichText = (value) => {
  if (typeof value !== "string" || !value) return "";
  const parser = new DOMParser();
  const parsed = parser.parseFromString(value, "text/html");
  const output = document.implementation.createHTMLDocument("");
  Array.from(parsed.body.childNodes).forEach((node) => {
    output.body.appendChild(cleanNode(node, output));
  });
  return output.body.innerHTML;
};

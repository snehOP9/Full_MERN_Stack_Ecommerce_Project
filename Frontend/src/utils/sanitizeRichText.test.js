import { sanitizeRichText } from "./sanitizeRichText";

describe("sanitizeRichText", () => {
  test("keeps basic formatting and removes script elements", () => {
    const result = sanitizeRichText("<p>Hello <strong>world</strong></p><script>alert(1)</script>");
    expect(result).toContain("<p>Hello <strong>world</strong></p>");
    expect(result).not.toContain("<script");
    expect(result).not.toContain("alert(1)");
  });

  test("removes event handlers and unsafe URL schemes", () => {
    const result = sanitizeRichText('<p onclick="alert(1)">Text</p><a href="javascript:alert(1)">link</a>');
    expect(result).not.toContain("onclick");
    expect(result).not.toContain("javascript:");
    expect(result).not.toContain("alert(1)");
  });

  test("keeps safe links with protective rel attributes", () => {
    const result = sanitizeRichText('<a href="https://example.com">Example</a>');
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('rel="nofollow noopener noreferrer"');
    expect(result).toContain('target="_blank"');
  });

  test("returns an empty string for missing content", () => {
    expect(sanitizeRichText(undefined)).toBe("");
    expect(sanitizeRichText("")).toBe("");
  });
});

import sanitizeRichText from "./sanitizeRichText";

describe("sanitizeRichText", () => {
  test("removes scripts, executable attributes, and unsafe image elements", () => {
    const result = sanitizeRichText(
      '<p onclick="alert(1)">Hello<script>alert(2)</script><img src=x onerror="alert(3)"></p>'
    );
    expect(result).toContain("<p>Hello</p>");
    expect(result).not.toMatch(/script|onclick|onerror|<img/i);
  });

  test("preserves safe formatting and safe links", () => {
    const result = sanitizeRichText(
      '<strong>Important</strong><a href="https://example.com" target="_blank">Read more</a>'
    );
    expect(result).toContain("<strong>Important</strong>");
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  test("removes javascript URLs while preserving link text", () => {
    const result = sanitizeRichText('<a href="javascript:alert(1)" onclick="alert(2)">Open</a>');
    expect(result).toContain("Open");
    expect(result).not.toMatch(/javascript:|onclick/i);
  });
});

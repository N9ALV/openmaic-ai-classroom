import { describe, expect, it } from 'vitest';

import { sanitizeRichTextHtml } from '../../src/utils/sanitizeRichText';

describe('sanitizeRichTextHtml', () => {
  it('removes executable elements, event attributes and remote CSS loads', () => {
    const result = sanitizeRichTextHtml(
      '<script>alert(1)</script><img src=x onerror="alert(1)"><p onmouseover="alert(1)" style="font-size: 18px; background-image: url(https://bad.example/x)">Safe</p>',
    );

    expect(result).not.toMatch(/script|img|onerror|onmouseover|background-image|bad\.example/i);
    expect(result).toContain('<p style="font-size:18px">Safe</p>');
  });

  it('keeps supported formatting used by the slide editor', () => {
    const result = sanitizeRichTextHtml(
      '<div style="padding: 4.8px 9.6px"><p data-indent="2" style="text-align: center; margin-left: calc(42px + 0.25em)"><strong><u><span style="font-size: 28px; color: #ff0000">MAIC</span></u></strong></p></div>',
    );

    expect(result).toContain('padding:4.8px 9.6px');
    expect(result).toContain('data-indent="2"');
    expect(result).toContain('text-align:center');
    expect(result).toContain('margin-left:calc(42px + 0.25em)');
    expect(result).toContain('<strong><u><span');
  });

  it('allows safe links, blocks unsafe protocols and hardens link relations', () => {
    const safe = sanitizeRichTextHtml(
      '<a href="https://iu.com.au/" target="_blank">IU</a><a href="javascript:alert(1)">Bad</a>',
    );

    expect(safe).toContain('href="https://iu.com.au/"');
    expect(safe).toContain('rel="noopener noreferrer"');
    expect(safe).not.toContain('javascript:');
    expect(safe).toContain('>Bad</a>');
  });
});

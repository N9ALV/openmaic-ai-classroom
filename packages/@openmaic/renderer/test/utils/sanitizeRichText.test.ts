import { describe, expect, it } from 'vitest';

import { sanitizeRichTextHtml } from '../../src/utils/sanitizeRichText';

describe('sanitizeRichTextHtml', () => {
  it('preserves quoted and international font families used by the editor', () => {
    for (const family of ['&quot;Open Sans&quot;, sans-serif', "'Source Serif 4'", '微软雅黑']) {
      const clean = sanitizeRichTextHtml(`<span style="font-family: ${family}">Text</span>`);
      expect(clean).toContain('font-family:');
      expect(clean).toContain('Text</span>');
    }
  });

  it.each([
    '<svg><a xlink:href="javascript:alert(1)">x</a></svg>',
    '<math><mtext><img src=x onerror=alert(1)></mtext></math>',
    '<a href="java&#x73;cript:alert(1)">x</a>',
    '<span style="font-family:url(https://bad.example)">x</span>',
    '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
  ])('removes active content from %s', (html) => {
    expect(sanitizeRichTextHtml(html)).not.toMatch(
      /javascript:|onerror|<svg|<math|<iframe|bad\.example/i,
    );
  });

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

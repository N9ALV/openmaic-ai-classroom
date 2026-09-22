import sanitizeHtml from 'sanitize-html';

const SAFE_STYLE_VALUE =
  /^(?!.*(?:url\s*\(|expression\s*\(|javascript\s*:|@import|behavior\s*:|-moz-binding))[#(),.%+\-*/\w\s]+$/i;

// Font names are text, not general CSS expressions. Preserve the editor's
// quoted families and international names, without permitting escapes, URLs,
// functions, declaration separators or control characters.
const SAFE_FONT_FAMILY = /^[\p{L}\p{N}\p{M}_ ,'"-]+$/u;

/**
 * Sanitise model-authored and imported rich text before it reaches React's
 * innerHTML boundary. The allow-list mirrors the editor's text schema while
 * excluding executable elements, event attributes, images and CSS URL loads.
 */
export function sanitizeRichTextHtml(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) return '';

  return sanitizeHtml(value, {
    allowedTags: [
      'a',
      'b',
      'blockquote',
      'br',
      'code',
      'div',
      'em',
      'i',
      'li',
      'ol',
      'p',
      'pre',
      's',
      'span',
      'strike',
      'strong',
      'sub',
      'sup',
      'u',
      'ul',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'title', 'rel'],
      div: ['style'],
      ol: ['style', 'start'],
      p: ['style', 'data-indent'],
      span: ['style'],
      ul: ['style'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    allowedStyles: {
      '*': {
        'background-color': [SAFE_STYLE_VALUE],
        'box-sizing': [SAFE_STYLE_VALUE],
        color: [SAFE_STYLE_VALUE],
        display: [SAFE_STYLE_VALUE],
        'font-family': [SAFE_FONT_FAMILY],
        'font-size': [SAFE_STYLE_VALUE],
        'font-style': [SAFE_STYLE_VALUE],
        'font-weight': [SAFE_STYLE_VALUE],
        height: [SAFE_STYLE_VALUE],
        'letter-spacing': [SAFE_STYLE_VALUE],
        'line-height': [SAFE_STYLE_VALUE],
        'list-style-type': [SAFE_STYLE_VALUE],
        margin: [SAFE_STYLE_VALUE],
        'margin-bottom': [SAFE_STYLE_VALUE],
        'margin-left': [SAFE_STYLE_VALUE],
        'margin-right': [SAFE_STYLE_VALUE],
        'margin-top': [SAFE_STYLE_VALUE],
        padding: [SAFE_STYLE_VALUE],
        'padding-bottom': [SAFE_STYLE_VALUE],
        'padding-left': [SAFE_STYLE_VALUE],
        'padding-right': [SAFE_STYLE_VALUE],
        'padding-top': [SAFE_STYLE_VALUE],
        'text-align': [SAFE_STYLE_VALUE],
        'text-decoration': [SAFE_STYLE_VALUE],
        'text-decoration-line': [SAFE_STYLE_VALUE],
        'text-indent': [SAFE_STYLE_VALUE],
        'vertical-align': [SAFE_STYLE_VALUE],
        'white-space': [SAFE_STYLE_VALUE],
        width: [SAFE_STYLE_VALUE],
      },
    },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: 'noopener noreferrer' },
      }),
    },
  });
}

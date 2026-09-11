// lib/markdown.js
//
// A tiny, dependency-free markdown-to-React converter. Deliberately does
// NOT use react-markdown/remark — per the build spec, the content here is
// simple enough (bold, bullets, numbered lists, a little heading text)
// that a full markdown library is unjustified dependency weight. Anything
// outside this subset is rendered as literal plain text rather than
// causing an error, since content authors are non-technical.

function parseInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-b${i}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function renderMarkdown(source) {
  if (!source) return null;
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    // Heading: "# ", "## ", or "### "
    const headingMatch = line.match(/^(#{1,3})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const HeadingTag = level === 1 ? 'h3' : level === 2 ? 'h4' : 'h5';
      blocks.push(<HeadingTag key={`h-${key}`}>{parseInline(text, `h-${key}`)}</HeadingTag>);
      key++;
      i++;
      continue;
    }

    // Numbered list: consecutive "1. ", "2. " ... lines
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      const listKey = key++;
      blocks.push(
        <ol key={`ol-${listKey}`}>
          {items.map((item, idx) => (
            <li key={idx}>{parseInline(item, `ol-${listKey}-${idx}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Bullet list: consecutive "- " lines
    if (/^-\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^-\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^-\s+/, ''));
        i++;
      }
      const listKey = key++;
      blocks.push(
        <ul key={`ul-${listKey}`}>
          {items.map((item, idx) => (
            <li key={idx}>{parseInline(item, `ul-${listKey}-${idx}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Plain paragraph: consecutive non-blank, non-list, non-heading lines
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^-\s+/.test(lines[i]) &&
      !/^#{1,3}\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    const pKey = key++;
    blocks.push(<p key={`p-${pKey}`}>{parseInline(paraLines.join(' '), `p-${pKey}`)}</p>);
  }

  return blocks;
}

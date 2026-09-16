// One tree, two outputs. A screen is built once as a plain element tree; toHTML
// renders it for the gate and the harnesses, toTSX renders the same tree as a
// React component for the people who have to build it. Neither is authored by
// hand, so the component and the board being measured cannot disagree — which is
// the only reason shipping a second target is safe.
//
// React is never imported here. Emitting .tsx is a string problem, exactly as
// emitting .html already was, so this adapter adds no dependency to the build.
// Verifying the emitted components compile is a separate, dev-only concern.

export const h = (tag, props = {}, ...children) => ({ tag, props: props || {}, children: children.flat() });

const VOID = new Set(['meta', 'link', 'br', 'hr', 'img', 'input', 'path']);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// className is the React spelling; HTML wants class. Everything else (data-*,
// aria-*, stroke-width) is already spelled the way HTML wants it.
const htmlAttr = k => (k === 'className' ? 'class' : k);
// React spells hyphenated SVG/HTML attributes in camelCase — stroke-width becomes
// strokeWidth — but leaves data-* and aria-* exactly as authored. Both forms
// typecheck; this one is what a reader expects to find in a component.
const jsxAttr = k => {
  if (k === 'class') return 'className';
  if (/^(data|aria)-/.test(k)) return k;
  return k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
};

function attrs(props, name) {
  return Object.entries(props)
    .filter(([, v]) => v !== false && v !== null && v !== undefined)
    .map(([k, v]) => (v === true ? ` ${name(k)}` : ` ${name(k)}="${esc(v)}"`))
    .join('');
}

export function toHTML(node) {
  if (node === null || node === undefined || node === false) return '';
  if (typeof node !== 'object') return esc(node);
  const { tag, props, children } = node;
  if (tag === '#raw') return props.html;
  // self-closed, not bare: <path> inside inline SVG is foreign content and a bare
  // start tag there is malformed, whatever the HTML void-element rules allow.
  if (VOID.has(tag)) return `<${tag}${attrs(props, htmlAttr)}/>`;
  return `<${tag}${attrs(props, htmlAttr)}>` + children.map(toHTML).join('') + `</${tag}>`;
}

function jsxText(v) {
  const t = String(v);
  return /[{}<>]/.test(t) ? `{${JSON.stringify(t)}}` : t;
}

function toJSX(node, depth) {
  const pad = '  '.repeat(depth);
  if (node === null || node === undefined || node === false) return '';
  if (typeof node !== 'object') return pad + jsxText(node);
  const { tag, props, children } = node;
  if (tag === '#raw') return `${pad}<span dangerouslySetInnerHTML={{ __html: ${JSON.stringify(props.html)} }} />`;
  const a = attrs(props, jsxAttr);
  if (!children.length) return `${pad}<${tag}${a} />`;
  // one plain string stays on its line — the emitted file is read by people
  if (children.length === 1 && typeof children[0] !== 'object')
    return `${pad}<${tag}${a}>${jsxText(children[0])}</${tag}>`;
  const inner = children.map(c => toJSX(c, depth + 1)).filter(Boolean).join('\n');
  return `${pad}<${tag}${a}>\n${inner}\n${pad}</${tag}>`;
}

function wrapDoc(text) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if ((line + ' ' + word).trim().length > 86) { lines.push(line.trim()); line = word; }
    else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  return lines.map(l => ` * ${l}`).join('\n');
}

export function toTSX(componentName, node, rationale) {
  const doc = rationale ? `/**\n${wrapDoc(rationale)}\n */\n` : '';
  return `${doc}export function ${componentName}() {\n  return (\n${toJSX(node, 2)}\n  );\n}\n`;
}

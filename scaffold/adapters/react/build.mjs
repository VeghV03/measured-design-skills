#!/usr/bin/env node
// One function per screen, returning an element tree. The JSDoc above each one is
// the rationale and is extracted at build time by reading this file's own source —
// same mechanism and same text as ../node/build.mjs, so the three adapters produce
// an identical model/rationale.json and the CI diff proves it.
//
// This adapter emits two things from each tree: boards/<id>.html for the gate and
// the harnesses, and components/<Name>.tsx for the people who build the product.
// React is never imported. Emitting a component is a string problem, exactly as
// emitting a board already was.
//
//     node build.mjs --boards ../../boards --model ../../model --components ../../components

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
import { h, toHTML, toTSX } from './render.mjs';
import { TOKENS, emptyState, door, row, document_ } from './system.mjs';

/**
 * Context: seven places had no empty state, and an empty place is the most
 * common screen any of them will ever show. Options: draw one per place, or one
 * component. Why: one component makes the decision once. Trade-off: the copy has
 * to be generic enough to fit all of them. Right if: the places are genuinely
 * the same shape; when one is not, it gets its own screen, not a flag.
 */
function filesEmpty() {
  return { title: 'Files', nav: 'Files', body: emptyState(
    'folder', 'Nothing here yet',
    'Files you add appear here. Only you can see them until you share one.',
    'Add a file', 'Nothing is uploaded until you choose it.') };
}

/**
 * Context: the list is where a periodic visitor lands. Options: a dashboard of
 * activity, or the files themselves. Why: a visitor has forgotten what this is
 * for, and the files are the memory. Trade-off: no room for status. Right if:
 * the audience visits every few weeks rather than living here.
 */
function filesList() {
  return { title: 'Files', nav: 'Files', body: h('div', {},
    h('h1', {}, 'Files'),
    h('p', {}, 'Three files. Sharing cannot be taken back.'),
    row('notes.md', 'Only you', '12 KB'),
    row('budget-2026-final-v3.xlsx', 'Shared with 2', '1.1 MB'),
    row('photo.jpg', 'Only you', '840 KB'),
    h('p', {}, h('button', { className: 'btn' }, 'Move to folder…'), ' ',
                h('button', { className: 'btn danger' }, 'Remove')),
    h('p', {}, h('button', { className: 'btn' }, 'Search files'), ' ',
                h('button', { className: 'btn' }, 'Storage details'))) };
}

/**
 * Context: share_failed already established the shape for a refusal: what was
 * asked for, and what is still true. Options: one generic "something went wrong"
 * screen for every failure, or one screen per failure with its own honest sentence.
 * Why: "the file did not sync" and "the share did not go out" are different facts,
 * and a person deciding what to do next needs the actual one. Trade-off: a new
 * screen for every way the network can fail. Right if: the failures are few enough
 * to still be countable, the way this one is.
 */
function syncFailed() {
  return { title: 'Sync', nav: 'Files', body: h('div', {},
    h('h1', {}, 'Changes have not synced'),
    h('p', {}, 'Your changes are saved on this device. They have not reached your other devices yet.'),
    h('p', {}, h('button', { className: 'btn primary' }, 'Retry sync'))) };
}

/**
 * Context: a returning visitor forgets where a file ended up more often than
 * they forget its name. Options: browse by folder, or search by name. Why: search
 * is the faster path once the name is known and the location is not. Trade-off:
 * this ships ahead of d-002, so whether a removed file can appear here is still
 * open. Right if: the audience accumulates enough files that browsing stops being
 * the fast path.
 */
function searchResults() {
  return { title: 'Search', nav: '', body: h('div', {},
    h('h1', {}, 'Search results'),
    h('p', {}, '3 results for "budget".'),
    row('budget-2026-final-v3.xlsx', 'Shared with 2', '1.1 MB'),
    row('budget-2026-draft.xlsx', 'Only you', '980 KB'),
    row('budget-notes.md', 'Only you', '4 KB'),
    h('p', {}, h('button', { className: 'btn' }, 'Back to files'))) };
}

/**
 * Context: files_empty already exists for "nothing added yet"; a search with
 * no results is a different empty — something exists, this query does not match
 * it. Options: write new copy for this case, or reuse the empty_state component.
 * Why: empty_state was built to answer where you are, what this place is for, and
 * the one action that fills it, for exactly this shape of screen. Trade-off: the
 * same visual appears twice in one sitting if someone clears a file list and then
 * a search. Right if: that repetition reads as consistency, not deja vu.
 */
function searchEmpty() {
  return { title: 'Search', nav: '', body: emptyState(
    'file', 'Nothing matches',
    'Try a different name, or check the spelling.', 'Clear search') };
}

/**
 * Context: this is the one screen the policy zones "advanced" — the jargon a
 * file has no business using anywhere else is allowed here on purpose. Options:
 * keep storage detail on the main Files screen, or split it behind a link. Why: a
 * periodic visitor never needs upload-chunking mechanics; the person who does has
 * clicked through on purpose. Trade-off: a level of indirection between the number
 * and the person asking about it. Right if: checking storage stays a small minority
 * of visits.
 */
function settingsStorage() {
  return { title: 'Storage', nav: '', body: h('div', {},
    h('h1', {}, 'Storage'),
    h('p', {}, '1.9 GB of 5 GB used.'),
    h('p', {}, 'Large files upload in chunks; a failed chunk retries on its own.'),
    h('p', {}, h('button', { className: 'btn' }, 'Back to files'))) };
}

/**
 * Context: every other file manager has taught people that moving a file into
 * a shared folder shares it. Options: a silent move, or a screen carrying one
 * sentence. Why: the worst outcome is a file reaching the wrong person, so the
 * sentence earns a screen. Trade-off: one more step in a common action. Right if:
 * the worst outcome stays what it is.
 */
function filesMove() {
  return { title: 'Move to folder', nav: 'Files', body: door(
    'Move budget-2026-final-v3.xlsx to Shared work',
    ['Moving does not share. Nobody gains access by this move.',
      'It does not change who can already see the file.'],
    'The file stays where you can find it under Files.',
    'Move the file') };
}

/**
 * Context: every trash metaphor promises the item is gone and the space comes
 * back. This product delivers neither, so the name was the lie. Options: keep
 * Trash and explain, or rename. Why: the button says Remove, so the place is its
 * past tense, and the verb and the noun agree. Trade-off: one unfamiliar word.
 * Right if: the storage genuinely cannot be reclaimed.
 */
function filesRemoved() {
  return { title: 'Removed', nav: 'Removed', body: emptyState(
    'file', 'Nothing removed',
    'Files you remove stay here for 30 days. Removing does not free storage.',
    'Back to files') };
}

/**
 * Context: a failure state is a screen where something was refused, timed out,
 * ran out or cannot be done here. Options: a toast, or a screen. Why: the person
 * needs to know what did not happen and what is still true. Trade-off: a screen
 * to maintain. Right if: the failure is recoverable and the recovery is not
 * obvious.
 */
function shareFailed() {
  return { title: 'Share', nav: 'Shared', body: h('div', {},
    h('h1', {}, 'That share did not go out'),
    h('p', {}, 'We asked for it and it did not come back. Nobody was given access.'),
    h('p', {}, h('button', { className: 'btn primary' }, 'Try again'))) };
}

/**
 * Context: an entrance assumes no prior state. Options: start at the file list,
 * or teach first. Why: a periodic visitor has forgotten what this is for.
 * Trade-off: a screen between a returning person and their files. Right if: the
 * audience opens this every few weeks rather than all day.
 */
function firstRun() {
  return { title: 'Welcome', nav: '', body: h('div', {},
    h('h1', {}, 'Your files, wherever you are'),
    h('p', {}, 'Add a file and it stays yours. Share one and it cannot be taken back.'),
    h('p', {}, h('button', { className: 'btn primary' }, 'Add your first file'))) };
}

const SCREENS = {
  'first-run-welcome': firstRun,
  'files-empty': filesEmpty,
  'files-list': filesList,
  'files-move': filesMove,
  'files-removed': filesRemoved,
  'share-failed': shareFailed,
  'sync-failed': syncFailed,
  'search-results': searchResults,
  'search-empty': searchEmpty,
  'settings-storage': settingsStorage,
};

const componentName = id => id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('');

// Identical to ../node/build.mjs: one left-to-right pass pairing each /** ... */
// with the function that immediately follows it.
function extractRationales(source) {
  const re = /\/\*\*([\s\S]*?)\*\/\s*function\s+(\w+)\s*\(/g;
  const map = {};
  for (const m of source.matchAll(re)) {
    map[m[2]] = m[1].replace(/^[ \t]*\*[ \t]?/gm, ' ').split(/\s+/).filter(Boolean).join(' ');
  }
  return map;
}

function argVal(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const SHELL_TSX = `import type { ReactNode } from 'react';

/**
 * The window chrome every screen shares. Identical by construction rather than by
 * discipline: the boards this adapter writes are rendered from the same tree.
 */
export function Shell({ current = '', children }: { current?: string; children: ReactNode }) {
  const nav = ['Files', 'Shared', 'Removed'];
  return (
    <div className="win">
      <div className="chrome">
        <nav className="nav">
          {nav.map(n => (
            <span key={n} aria-current={n === current ? 'page' : undefined}>{n}</span>
          ))}
        </nav>
      </div>
      <div className="body">{children}</div>
    </div>
  );
}
`;

function main() {
  const out = resolve(argVal('--boards', 'boards'));
  const mdl = resolve(argVal('--model', 'model'));
  const cmp = resolve(argVal('--components', 'components'));
  mkdirSync(out, { recursive: true });
  mkdirSync(mdl, { recursive: true });
  mkdirSync(cmp, { recursive: true });

  const source = readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const byFnName = extractRationales(source);
  const rationale = {};
  const index = [];

  for (const [id, fn] of Object.entries(SCREENS)) {
    const screen = fn();
    const doc = byFnName[fn.name] || '';
    if (!doc) console.error(`  ${id}: no rationale comment — that is the finding, not a warning`);
    rationale[id] = doc;

    writeFileSync(join(out, `${id}.html`), '<!doctype html>\n' + toHTML(document_(screen.title, screen.nav, screen.body)));

    const name = componentName(id);
    writeFileSync(join(cmp, `${name}.tsx`), toTSX(name, screen.body, doc));
    index.push(`export { ${name} } from './${name}';`);
  }

  writeFileSync(join(cmp, 'Shell.tsx'), SHELL_TSX);
  writeFileSync(join(cmp, 'tokens.css'), TOKENS.trimStart());
  writeFileSync(join(cmp, 'index.ts'), index.join('\n') + `\nexport { Shell } from './Shell';\n`);
  writeFileSync(join(mdl, 'rationale.json'), JSON.stringify(rationale, null, 1) + '\n');

  console.log(`${Object.keys(SCREENS).length} boards written to ${argVal('--boards', 'boards')} · `
    + `${Object.keys(SCREENS).length + 1} components to ${argVal('--components', 'components')} · `
    + `rationale extracted to ${argVal('--model', 'model')}/rationale.json`);
}

main();

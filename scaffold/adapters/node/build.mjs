#!/usr/bin/env node
// One function per screen. The JSDoc comment immediately above each one is the
// rationale, and it is extracted at build time — by reading this file's own source —
// into model/rationale.json. Same mechanism as ../python/build.py's docstring
// extraction, adapted to a language that does not have docstrings: the comment and
// the function are still the same object in the same file, so the reasoning still
// physically cannot drift from the screen it explains.
//
// Screens are compiled, not drawn. Re-running produces byte-identical files, which
// is how you check that what is published is still what is on disk.
//
//     node build.mjs --boards ../../boards --model ../../model

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
import { shell, emptyState, door, row } from './system.mjs';

/**
 * Context: seven places had no empty state, and an empty place is the most
 * common screen any of them will ever show. Options: draw one per place, or one
 * component. Why: one component makes the decision once. Trade-off: the copy has
 * to be generic enough to fit all of them. Right if: the places are genuinely
 * the same shape; when one is not, it gets its own screen, not a flag.
 */
function filesEmpty() {
  return shell('Files', emptyState(
    'folder', 'Nothing here yet',
    'Files you add appear here. Only you can see them until you share one.',
    'Add a file', 'Nothing is uploaded until you choose it.'), 'Files');
}

/**
 * Context: the list is where a periodic visitor lands. Options: a dashboard of
 * activity, or the files themselves. Why: a visitor has forgotten what this is
 * for, and the files are the memory. Trade-off: no room for status. Right if:
 * the audience visits every few weeks rather than living here.
 */
function filesList() {
  const body = '<h1>Files</h1><p>Three files. Sharing cannot be taken back.</p>'
    + row('notes.md', 'Only you', '12 KB')
    + row('budget-2026-final-v3.xlsx', 'Shared with 2', '1.1 MB')
    + row('photo.jpg', 'Only you', '840 KB')
    + '<p><button class="btn">Move to folder…</button> '
    + '<button class="btn danger">Remove</button></p>'
    + '<p><button class="btn">Search files</button> '
    + '<button class="btn">Storage details</button></p>';
  return shell('Files', body, 'Files');
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
  const body = '<h1>Changes have not synced</h1>'
    + '<p>Your changes are saved on this device. They have not reached your '
    + 'other devices yet.</p>'
    + '<p><button class="btn primary">Retry sync</button></p>';
  return shell('Sync', body, 'Files');
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
  const body = '<h1>Search results</h1><p>3 results for "budget".</p>'
    + row('budget-2026-final-v3.xlsx', 'Shared with 2', '1.1 MB')
    + row('budget-2026-draft.xlsx', 'Only you', '980 KB')
    + row('budget-notes.md', 'Only you', '4 KB')
    + '<p><button class="btn">Back to files</button></p>';
  return shell('Search', body);
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
  return shell('Search', emptyState(
    'file', 'Nothing matches',
    'Try a different name, or check the spelling.', 'Clear search'));
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
  const body = '<h1>Storage</h1><p>1.9 GB of 5 GB used.</p>'
    + '<p>Large files upload in chunks; a failed chunk retries on its own.</p>'
    + '<p><button class="btn">Back to files</button></p>';
  return shell('Storage', body);
}

/**
 * Context: every other file manager has taught people that moving a file into
 * a shared folder shares it. Options: a silent move, or a screen carrying one
 * sentence. Why: the worst outcome is a file reaching the wrong person, so the
 * sentence earns a screen. Trade-off: one more step in a common action. Right if:
 * the worst outcome stays what it is.
 */
function filesMove() {
  return shell('Move to folder', door(
    'Move budget-2026-final-v3.xlsx to Shared work',
    ['Moving does not share. Nobody gains access by this move.',
      'It does not change who can already see the file.'],
    'The file stays where you can find it under Files.',
    'Move the file'), 'Files');
}

/**
 * Context: every trash metaphor promises the item is gone and the space comes
 * back. This product delivers neither, so the name was the lie. Options: keep
 * Trash and explain, or rename. Why: the button says Remove, so the place is its
 * past tense, and the verb and the noun agree. Trade-off: one unfamiliar word.
 * Right if: the storage genuinely cannot be reclaimed.
 */
function filesRemoved() {
  return shell('Removed', emptyState(
    'file', 'Nothing removed',
    'Files you remove stay here for 30 days. Removing does not free storage.',
    'Back to files'), 'Removed');
}

/**
 * Context: a failure state is a screen where something was refused, timed out,
 * ran out or cannot be done here. Options: a toast, or a screen. Why: the person
 * needs to know what did not happen and what is still true. Trade-off: a screen
 * to maintain. Right if: the failure is recoverable and the recovery is not
 * obvious.
 */
function shareFailed() {
  const body = '<h1>That share did not go out</h1>'
    + '<p>We asked for it and it did not come back. Nobody was given access.</p>'
    + '<p><button class="btn primary">Try again</button></p>';
  return shell('Share', body, 'Shared');
}

/**
 * Context: an entrance assumes no prior state. Options: start at the file list,
 * or teach first. Why: a periodic visitor has forgotten what this is for.
 * Trade-off: a screen between a returning person and their files. Right if: the
 * audience opens this every few weeks rather than all day.
 */
function firstRun() {
  const body = '<h1>Your files, wherever you are</h1>'
    + '<p>Add a file and it stays yours. Share one and it cannot be taken back.</p>'
    + '<p><button class="btn primary">Add your first file</button></p>';
  return shell('Welcome', body, '');
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

// A single left-to-right pass, pairing each /** ... */ with the function that
// immediately follows it. Matching per-function-name in isolation (rather than
// scanning once) would let a non-greedy quantifier walk past intermediate
// functions to reach a same-named one much later in the file — this does not.
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

function main() {
  const boardsArg = argVal('--boards', 'boards');
  const modelArg = argVal('--model', 'model');
  const out = resolve(boardsArg);
  const mdl = resolve(modelArg);
  mkdirSync(out, { recursive: true });
  mkdirSync(mdl, { recursive: true });

  const source = readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const byFnName = extractRationales(source);
  const rationale = {};
  for (const [id, fn] of Object.entries(SCREENS)) {
    writeFileSync(join(out, `${id}.html`), fn());
    const doc = byFnName[fn.name] || '';
    if (!doc) console.error(`  ${id}: no rationale comment — that is the finding, not a warning`);
    rationale[id] = doc;
  }
  writeFileSync(join(mdl, 'rationale.json'), JSON.stringify(rationale, null, 1) + '\n');
  console.log(`${Object.keys(SCREENS).length} boards written to ${boardsArg} · `
    + `rationale extracted to ${modelArg}/rationale.json`);
}

main();

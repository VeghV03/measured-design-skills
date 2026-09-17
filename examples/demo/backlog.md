# File manager

`FILES` · company-managed

Generated. Read it before importing — the import is the irreversible half.

4 epics · 9 stories · 10 sub-tasks · 2 spikes · 5 blocked · 1 with nothing serving it · 9 still need their "so I can"

## Answer these first

Each one blocks work that is already written. Both options are live until somebody chooses.

### Does the cost estimate appear before saving, or after?

Audit found one step in the agreed scope that nothing serves.

- **Before saving** — buys nobody is surprised by a charge; costs the estimate must be computed on a file that does not exist yet; kills the one-click save
- **After saving, before publishing** — buys an exact number instead of an estimate; costs the person has already committed; kills the promise that nothing happens until you choose

*Before wins if arrivals are price-sensitive rather than already committed.*

Blocks: See what is here

### Does search include removed files?

Search was designed after Removed already existed; the two features were not built together.

- **Include, marked as removed** — buys a file someone half-remembers deleting is still findable; costs every result needs a removed indicator, even when nothing is removed; kills a result list that is just files
- **Exclude removed files entirely** — buys search only ever returns things the person can use right now; costs a removed file is invisible to search on top of being out of the list; kills finding a file you deleted an hour ago without opening Removed

*Include wins if removal is read as "out of the way" rather than "gone" — see files-removed.*

Blocks: Search for a file

## First run

Steps: Arrive with no account, Add the first file.

### Arrive with no account  ·  M

I want to arrive with no account, so I can ⟨outcome — one line, from whoever knows why this step exists⟩.

Context: an entrance assumes no prior state. Why the design is like this: a periodic visitor has forgotten what this is for. Trade-off accepted: a screen between a returning person and their files.

Acceptance criteria
- Welcome renders at every supported width with nothing off the frame, a heading, labelled controls, targets at or over the minimum, and no text under its contrast threshold in either theme  [overflow, structure, target-size, contrast]
- every route declared from these screens binds to a label that is on the board  [routes]
- no term the vocabulary policy forbids appears outside the zone that allows it  [vocab]

Criteria marked with a check in brackets are proved by that harness, not by opinion. Run them before closing this.

Size hint: M — 1 sub-task, 3 criteria, 0 blockers. A count, not an estimate.

- Welcome — an entrance assumes no prior state

### Add the first file  ·  M  ·  blocked

When I am in Welcome and choose Add your first file, I want to add the first file, so I can ⟨outcome — one line, from whoever knows why this step exists⟩.

Context: seven places had no empty state, and an empty place is the most common screen any of them will ever show. Why the design is like this: one component makes the decision once. Trade-off accepted: the copy has to be generic enough to fit all of them.

Acceptance criteria
- Files, empty renders at every supported width with nothing off the frame, a heading, labelled controls, targets at or over the minimum, and no text under its contrast threshold in either theme  [overflow, structure, target-size, contrast]
- every route declared from these screens binds to a label that is on the board  [routes]
- Files, empty says what to do next, not only that there is nothing here
- no term the vocabulary policy forbids appears outside the zone that allows it  [vocab]

Criteria marked with a check in brackets are proved by that harness, not by opinion. Run them before closing this.

Size hint: M — 1 sub-task, 4 criteria, 1 blocker. A count, not an estimate.

Waits for: See what is here (S-manage-see)

- Files, empty — seven places had no empty state, and an empty place is the most common screen any of them will ever show

## Manage files

Steps: See what is here, Move a file into a folder, Remove a file, Share a file, See the cost before saving.

### See what is here  ·  M  ·  blocked

When I am in Files, empty and choose Add a file, I want to see what is here, so I can ⟨outcome — one line, from whoever knows why this step exists⟩.

Context: the list is where a periodic visitor lands. Why the design is like this: a visitor has forgotten what this is for, and the files are the memory. Trade-off accepted: no room for status.

Acceptance criteria
- Files renders at every supported width with nothing off the frame, a heading, labelled controls, targets at or over the minimum, and no text under its contrast threshold in either theme  [overflow, structure, target-size, contrast]
- every route declared from these screens binds to a label that is on the board  [routes]
- no term the vocabulary policy forbids appears outside the zone that allows it  [vocab]

Criteria marked with a check in brackets are proved by that harness, not by opinion. Run them before closing this.

Size hint: M — 2 sub-tasks, 3 criteria, 2 blockers. A count, not an estimate.

Note: Sync did not finish serves no step in the agreed scope. It is reached from this story, so it is built here — confirm the scope should name it.

Waits for: Decide: does the cost estimate appear before saving, or after? (K-d-001), Arrive with no account (S-first-run-arrive)

- Files — the list is where a periodic visitor lands
- Sync did not finish — Refused: changes made on this device have not reached the others. Not a crash — the local copy is safe and is exactly what the failure state says it is. Serves no named step; reached from Files.

### Move a file into a folder  ·  M

When I am in Files and choose Move to folder…, I want to move a file into a folder, so I can ⟨outcome — one line, from whoever knows why this step exists⟩.

Context: every other file manager has taught people that moving a file into a shared folder shares it. Why the design is like this: the worst outcome is a file reaching the wrong person, so the sentence earns a screen. Trade-off accepted: one more step in a common action.

Acceptance criteria
- Move to folder renders at every supported width with nothing off the frame, a heading, labelled controls, targets at or over the minimum, and no text under its contrast threshold in either theme  [overflow, structure, target-size, contrast]
- every route declared from these screens binds to a label that is on the board  [routes]
- no term the vocabulary policy forbids appears outside the zone that allows it  [vocab]

Criteria marked with a check in brackets are proved by that harness, not by opinion. Run them before closing this.

Size hint: M — 1 sub-task, 3 criteria, 0 blockers. A count, not an estimate.

- Move to folder — every other file manager has taught people that moving a file into a shared folder shares it

### Remove a file  ·  M

When I am in Files and choose Remove, I want to remove a file, so I can ⟨outcome — one line, from whoever knows why this step exists⟩.

Context: every trash metaphor promises the item is gone and the space comes back. This product delivers neither, so the name was the lie. Why the design is like this: the button says Remove, so the place is its past tense, and the verb and the noun agree. Trade-off accepted: one unfamiliar word.

Acceptance criteria
- Removed renders at every supported width with nothing off the frame, a heading, labelled controls, targets at or over the minimum, and no text under its contrast threshold in either theme  [overflow, structure, target-size, contrast]
- every route declared from these screens binds to a label that is on the board  [routes]
- Removed has an empty state — an empty place is the most common screen it will ever show
- no term the vocabulary policy forbids appears outside the zone that allows it  [vocab]

Criteria marked with a check in brackets are proved by that harness, not by opinion. Run them before closing this.

Size hint: M — 1 sub-task, 4 criteria, 0 blockers. A count, not an estimate.

- Removed — every trash metaphor promises the item is gone and the space comes back. This product delivers neither, so the name was the lie

### Share a file  ·  M  ·  blocked

When Files reports it, I want to share a file, so I can ⟨outcome — one line, from whoever knows why this step exists⟩.

Context: a failure state is a screen where something was refused, timed out, ran out or cannot be done here. Why the design is like this: the person needs to know what did not happen and what is still true. Trade-off accepted: a screen to maintain.

Acceptance criteria
- Share did not go out renders at every supported width with nothing off the frame, a heading, labelled controls, targets at or over the minimum, and no text under its contrast threshold in either theme  [overflow, structure, target-size, contrast]
- every route declared from these screens binds to a label that is on the board  [routes]
- Share did not go out says what is still true, not only what failed: Refused: the share was asked for and did not come back. Not an empty result — nobody gained access, and the person needs to know what is still true.
- no term the vocabulary policy forbids appears outside the zone that allows it  [vocab]

Criteria marked with a check in brackets are proved by that harness, not by opinion. Run them before closing this.

Size hint: M — 1 sub-task, 4 criteria, 1 blocker. A count, not an estimate.

Note: Share did not go out: The scope document still calls this place Trash. The scope document has not seen this claim — bring it level before this ships.

Waits for: See what is here (S-manage-see)

- Share did not go out — Refused: the share was asked for and did not come back. Not an empty result — nobody gained access, and the person needs to know what is still true.

### See the cost before saving  ·  S  ·  nothing serves this yet

I want to see the cost before saving, so I can ⟨outcome — one line, from whoever knows why this step exists⟩.

The agreed scope asks for a cost estimate before saving. Nothing serves it. Websites have one and files do not.

Nothing serves this yet. The scope asks for it and no screen was designed for it; the design work is part of this story.

Acceptance criteria
- something serves this step — a screen exists, is routed to, and is in the model

Size hint: S — 0 sub-tasks, 1 criterion, 0 blockers. A count, not an estimate.

## Find things

Steps: Search for a file.

### Search for a file  ·  M  ·  blocked

When I am in Files and choose Search files, I want to search for a file, so I can ⟨outcome — one line, from whoever knows why this step exists⟩.

Context: a returning visitor forgets where a file ended up more often than they forget its name. Why the design is like this: search is the faster path once the name is known and the location is not. Trade-off accepted: this ships ahead of d-002, so whether a removed file can appear here is still open.

Acceptance criteria
- Search results renders at every supported width with nothing off the frame, a heading, labelled controls, targets at or over the minimum, and no text under its contrast threshold in either theme  [overflow, structure, target-size, contrast]
- every route declared from these screens binds to a label that is on the board  [routes]
- no term the vocabulary policy forbids appears outside the zone that allows it  [vocab]

Criteria marked with a check in brackets are proved by that harness, not by opinion. Run them before closing this.

Size hint: M — 2 sub-tasks, 3 criteria, 2 blockers. A count, not an estimate.

Note: No matches serves no step in the agreed scope. It is reached from this story, so it is built here — confirm the scope should name it.

Waits for: Decide: does search include removed files? (K-d-002), Arrive with no account (S-first-run-arrive)

- Search results — a returning visitor forgets where a file ended up more often than they forget its name
- No matches — files_empty already exists for "nothing added yet"; a search with no results is a different empty — something exists, this query does not match it Serves no named step; reached from Search results.

## Manage account

Steps: Check storage used.

### Check storage used  ·  M  ·  blocked

When I am in Files and choose Storage details, I want to check storage used, so I can ⟨outcome — one line, from whoever knows why this step exists⟩.

Context: this is the one screen the policy zones "advanced" — the jargon a file has no business using anywhere else is allowed here on purpose. Why the design is like this: a periodic visitor never needs upload-chunking mechanics; the person who does has clicked through on purpose. Trade-off accepted: a level of indirection between the number and the person asking about it.

Acceptance criteria
- Storage renders at every supported width with nothing off the frame, a heading, labelled controls, targets at or over the minimum, and no text under its contrast threshold in either theme  [overflow, structure, target-size, contrast]
- every route declared from these screens binds to a label that is on the board  [routes]
- Storage has an empty state — an empty place is the most common screen it will ever show
- no term the vocabulary policy forbids appears outside the zone that allows it  [vocab]

Criteria marked with a check in brackets are proved by that harness, not by opinion. Run them before closing this.

Size hint: M — 1 sub-task, 4 criteria, 1 blocker. A count, not an estimate.

Waits for: Arrive with no account (S-first-run-arrive)

- Storage — this is the one screen the policy zones "advanced" — the jargon a file has no business using anywhere else is allowed here on purpose

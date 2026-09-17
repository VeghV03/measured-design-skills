# Invoicing — from a two-page brief

`INV` · team-managed

Generated. Read it before importing — the import is the irreversible half.

2 epics · 6 stories · 10 sub-tasks · 1 spike · 6 blocked · 1 with nothing serving it · 2 still need their "so I can"

## Answer these first

Each one blocks work that is already written. Both options are live until somebody chooses.

### Which business details are legally required on an invoice, and does that vary by the country we launch in?

The brief lists fields without saying which are mandatory. Getting this wrong makes every invoice sent from the product legally defective, and it is not fixable after the fact.

- **One superset of fields, all required** — buys one form, one validation rule, launch anywhere; costs asks every user for things most of them do not need; kills a short sign-up
- **Per-country field sets** — buys each user is asked only for what applies to them; costs a rule set per country, maintained forever; kills launching in a new country without legal review

*The superset wins if the first release is one country and the second is not imminent.*

Blocks: Add the business details

## Get an invoice paid

Steps: Create an invoice, Send it, Chase an unpaid one, See what is owed.

### Create an invoice  ·  M  ·  blocked

When I have done work for somebody and want the money, I want to create an invoice for it, so I can there is a document the client can pay against.

Line items, a total, a due date and a client. What it must never do: send anything. Creating and sending are separate on purpose, because a half-written invoice reaching a client cannot be taken back.

Acceptance criteria
- nothing leaves the system from this screen — sending is a separate, deliberate action
- the total is recomputed from the line items and is never typed by hand
- an invoice with no line items cannot be saved as ready to send
- nothing falls off the frame at any supported width  [overflow]

Criteria marked with a check in brackets are proved by that harness, not by opinion. Run them before closing this.

Size hint: M — 2 sub-tasks, 4 criteria, 1 blocker. A count, not an estimate.

Waits for: Add the business details (S-set-up-details)

- New invoice
- No invoices yet

### Send an invoice  ·  M  ·  blocked

When an invoice is finished and I have checked it, I want to send it to the client, so I can the client has it and the clock starts.

Sending is irreversible from the client's side. The screen exists mostly to carry that one sentence, and to show exactly what will be sent and to whom before it goes.

Acceptance criteria
- the client's email address is shown in full, next to the confirm action
- a send that fails says whether the client received it or not — never 'something went wrong'
- a sent invoice can be viewed but not edited

Size hint: M — 2 sub-tasks, 3 criteria, 1 blocker. A count, not an estimate.

Waits for: Create an invoice (S-get-paid-create)

- Confirm and send
- Send did not go out

### Chase an unpaid invoice  ·  S  ·  nothing serves this yet, blocked

When an invoice has gone past its due date, I want to remind the client without writing the email myself, so I can ⟨outcome — one line, from whoever knows why this step exists⟩.

The brief asks for this in one line and describes nothing. Nothing is designed for it yet.

Nothing serves this yet. The scope asks for it and no screen was designed for it; the design work is part of this story.

Acceptance criteria
- something serves this step — a screen exists and is reachable
- a reminder says which invoice, for how much, and how overdue

Size hint: S — 0 sub-tasks, 2 criteria, 1 blocker. A count, not an estimate.

Waits for: Send an invoice (S-get-paid-send)

### See what is owed  ·  M  ·  blocked

When I want to know where I stand, I want to see every unpaid invoice and what it adds up to, so I can I know whether to chase anybody this week.

The one screen most people open daily. With six invoices it is a list; with six hundred it is unusable, so the density budget matters here more than anywhere else.

Acceptance criteria
- the outstanding total is visible without scrolling
- overdue is distinguishable without relying on colour alone  [structure]
- the list stays usable at the real number of invoices, not the demo number  [density]

Criteria marked with a check in brackets are proved by that harness, not by opinion. Run them before closing this.

Size hint: M — 2 sub-tasks, 3 criteria, 1 blocker. A count, not an estimate.

Waits for: Send an invoice (S-get-paid-send)

- Outstanding invoices
- Nothing outstanding

## Set up the account

Steps: Add the business details, Connect a bank account.

### Add the business details  ·  M  ·  blocked

When I have signed up and nothing is filled in yet, I want to add the business details that appear on an invoice, so I can an invoice I send looks like it came from a real business.

Name, address, tax number and logo. These appear on every invoice, so an invoice cannot be sent before this exists. The brief does not say which fields are legally required and that varies by country — see the spike.

Acceptance criteria
- the form states which fields appear on the invoice and which are for our records only
- leaving it half-finished and coming back does not lose what was typed
- every field has a label a screen reader can read  [structure]

Criteria marked with a check in brackets are proved by that harness, not by opinion. Run them before closing this.

Size hint: M — 2 sub-tasks, 3 criteria, 1 blocker. A count, not an estimate.

Waits for: Decide: which business fields are legally required, and where (K-tax-fields)

- Business details form
- First-run state, nothing entered yet

### Connect a bank account  ·  M  ·  blocked

When my business details are saved, I want to connect the account the money should arrive in, so I can ⟨outcome — one line, from whoever knows why this step exists⟩.

The brief assumes one bank account per business and never says so. Flagged rather than designed around.

Acceptance criteria
- a failed connection says what is still true — no money has moved, nothing was saved
- the account number is never shown in full after it is saved

Size hint: M — 2 sub-tasks, 2 criteria, 1 blocker. A count, not an estimate.

Waits for: Add the business details (S-set-up-details)

- Connect account
- Connection refused

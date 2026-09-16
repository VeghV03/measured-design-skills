#!/usr/bin/env python3
"""Every vendored skill must be reachable from a stage. Anything else is dead weight.

The library is marked disable-model-invocation, so a skill nothing names is a skill
nothing can ever run — it inflates the count and teaches a reader the pack is bigger
than it is. This refuses on two things: an orphan, and a stage naming an id that does
not exist. Both are silent until something counts them.

    python3 check_library.py [--skills skills]
"""
import argparse, os, re, sys

REF = re.compile(r'`([a-z0-9][a-z0-9-]{3,})`')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--skills', default='skills')
    a = ap.parse_args()

    lib = os.path.join(a.skills, 'library')
    if not os.path.isdir(lib):
        print(f"STOP · no library at {lib}")
        sys.exit(1)

    vendored = {d for d in os.listdir(lib) if os.path.isdir(os.path.join(lib, d))}
    stages = sorted(
        d for d in os.listdir(a.skills)
        if d.startswith('measured-design')
        and os.path.isfile(os.path.join(a.skills, d, 'SKILL.md'))
    )

    reach, bad = {}, []
    for st in stages:
        text = open(os.path.join(a.skills, st, 'SKILL.md')).read()
        for tok in REF.findall(text):
            if tok in vendored:
                reach.setdefault(tok, []).append(st)
            elif tok.startswith('thinking-') or f'{tok}/' in text:
                bad.append((st, tok))

    orphans = sorted(vendored - set(reach))
    if orphans or bad:
        for st, tok in bad:
            print(f"  {st}: `{tok}` names no vendored skill")
        for o in orphans:
            print(f"  {o}: reachable from no stage")
        n = len(orphans) + len(bad)
        print(f"\nSTOP · {n} library skills are unreachable or misnamed.")
        sys.exit(1)

    multi = sum(1 for v in reach.values() if len(v) > 1)
    print(f"{len(vendored)} vendored · {len(reach)} reachable · 0 orphans")
    print(f"{len(stages):>5}  stage skills scanned")
    print(f"{multi:>5}  skills named by more than one stage")


if __name__ == '__main__':
    main()

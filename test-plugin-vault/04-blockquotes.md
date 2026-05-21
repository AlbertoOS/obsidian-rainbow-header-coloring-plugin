# 04 — Blockquotes: Verify Behavior

Headers inside blockquotes are valid Markdown. Verify whether coloring applies.

## Normal heading above a blockquote

> # H1 inside a blockquote — does this get colored?
>
> ## H2 inside a blockquote
>
> ### H3 inside a blockquote
>
> Some blockquote body text.

## Normal heading after a blockquote

The headings above were inside `>` blockquote syntax.
Expected behavior: Obsidian renders them as real headings, so the CSS selector
`.cm-line.HyperMD-header-N` should still match and coloring SHOULD apply.

> Single-line blockquote: normal text, no heading here.

### Nested blockquote

> Outer blockquote
>
> > # H1 inside nested blockquote — verify
> >
> > ## H2 inside nested blockquote

## After nested blockquote

###### Back to normal H6

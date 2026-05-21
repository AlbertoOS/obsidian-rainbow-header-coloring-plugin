# 02 — Code Blocks: Headers Must NOT Be Colored Inside

Headers inside fenced or indented code blocks should pass through without coloring.

## Fenced code block with backticks

The `#` characters below are code, not headings:

```markdown
# This is inside a fenced code block — must NOT be colored
## Also inside — must NOT be colored
### Also inside — must NOT be colored
```

## Fenced code block with tildes

~~~markdown
# Also inside a tilde-fenced block — must NOT be colored
## Also inside — must NOT be colored
~~~

## Fenced block with a language that has no special meaning

```
# raw fenced block, no language tag — must NOT be colored
```

## Inline code (single backtick)

Inline `# not a heading` within a sentence — must NOT be colored.

The text `## also not a heading` is just code.

## After all code blocks

### This heading SHOULD be colored again

Everything back to normal from this point on.

###### Also this H6 should be colored

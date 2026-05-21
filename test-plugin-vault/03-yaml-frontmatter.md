---
title: 03 — YAML Frontmatter Test
tags: [test, edge-case, yaml]
author: Test
# This is a YAML comment — must NOT be colored as a heading
description: "Testing that YAML frontmatter is not treated as headings"
---

# This H1 appears after frontmatter — SHOULD be colored

The YAML block above is frontmatter. The `# This is a YAML comment` line must not trigger heading coloring because it is inside the frontmatter block.

## This H2 should also be colored

### And H3

Normal document from here on.

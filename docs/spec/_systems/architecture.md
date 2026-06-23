---
type: l3-system
spec_version: 1
name: architecture
discovered_from: code-graph + repo config
resource_count: 14
extractor_version: 1.0.2
renderer_version: 1.0.2
last_audited: 2026-06-23T03:06:20.043Z
---

# Architecture overview — System Spec

Repo-level view of how the source folders depend on each other, aggregated from the import graph. An arrow A → B means a file in A imports a file in B.

## Module dependency graph

Folders that import across folder boundaries (11 of 14). Self-contained folders are listed below.

```mermaid
flowchart LR
  n_app["app"]
  n_app_tabs["app/(tabs)"]
  n_infra_bin["infra/bin"]
  n_infra_lib["infra/lib"]
  n_src_api["src/api"]
  n_src_components["src/components"]
  n_src_context["src/context"]
  n_src_hooks["src/hooks"]
  n_src_store["src/store"]
  n_src_types["src/types"]
  n_src_utils["src/utils"]
  n_app --> n_src_context
  n_app --> n_src_hooks
  n_app --> n_src_store
  n_app --> n_src_utils
  n_app_tabs --> n_src_components
  n_app_tabs --> n_src_context
  n_app_tabs --> n_src_hooks
  n_app_tabs --> n_src_store
  n_app_tabs --> n_src_types
  n_app_tabs --> n_src_utils
  n_infra_bin --> n_infra_lib
  n_src_api --> n_src_types
  n_src_components --> n_src_context
  n_src_components --> n_src_hooks
  n_src_components --> n_src_utils
  n_src_context --> n_src_utils
  n_src_hooks --> n_src_api
  n_src_hooks --> n_src_types
  n_src_hooks --> n_src_utils
  n_src_store --> n_src_utils
  n_src_utils --> n_src_store
  n_src_utils --> n_src_types
```

## Standalone modules (3)

Folders with no cross-folder imports — self-contained (e.g. individual Lambdas, scripts, leaf utilities).

- `infra/lambda/api`
- `infra/lambda/collector`
- `infra/lambda/proxy`

## Cross-refs

- [`INDEX.md`](../INDEX.md)

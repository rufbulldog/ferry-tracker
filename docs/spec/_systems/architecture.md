---
type: l3-system
spec_version: 1
name: architecture
discovered_from: code-graph + repo config
resource_count: 14
extractor_version: 1.0.1
renderer_version: 1.0.1
last_audited: 2026-06-23T02:46:19.271Z
---

# Architecture overview — System Spec

Repo-level view of how the source folders depend on each other, aggregated from the import graph. An arrow A → B means a file in A imports a file in B.

## Module dependency graph

```mermaid
flowchart LR
  n_app["app"]
  n_app_tabs["app/(tabs)"]
  n_infra_bin["infra/bin"]
  n_infra_lambda_api["infra/lambda/api"]
  n_infra_lambda_collector["infra/lambda/collector"]
  n_infra_lambda_proxy["infra/lambda/proxy"]
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

## Cross-refs

- [`INDEX.md`](../INDEX.md)

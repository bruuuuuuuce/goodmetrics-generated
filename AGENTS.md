# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project

Generated TypeScript/gRPC client code from the goodmetrics protobuf definitions in `proto/`.
Published to npm as `goodmetrics-generated` and consumed by `goodmetrics-nodejs` and other
clients. Most of `src/` is machine-generated — see "Generated code" below before editing anything
under it.

## Commands

```bash
./install_protoc.sh   # installs protoc — Linux/apt only, this is what CI runs; on macOS install
                       # protoc yourself (e.g. `brew install protobuf`) and skip this script
npm i -g protoc-gen-js
npm ci
npm run build          # rm -rf dist, runs generate.ts (protoc) into src/, then tsc
```

There's no real `test` script (`npm test` just exits 1, it's a placeholder).

## Generated code — don't hand-edit

- `proto/**/*.proto` is the actual source of truth (currently copy-pasted from the upstream
  [goodmetrics](https://github.com/kvc0/goodmetrics) repo — see README for the long-term plan to
  consolidate this).
- `generate.ts` invokes `protoc` + `protoc-gen-ts` to regenerate everything under `src/` from
  those proto files. Anything under `src/` is overwritten on every build — never hand-edit
  generated `.ts`/`.js` files there; change the `.proto` source or `generate.ts` instead.
- `index.ts` at the repo root is the one hand-written entry point (re-exports from generated
  code) and is copied into `src/` during build.

## TypeScript / Node conventions

- `strict` is deliberately **off** in `tsconfig.json` (see the comment there) because the
  generated protobuf descriptor code doesn't type-check cleanly under strict mode and TS has no
  per-file strictness escape hatch that fits here. Don't turn it on repo-wide; if you add genuinely
  hand-written code, still write it as if strict mode applied (explicit types, no implicit `any`).
- This repo is pinned to older tooling than sibling repos (Node 16 types, TypeScript 4.9.5, Node 16
  in CI). Before bumping any dependency (including via Dependabot), confirm the new version's
  shipped types still parse under TypeScript 4.9 — a too-new package can ship `.d.ts` syntax that
  an older `tsc` can't parse, which breaks the build silently until you actually run
  `npx tsc --noEmit`. Don't rely on `npm install` succeeding as a signal that a bump is safe.
- Prefer `async`/`await`, single quotes, and no unused vars in any hand-written (non-generated)
  code, consistent with the rest of the goodmetrics-nodejs ecosystem.

## Commit messages: Conventional Commits (required, not just style)

This repo uses `release-please` to automate versioning/changelogs from commit history on `main`.
The commit type on `main` (i.e. the squash-merge commit message, if PRs are squashed) directly
determines the version bump:

- `fix: ...` → patch bump
- `feat: ...` → minor bump (pre-1.0, `bump-minor-pre-major: true` is set in the workflow)
- `feat!: ...` or a `BREAKING CHANGE:` footer → major-equivalent bump
- `chore:`, `docs:`, `refactor:`, `test:`, `ci:` → no version bump

## Release / publish gotchas

- `package.json`'s `version` is managed by release-please's release PRs — don't hand-edit it.
- `package.json` has a `repository` field pointing at
  `git+https://github.com/bruuuuuuuce/goodmetrics-generated.git` — keep it accurate. It's not
  currently required by this repo's publish workflow (still the older `NPM_TOKEN`-based auth, not
  OIDC/provenance), but if this workflow is ever modernized the way `goodmetrics-nodejs`'s was, a
  missing/wrong `repository` field will fail `npm publish` with `E422` (provenance verification).
- The committed `.npmrc` pins `registry=https://registry.npmjs.org/` so installs are consistent
  regardless of local/global npm registry overrides — don't remove it.
- `.github/workflows/publish.yml` still uses `release-please-action@v3`, `actions/checkout@v2`,
  and `actions/setup-node@v1` — noticeably older than `goodmetrics-nodejs`'s workflow. If you're
  asked to modernize it, mirror that repo's pattern (split `release`/`publish` jobs, OIDC trusted
  publishing) rather than inventing a new approach.

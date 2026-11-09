# Changelog

All notable changes to this project are documented in this file.

## [0.2.0] - 2026-10-30

### Changed
- **BREAKING:** package renamed from `@indiciopbc/degov-interpreter-typescript` to
  `@indicio-tech/degov-interpreter-typescript`, and now published to GitHub Packages.
  Update your dependency name, imports and `.npmrc` scope registry.

### Security
- Upgraded transitive dependencies, reducing `yarn audit` findings from 261
  (13 critical, 157 high) to 2 low (`deepmerge` via jest, no patched version
  available). All affected packages are dev dependencies and are not part of the
  published build output.

### Added
- Release workflow publishing tagged versions to GitHub Packages with a
  checksummed GitHub Release.
- Test workflow (Node 20 and 22) and expanded test suite (9 to 34 tests).
- Dependabot configuration for npm and GitHub Actions.

## [0.1.0]

- Initial release.

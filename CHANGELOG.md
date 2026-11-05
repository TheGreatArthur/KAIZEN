# Changelog

All notable changes to this project are documented here. Format: [Keep a Changelog](https://keepachangelog.com/), versioning: [SemVer](https://semver.org/).

## [Unreleased]

### Added
- Home page with script cards (hiragana progress bar, katakana/kanji "coming soon") and a "Resume" block.
- Hiragana hub with Course (coming soon), Reading and Calligraphy cards and per-exercise stats.
- Reading exercise reproducing the Tofugu kana quiz: column selector, auto-validating card grid, results screen.
- Calligraphy exercise: KanjiVG stroke-order animation, brush canvas (Pointer Events), model & guided modes, rule-based stroke matcher with easy/normal/strict tolerance.
- Complete hiragana data (46 main kana, 25 dakuten/handakuten, 33 combinations) and KanjiVG SVGs.
- Repository layer (static characters, localStorage progress & preferences) behind a single container.
- Unit tests (Vitest), CI workflow, ADRs and future database schema (`docs/DATABASE.md`).

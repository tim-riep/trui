# Changelog

All notable changes to `@tim-riep/trui` are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `TruiProvider` with theme (light, dark, system), density (compact, comfortable),
  locale with writing direction and time zone, text packages in English and German,
  icon registry and a container for overlays; nested providers inherit what they
  do not set. Hooks `useTheme`, `useDensity`, `useLocale`, `useText`, `useFormat`,
  `useIcon`; `IconProvider` and `Portal`.
- Design tokens as CSS custom properties, the Inter typeface and base styles in one
  stylesheet `@tim-riep/trui/styles.css`.
- Icon set of 53 icons, one module each (`@tim-riep/trui/icons/<name>`), and
  `defineIcon` for own icons.
- Components `Button`, `Icon`, `Label`, `Text` and `TextField`.
- Core utilities for exact decimals, dates, times and timestamps, localized input,
  form integration and positioning of floating elements.

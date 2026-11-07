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
- Overlays and feedback: `Popover`, `Menu` and `MenuButton` with submenus, `Banner`,
  toasts and message dialogs through `useToast` and `useMessageDialog` shown by
  `FeedbackHost`, `MessageDialog`, `MessageList` and `MessagesButton`.
- Inputs `TextArea`, `NumberField` and `AmountField` (exact decimals), `DatePicker`,
  `TimePicker`, `DateTimePicker`, `Calendar`, `Checkbox`, `Switch`, `RadioGroup`, `Select`,
  `ComboBox` (fixed or loaded options), `MultiSelect`, `FileInput`, `LookupField` and
  `LookupDialog`; form layout with `Form`, `FormGroup` and `FormField`; `Dialog`.
- Components `Link`, `Title`, `Tag`, `Badge`, `Avatar`, `Spinner` and `ProgressBar`;
  decorative color tokens for avatars.
- Build for browsers without bundler (`npm run build:browser`): fixed entry points
  `trui.js`, `core.js`, `icons.js`, `trui.css` and React under `vendor/`, all other files
  with content hash.
- The go-runtime package `TRUI` (`npm run build:package`) with the asset repository `lib`
  and the anonymous service node `/trui/lib`, and a demo page.
- Module federation example with host and remote sharing React and the library.
- Core utilities for exact decimals, dates, times and timestamps, localized input,
  form integration and positioning of floating elements.

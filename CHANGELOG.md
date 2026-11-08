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
- Icon set, one module per icon (`@tim-riep/trui/icons/<name>`), and
  `defineIcon` for own icons.
- Components `Button`, `Icon`, `Label`, `Text` and `TextField`.
- Examples in the catalog: a business page (list with filter bar, detail page with form)
  and a home page in the shell that opens it; foundations pages for type, spacing and
  density; the catalog can be part of the go-runtime package (`build:package:catalog`).
- Visual regression tests of the catalog in both themes and densities, made in the
  Playwright container.
- Home page and shell: `Tile`, `MetricTile` (exact figures with scaling, trend and
  rating) and `ContentTile`, `TileGroup` and `TileGroups` with a jump bar, `ShellHeader`
  with search, notifications, area switch and user menu, `NotificationPanel`,
  `SettingsDialog` and `ShellLayout`; the icon set grows to 163 icons in eleven categories.
- `ShellLayout` mounts the application when it is opened first.
- Disabled tiles are always disabled buttons.
- `ComboBox` takes `startContent` and can hide its list button (`showButton`).
- Data: `Table` with sorting (exact for decimals), single and multiple selection with
  ranges, row actions, resizable columns, loading and empty states, rows given as array
  or loaded page by page, rendering of visible rows only and grid keyboard navigation
  with editable cells; `List` with selection, navigation and loading more.
- Layout and navigation: `Page` and `PageHeader` with a title row that stays while the
  facts scroll away, `Breadcrumbs`, `Toolbar` with an overflow menu, `Panel`, `Card`,
  `Tabs`, `SplitLayout`, `SideNavigation` and `AppHeader`; icons `pin` and `sidebar`.
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

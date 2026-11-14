# Changelog

All notable changes to `@tim-riep/trui` are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.0] - 2026-11-14

### Added

- `CommandPalette`: a search for commands and places of an application, opened with
  Ctrl+K or Command+K, with groups, keywords, shortcuts and disabled commands.
- `ColumnChooser` and the `hiddenColumns` prop of `Table` to show and hide columns.
- `FilterChips`: the active filters of a list or table, each removable, and a button that
  removes all of them.
- `EmptyState`: tells that there is nothing to show and offers the next step. `Table`
  shows it when it has no rows and no `renderEmpty`.
- `useUnsavedChanges` in the core: asks before the page is closed while there are unsaved
  changes, and asks in a message dialog before the application leaves the view.
- `DatePicker` reads dates relative to today: the words for today, tomorrow and yesterday
  of the language, and `+3`, `-1w`, `+2m`, `+1y`; its calendar has a button for today
  (`showToday` of `Calendar`). The core exports `parseRelativeDate`.
- Toasts show a line that runs down until they disappear and stops while they are paused.
- On screens narrower than 600 pixels, the lists of `Select`, the calendars of
  `DatePicker`, the lists of `TimePicker`, menus and popovers slide up from the bottom
  edge as a sheet.
- Sortable table columns show a faint sort icon on hover and focus.
- `MetricTile` takes `trendLabel`, a short text next to the trend, and `history`, earlier
  values drawn as a line above the figure.
- `Form` takes `actions`, buttons that stay in view at the bottom while the form scrolls,
  and `groupAppearance="card"`, which puts each group on a card.
- Tokens `--trui-duration-slow`, `--trui-easing-exit`, `--trui-lift`, `--trui-enter-scale`,
  `--trui-focus-halo-width`, `--trui-shadow-focus` and `--trui-letter-spacing-heading`.

### Changed

- Refreshed look: larger radii, softer layered shadows, cooler neutrals and an indigo
  accent. Secondary buttons are white with a fine border; fields show a soft halo on
  focus; cards, tiles, panels and tables lift slightly on hover; options and menu items
  are rounded; tile icons sit on a tinted square; page titles are larger.
- Dialogs, popovers and toasts fade and scale in; dialogs blur the page behind them.
  All motion is off with `prefers-reduced-motion`.
- Breadcrumb links are underlined only on hover.
- `Form` puts labels above the fields by default; `labelPosition="auto"` keeps the former
  behavior of labels beside the fields when a group is wide enough.
- The icon of a `Tile` stands above its title.
- A toast with an action stays 8 seconds by default instead of 5, so that there is time
  to undo.

### Fixed

- `Dialog` and the dialogs built on it, such as the dialog of `LookupField`, are visible in
  Safari: their frame had a height of 0 there, so only the backdrop showed.
- A `Toolbar` in the actions of a `PageHeader` shows its actions as buttons; it had moved
  all of them into its overflow menu because it got no width.

## [0.1.0] - 2026-11-08

First version.

### Added

- License documentation: `NOTICE` and `THIRD_PARTY_NOTICES.md` with the full texts of the
  distributed third-party licenses (Inter under OFL 1.1; React, React DOM, Scheduler and
  Rolldown helpers under MIT), shipped with the npm package and the package TRUI;
  `npm run check:licenses`.
- GitHub Actions for checks, tests in three browsers, story tests with axe, the module
  federation, package and visual tests, and releases from tags; Dependabot updates.
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

[Unreleased]: https://github.com/tim-riep/trui/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/tim-riep/trui/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/tim-riep/trui/releases/tag/v0.1.0

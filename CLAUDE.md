# Rules for working on TRUI

These rules apply to every change in this repository.

## Language

- Everything in the repository is English: code, identifiers, comments, documentation,
  examples, stories, test names and commit messages.
- Do not use the terminology of other vendors' enterprise software or UI products anywhere
  in the repository or in commit messages, not even as comparison. This covers product,
  framework and language names as well as their characteristic control names; it applies
  to dependencies, package names, CSS classes, tokens and icon names too. Do not add a
  dependency whose name contains such a term. Use neutral terms (shell header, metric
  tile, lookup field, banner, message dialog).
- The list of banned terms is kept outside the repository (default
  `~/.config/trui/banned-terms.txt`, or the path in `TRUI_BANNED_TERMS`). Before every
  commit, search the changed files and the commit message for those terms, ignoring case:
  `npm run check:terms` (the git hooks in `.githooks/` do this automatically).

## License

- Apache License 2.0. Every source file (TypeScript, JavaScript, CSS, HTML templates,
  scripts) starts with the license header; `npm run check:headers` verifies it.
- Third-party code or assets that are distributed (bundled into a build or shipped as
  file) are listed in `THIRD_PARTY_NOTICES.md` with their full license text and named in
  `NOTICE`. Only permissive licenses are acceptable for distributed parts.
- `npm run check:licenses` checks the licenses of all installed packages and that every
  package bundled into the browser build is listed. Run it after adding a dependency.

## Architecture

- React function components and hooks only; `react` and `react-dom` are peer dependencies.
- No runtime dependencies. Every new runtime dependency needs a written justification and
  approval first. Development dependencies are kept small.
- Global state lives only in React contexts (theme, density, locale, texts, icons, overlays,
  toasts). No module-level mutable state. All contexts are defined in `src/core`.
- Components import the core only through the package name `@tim-riep/trui/core`, never by
  relative path, so the core can be shared as a singleton under module federation.
- Importing a module has no side effects; components do not import CSS. Styles are plain CSS
  in `@layer trui.*`, every class starts with `trui-`, every custom property with `--trui-`.
  Components use design tokens only, never literal colors, lengths or shadows.
- The public API follows semantic versioning; `etc/trui.api.md` is the API report and changes
  only together with an intended API change.

## Values

- `null` means "no value"; `""` is a value. Nothing converts one into the other. Inputs
  return `null` when cleared only with `nullable`, otherwise `""`; their prop types say so.
- Decimal values are canonical strings (`"1234.50"`), never JavaScript numbers. Dates are
  `YYYY-MM-DD`, times `HH:MM:SS`, timestamps UTC `YYYY-MM-DDTHH:MM:SS.ffffffZ`.
- Texts of the library come from text packages (`src/core/texts`), never inline literals.

## API conventions

- Props type `<Name>Props`, named exports, no default exports.
- Controlled and uncontrolled pairs: `value`/`defaultValue`, `open`/`defaultOpen`,
  `selectedKeys`/`defaultSelectedKeys`. Callbacks `on<Event>` receive the value first:
  `onChange(value, event)`.
- Booleans without `is` prefix (`disabled`, `readOnly`, `required`). Named content as
  `ReactNode` props (`header`, `actions`), render props as `render<Part>`.
- `className` and `style` go to the outermost element, `ref` to the relevant DOM element.
- Value state: `valueState` (`none`, `error`, `warning`, `success`, `information`) and
  `valueStateMessage`.

## Work style

- Plan non-trivial changes and present the plan before writing code.
- Every milestone ends with green checks and tests (`npm run check`, `npm test`) and an
  updated catalog.

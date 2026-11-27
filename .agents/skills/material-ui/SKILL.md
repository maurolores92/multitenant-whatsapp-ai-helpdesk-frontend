---
name: material-ui
description: Enforces the use of Material-UI (MUI) for all UI components and styling in the project. Use this skill when building user interfaces.
---

# Material-UI (MUI) Standards

- **Always use Material-UI (MUI)** for building the user interface.
- Do not use native HTML elements (like `<button>`, `<input>`, `<div>`) when a suitable MUI equivalent exists (`<Button>`, `<TextField>`, `<Box>`, `<Stack>`).
- For layout and spacing, prefer using MUI's `<Box>`, `<Stack>`, or `<Grid>` components.
- Do not use TailwindCSS or raw CSS files for styling unless strictly necessary; use MUI's `sx` prop or styled-components API for custom styles.
- When creating forms with `react-hook-form`, always wrap MUI inputs with the `<Controller>` component.
- Ensure all icons are imported from `@mui/icons-material`.

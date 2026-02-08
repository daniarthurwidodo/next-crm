# Styles & Component Guidelines

This file contains the minimal, pragmatic styling guidance for small UI components used across the app (forms, inputs, selects, small cards).

## Purpose
- Provide a single source of truth for how basic form fields should look and behave.
- Keep implementations accessible and consistent.

## Tokens (suggested)
- Neutral border: `#d1d5db`
- Focus ring: `rgba(59,130,246,0.4)` (blue 500 at 40% alpha)
- Radius: `6px`
- Field padding: `8px 10px`

## Inputs & Selects
- Visual
  - `border: 1px solid #d1d5db;`
  - `padding: 8px 10px;`
  - `border-radius: 6px;`
  - `box-sizing: border-box; width: 100%;`
  - On focus: add an outline or box-shadow using the focus ring token for accessibility.

- Accessibility
  - Always provide a descriptive `<label for="...">` and match with input `id`.
  - Use `aria-invalid="true"` on invalid fields and an `aria-describedby` that points to the validation message element.

## Form Grid
- Default layout for small forms: two-column grid.

CSS example:

```css
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-grid .full-row {
  grid-column: 1 / -1;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
```

React example (inline styles used in small components):

```tsx
const inputStyle = {
  width: '100%',
  border: '1px solid #d1d5db',
  padding: '8px 10px',
  borderRadius: 6,
  boxSizing: 'border-box',
};

return (
  <form style={{ maxWidth: 600 }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div>
        <label>Email</label>
        <input style={inputStyle} />
      </div>
      <div>
        <label>Plan</label>
        <select style={inputStyle} />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <label>Password</label>
        <input style={inputStyle} />
      </div>
    </div>
  </form>
)
```

## Validation patterns
- Mirror server-side validation on the client. Use `zod` for client schemas to ensure consistent rules between UI and API.
- Show inline messages near fields and an optional summary block above the form for multiple errors.

## Buttons
- Use existing `Button` component for primary/secondary states. Buttons should respect disabled state visually.

## When to extract to CSS
- Small components may use inline styles for quick implementations, but shared tokens and repeated patterns should be moved into CSS modules or a design system when the project scales.

## Notes
- Keep accessibility first: labels, focus states, and clear error messages.
- If you change these rules, update `docs/styles.md` and any components that reference them.

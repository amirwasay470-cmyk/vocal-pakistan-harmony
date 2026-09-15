# Fix header and navigation layout

## What will change
- Split the sticky header into two clear rows: branding and accessibility controls above, navigation tabs below.
- Keep the logo, title, portal badge, subtitle, and eyeglass control aligned without collisions at narrow widths.
- Make the tab row independently horizontally scrollable on smaller screens, with stable button sizing and readable labels.
- Preserve the existing active-tab behavior, colors, ticker, and mobile bottom navigation.

## Responsive behavior
- Use a two-column grid for the branding row so text can shrink safely while the eyeglass control stays fixed.
- Let the title and subtitle truncate cleanly where space is limited; move the portal badge beneath the title on compact screens.
- Keep all six tabs on one dedicated row with touch-friendly spacing and no overlap.

## Verification
- Check the header at mobile, tablet, and desktop widths.
- Confirm every tab remains clickable, active states remain visible, and no text or controls overlap.
- Confirm type checking and the preview build remain error-free.

## Technical details
- Update only `src/routes/index.tsx` unless a small shared style adjustment is required.
- Use responsive grid/flex utilities with `min-w-0`, `shrink-0`, and overflow containment.

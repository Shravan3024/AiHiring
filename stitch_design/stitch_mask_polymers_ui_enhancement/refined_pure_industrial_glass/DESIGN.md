---
name: Industrial Glass
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf6'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dde9ff'
  surface-container-highest: '#d3e3ff'
  on-surface: '#0b1c30'
  on-surface-variant: '#434654'
  inverse-surface: '#213146'
  inverse-on-surface: '#ebf1ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#1155d0'
  primary: '#003b9a'
  on-primary: '#ffffff'
  primary-container: '#0050cb'
  on-primary-container: '#c1cfff'
  inverse-primary: '#b3c5ff'
  secondary: '#50616b'
  on-secondary: '#ffffff'
  secondary-container: '#d0e2ee'
  on-secondary-container: '#54656f'
  tertiary: '#003b9a'
  on-tertiary: '#ffffff'
  tertiary-container: '#0050cb'
  on-tertiary-container: '#c2cfff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#001849'
  on-primary-fixed-variant: '#003fa4'
  secondary-fixed: '#d3e5f1'
  secondary-fixed-dim: '#b7c9d5'
  on-secondary-fixed: '#0c1e26'
  on-secondary-fixed-variant: '#384953'
  tertiary-fixed: '#dae1ff'
  tertiary-fixed-dim: '#b3c5ff'
  on-tertiary-fixed: '#001849'
  on-tertiary-fixed-variant: '#003fa4'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e3ff'
  industrial-bg: '#F0F4F8'
  glass-border: rgba(255, 255, 255, 0.4)
  glass-fill: rgba(255, 255, 255, 0.5)
  status-success: '#22C55E'
  status-warning: '#F59E0B'
  status-error: '#BA1A1A'
typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 52px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h1-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h3:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  nav-item:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
  mono-data:
    fontFamily: Space Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 48px
  xxl: 80px
  container-margin: 3rem
  sidebar-width: 20rem
---

## Brand & Style
The brand identity for "Mask Polymers" is a fusion of precision engineering and modern clarity. It targets a professional, technical audience within the advanced manufacturing and chemical industries.

The visual style is **Industrial Glassmorphism**. It combines the clinical, structured feel of an industrial dashboard with the ethereal, high-end aesthetics of modern SaaS. The UI evokes feelings of transparency, technical superiority, and organized efficiency. Key characteristics include:
- **Atmospheric Depth:** Using highly blurred, tinted background textures to create a sense of environmental space.
- **Precision Accents:** High-contrast blue elements that draw the eye to active technical statuses.
- **Glass Surfaces:** Semi-transparent panels with backdrop filters that suggest a "heads-up display" layered over a laboratory or factory floor.

## Colors
The color palette is anchored in "Polymer Blue" and "Slate Steel," reflecting a technical and dependable environment.

- **Primary Blue (#0050CB):** Used for core actions and primary navigation states. It represents authority and precision.
- **Tertiary Cyan (#0066FF):** A more vibrant blue used for progress indicators and interactive "active" highlights.
- **Secondary Slate (#50616B):** Used for supporting text and neutral UI elements to maintain a professional, subdued tone.
- **Industrial White/Glass:** Surfaces are not solid but rather composite layers of white with varying opacities and backdrop blurs, allowing the underlying "industrial" background textures to bleed through subtly.

## Typography
The typography system uses a high-contrast pairing of **Space Grotesk** and **Inter**.

- **Space Grotesk** is reserved for headlines, navigation items, and technical data. Its geometric and slightly technical letterforms reinforce the "Industrial" part of the brand.
- **Inter** is used for all body copy and secondary labels. It provides the necessary neutrality and high legibility required for dense dashboard information.
- **Hierarchy:** Use all-caps with generous letter spacing (tracking) for "utility" labels and meta-data to create a distinct visual layer from standard body text.

## Layout & Spacing
The system utilizes a **Fixed-Sidebar Fluid-Canvas** model.

- **Sidebar:** A fixed-width (80/320px) navigation rail on the left.
- **Canvas:** A fluid main area that responds to browser width, utilizing a 12-column grid system for internal dashboard components.
- **Gutter & Margins:** Standardized 40px (p-10) or 48px (p-12) padding for primary sections to ensure a luxurious sense of space and high readability.
- **Responsive Behavior:** On tablet, the sidebar may collapse into a drawer. On mobile, all glass panels stack vertically with 24px margins.

## Elevation & Depth
Depth is created through the **Glassmorphism** stack rather than traditional drop shadows.

- **Base Layer:** The "Industrial-BG" containing a blurred, low-opacity image.
- **Middle Layer (Panels):** Semi-transparent white (50% opacity) with a 24px backdrop blur. This layer uses a subtle 1px white border (40% opacity) to define edges without adding visual weight.
- **Top Layer (Interactive):** Elements like buttons or active chips use "Ambient Shadows" (e.g., `shadow-primary/25`) where the shadow color matches the element's hue to simulate a glowing effect rather than a physical shadow.

## Shapes
The shape language is consistently rounded to soften the technical nature of the UI.

- **Primary Containers:** 1rem to 1.5rem (rounded-2xl) for large sections and cards.
- **Interactive Elements:** 0.75rem (rounded-xl) for buttons, input fields, and navigation items.
- **Indicators:** Circular (full) for status dots and profile images.
- **Borders:** Use thin, low-opacity borders exclusively. Avoid heavy or high-contrast borders unless used for specific high-alert error states.

## Components

- **Buttons:** Primary buttons use a solid blue fill with white text and a matching blue ambient shadow. Secondary buttons utilize the glass effect with high-contrast text.
- **Glass Panels:** The core container. Must feature `backdrop-filter: blur(24px)` and a linear-gradient fill from 50% to 20% white.
- **Navigation Items:** Use `Space Grotesk` uppercase. Active states are marked with solid fills and shadows; hover states utilize a subtle white/40 background shift.
- **Input Fields:** Semi-transparent white backgrounds with internal search icons and 0.75rem corner radii. Focus states use a subtle 2px glow in the primary color.
- **Progress Pipelines:** Linear tracks with circular nodes. Completed steps are solid; active steps feature a "pulse" animation.
- **Document Chips:** Feature a high-contrast icon (e.g., red for PDF) on a soft background, paired with bold filenames and meta-data in a compact vertical stack.
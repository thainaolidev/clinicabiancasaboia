# Component adaptations

This site remains standalone HTML/CSS/JavaScript, not a React/shadcn application. The shadcn CLI was not run against this static folder.

- Navigation: adapted from the React Bits PillNav source supplied by the user. Uses the same circle geometry, paused GSAP timelines, label transitions and mobile popover. Logo sizing preserves the full clinic wordmark. Keyboard focus, menu dismissal, active-section tracking and reduced-motion handling are included. React routing and decorative logo rotation were omitted for this single-page site.
- FAQ: adapted from `https://registry.watermelon.sh/r/faq-4.json`, retrieved on 2026-10-01. Retains its alternating two-column layout, header, optional action, rounded panels and open-state accent. Native `details`/`summary` replaces React/shadcn Accordion for standalone compatibility. Single-open behavior and mobile reading order are preserved.
- GSAP 3.13.0 is loaded from jsDelivr. The menu and FAQ remain usable without GSAP; animated hover requires the CDN to load.

Sources: https://reactbits.dev/components/pill-nav and https://registry.watermelon.sh/r/faq-4.json

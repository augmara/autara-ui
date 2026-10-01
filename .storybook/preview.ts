import type { Preview } from "@storybook/react-vite";
import "./storybook.css";

/**
 * Global preview config — applies to every story.
 *
 * - Backgrounds: paper by default (canvas v44), with band, dark paper
 *   and brand deep for component states that need them.
 * - Viewports: phone-first defaults plus tablet + desktop breakpoints
 *   matching customer-web's Tailwind ramp (sm 640, md 768, lg 1024).
 * - a11y addon runs axe-core against every story.
 */

const preview: Preview = {
  // AUTM-734 — theme toolbar. Stamps `data-theme` on <html>, exactly how
  // consuming apps switch themes, so every story renders in both modes.
  decorators: [
    (Story, context) => {
      const theme =
        (context.globals as { theme?: string }).theme === "dark"
          ? "dark"
          : "light";
      document.documentElement.setAttribute("data-theme", theme);
      return Story();
    },
  ],
  globalTypes: {
    theme: {
      description: "Autara color theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  parameters: {
    layout: "padded",
    backgrounds: {
      // AUTM-1594: canvas v44's grounds. Paper is the page, band the cards.
      default: "Paper",
      values: [
        { name: "Paper", value: "#FFFFFF" },
        { name: "Band", value: "#F4F2EC" },
        { name: "Paper, dark", value: "#0E0A1A" },
        { name: "Brand deep", value: "#2E1070" },
      ],
    },
    viewport: {
      viewports: {
        phoneSmall: {
          name: "iPhone SE",
          styles: { width: "375px", height: "667px" },
          type: "mobile",
        },
        phone: {
          name: "iPhone 14",
          styles: { width: "390px", height: "844px" },
          type: "mobile",
        },
        phoneLarge: {
          name: "iPhone 17 Pro Max",
          styles: { width: "440px", height: "956px" },
          type: "mobile",
        },
        tablet: {
          name: "iPad",
          styles: { width: "768px", height: "1024px" },
          type: "tablet",
        },
        desktop: {
          name: "Desktop",
          styles: { width: "1280px", height: "800px" },
          type: "desktop",
        },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // Storybook 10 a11y addon — runs axe against every story.
      element: "#storybook-root",
      config: {},
      options: {},
    },
  },
  tags: ["autodocs"],
};

export default preview;

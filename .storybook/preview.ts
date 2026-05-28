import type { Preview } from "@storybook/react-vite";
import "./storybook.css";

/**
 * Global preview config — applies to every story.
 *
 * - Backgrounds: Autara warm-cream surface by default, with surface-warm
 *   and dark options for component states that need them.
 * - Viewports: phone-first defaults plus tablet + desktop breakpoints
 *   matching customer-web's Tailwind ramp (sm 640, md 768, lg 1024).
 * - a11y addon runs axe-core against every story.
 */

const preview: Preview = {
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "Background (warm cream)",
      values: [
        { name: "Background (warm cream)", value: "#FBFAF6" },
        { name: "Surface (white)", value: "#FFFFFF" },
        { name: "Surface elevated", value: "#F4F2EC" },
        { name: "Dark (marketing hero)", value: "#0E0A1A" },
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

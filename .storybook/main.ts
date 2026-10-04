import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

/**
 * AUTM-1724 — Satoshi in Storybook, without the font files in this repo.
 *
 * This repository is public and Satoshi's licence forbids making the files
 * available to anyone else, so the package ships no fonts and no @font-face.
 * Stories render in the system stack that follows "Satoshi" in --font-brand.
 *
 * To preview in Satoshi locally, put your own copy of Fontshare's official
 * WOFF2 files in `.storybook/local-fonts/` (gitignored), for example the
 * copy a private Autara app already self-hosts. `storybook dev` then serves
 * that folder and declares the faces. `storybook build` NEVER does, whatever
 * is on disk, so the static Storybook (deployed by vercel.json) carries no
 * font file and stays on the system stack.
 */
const LOCAL_FONTS = fileURLToPath(new URL("./local-fonts", import.meta.url));
const FACES: Array<[weight: number, file: string]> = [
  [400, "Satoshi-Regular.woff2"],
  [500, "Satoshi-Medium.woff2"],
  [700, "Satoshi-Bold.woff2"],
  [900, "Satoshi-Black.woff2"],
];

const localFacesFor = (configType?: string) =>
  configType === "DEVELOPMENT" && existsSync(LOCAL_FONTS)
    ? FACES.filter(([, file]) => existsSync(`${LOCAL_FONTS}/${file}`))
    : [];

const config: StorybookConfig = {
  staticDirs: (dirs = [], options) =>
    localFacesFor(options.configType).length > 0
      ? [...dirs, { from: LOCAL_FONTS, to: "/local-fonts" }]
      : dirs,
  previewHead: (head = "", options) => {
    const faces = localFacesFor(options.configType);
    if (faces.length === 0) return head;
    const rules = faces
      .map(
        ([weight, file]) =>
          `@font-face{font-family:"Satoshi";src:url("/local-fonts/${file}") format("woff2");font-weight:${weight};font-style:normal;font-display:swap}`,
      )
      .join("");
    return `${head}<style>${rules}</style>`;
  },
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../docs/**/*.mdx",
  ],
  addons: [
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
  ],
  typescript: {
    check: false,
    reactDocgen: "react-docgen-typescript",
  },
  // Tailwind v4 is wired via the @tailwindcss/vite plugin in viteFinal.
  // Storybook's bundled Vite picks it up automatically.
  async viteFinal(config) {
    const tailwindcss = (await import("@tailwindcss/vite")).default;
    config.plugins = config.plugins ?? [];
    config.plugins.push(tailwindcss());
    return config;
  },
};

export default config;

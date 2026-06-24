// Loads the @testing-library/jest-dom matcher augmentation into the TypeScript
// program so `tsc` (build + typecheck) sees matchers like `toBeInTheDocument`
// on vitest's `expect`. The runtime registration lives in `vitest.setup.ts`
// (referenced by vitest.config.ts), but that file sits outside `tsconfig`'s
// `include: ["src/**"]`, so without this src-scoped re-import the matcher
// types are missing and every *.test.tsx assertion errors under tsc.
import "@testing-library/jest-dom/vitest"

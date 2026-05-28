/**
 * BrandButton — alias for `Button`.
 *
 * The v1.1.0-alpha `BrandButton` was identical in role to the canonical
 * `Button`; they've been merged into a single implementation. This file
 * exists only for backwards compat with consumers (e.g. autara-merchant-mobile's
 * SignInScreen) that already imported `BrandButton` from the package's
 * v1.1.0 preview tarball.
 *
 * New code should import `Button` directly.
 */

export {
  Button as BrandButton,
  type ButtonProps as BrandButtonProps,
  buttonVariants as brandButtonVariants,
} from "./Button";

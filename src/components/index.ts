export { GradientBar } from './GradientBar'
export { Button, buttonVariants, type ButtonProps } from './Button'
export { Input, inputVariants, type InputProps } from './Input'
export { OtpInput, type OtpInputProps } from './OtpInput'
export {
    PhoneInput,
    DEFAULT_COUNTRIES,
    findCountryByIso,
    type PhoneInputProps,
    type PhoneCountry,
} from './PhoneInput'
export { Textarea, textareaVariants, type TextareaProps } from './Textarea'
export { Label, labelVariants, type LabelProps } from './Label'
export { FormField, type FormFieldProps } from './FormField'
export {
    FieldStack,
    FieldStackRow,
    FieldStackField,
    type FieldStackFieldProps,
} from './FieldStack'
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants, type CardProps } from './Card'
export { Badge, badgeVariants, type BadgeProps } from './Badge'
export { Separator } from './Separator'
export { Skeleton } from './Skeleton'

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from './Dialog'

export {
    Sheet,
    SheetPortal,
    SheetOverlay,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
} from './Sheet'

export {
    PickerSheet,
    type PickerOption,
    type PickerRowRender,
    type PickerSheetProps,
} from './PickerSheet'

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from './DropdownMenu'

export {
    navigationMenuTriggerStyle,
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuContent,
    NavigationMenuTrigger,
    NavigationMenuLink,
    NavigationMenuIndicator,
    NavigationMenuViewport,
} from './NavigationMenu'

export { ScrollReveal, type ScrollRevealProps } from './ScrollReveal'
export { FadeIn, FadeInView, ScaleIn, StaggerContainer, StaggerItem } from './MotionDiv'

export { ToastProvider, useToast, toast, type Toast, type ToastType, type ToastPosition, type ToastVariant } from './Toast'

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
} from './Select'

export { Switch } from './Switch'
export { Checkbox } from './Checkbox'
export { RadioGroup, RadioGroupItem } from './Radio'
export { Avatar, AvatarImage, AvatarFallback, avatarVariants } from './Avatar'
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './Tooltip'
export { Progress } from './Progress'
export { MultiSelect, type MultiSelectOption, type MultiSelectProps } from './MultiSelect'

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
} from './Table'

// ─── v1.1.0 promotions from autara-customer-web ──────────────────────────
export { BrandButton, brandButtonVariants, type BrandButtonProps } from './BrandButton'
export { MetaChip, type MetaChipProps } from './MetaChip'
export { RatingStars, type RatingStarsProps } from './RatingStars'
export { EmptyState, type EmptyStateProps } from './EmptyState'
export { MerchantCard, type MerchantCardProps, type MerchantBadge } from './MerchantCard'
export { SectionHeading, type SectionHeadingProps } from './SectionHeading'
export { CarouselHeader, type CarouselHeaderProps } from './CarouselHeader'
export { ServiceCard, type ServiceCardProps } from './ServiceCard'
export { TrustItem, type TrustItemProps } from './TrustItem'
export { SectionBand, type SectionBandProps } from './SectionBand'
export { StepCard, type StepCardProps } from './StepCard'

// ─── v1.2.0 — async-surface primitives ───────────────────────────────────
export { KpiCard, type KpiCardProps } from './KpiCard'
export { AsyncSkeleton, type AsyncSkeletonProps } from './AsyncSkeleton'
export { ErrorCard, type ErrorCardProps } from './ErrorCard'

// ─── Chat / conversation primitives (AUTM-159) ───────────────────────────
export { MessageBubble, type MessageBubbleProps, type MessageSide } from './MessageBubble'
export { MessageComposer, type MessageComposerProps } from './MessageComposer'
export { MessageThread, type MessageThreadProps, type MessageItem } from './MessageThread'

// v1.3.0 introduced a standalone TrendingPill component for marker
// pills. AUTAA-UI-006 (v1.2.0+ — or whatever semantic-release picks)
// folded it into Badge via shape="parallelogram". The TrendingPill
// surface is gone — use the marker tones on Badge:
// `<Badge variant="purple" shape="parallelogram">Featured</Badge>`
// `<Badge variant="aqua"   shape="parallelogram">New</Badge>`
// `<Badge variant="lime"   shape="parallelogram">Trending</Badge>`
// Marker, status, and legacy tones all live on Badge.

// ─── v1.4.0 — merchant-mobile harvest ────────────────────────────────────
// Promoted from inline merchant-mobile components after the Phase 3
// scaffold pass surfaced 3-4 duplications of the same pattern.
export { StatsStrip, type StatsStripProps, type StatItem } from './StatsStrip'
export { InfoRow, type InfoRowProps } from './InfoRow'
export {
    ListSection,
    ListSectionRow,
    type ListSectionProps,
    type ListSectionRowProps,
} from './ListSection'
export { ModeChip, type ModeChipProps, type BookingMode } from './ModeChip'
export { Logo, type LogoProps } from './Logo'
export { SearchInput, type SearchInputProps } from './SearchInput'
export {
    FilterChipRow,
    type FilterChipRowProps,
    type FilterChipOption,
} from './FilterChipRow'

// ─── v2.1.0 — customer-web marketing harvest (AUTAA-UI-007) ────────────
// Promoted from autara-customer-web after the homepage refactor surfaced
// the same patterns about to show up on merchant-web and admin too.
export {
    CategoryRail,
    type CategoryRailProps,
    type CategoryRailItem,
} from './CategoryRail'
export { PWAInstallBanner, type PWAInstallBannerProps } from './PWAInstallBanner'
export {
    NavSearchPill,
    type NavSearchPillProps,
    type NavSearchPillField,
} from './NavSearchPill'
export {
    CompactSearchPill,
    type CompactSearchPillProps,
} from './CompactSearchPill'

// ─── Media — pick-then-crop dialog (AUTM-163) ──────────────────────────
export { ImageCropDialog, type ImageCropDialogProps } from './ImageCropDialog'

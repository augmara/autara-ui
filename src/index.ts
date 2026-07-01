// Components
export {
    GradientBar,
    Button, buttonVariants, type ButtonProps,
    Input, inputVariants, type InputProps,
    PhoneInput, DEFAULT_COUNTRIES, findCountryByIso, type PhoneInputProps, type PhoneCountry,
    Textarea, textareaVariants, type TextareaProps,
    Label, labelVariants, type LabelProps,
    FormField, type FormFieldProps,
    FieldStack, FieldStackRow, FieldStackField, type FieldStackFieldProps,
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants, type CardProps,
    Badge, badgeVariants, type BadgeProps,
    Separator,
    Skeleton,
    Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
    Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription,
    PickerSheet, type PickerOption, type PickerRowRender, type PickerSheetProps,
    Accordion, AccordionItem, AccordionTrigger, AccordionContent,
    Tabs, TabsList, TabsTrigger, TabsContent,
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
    navigationMenuTriggerStyle, NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport,
    ScrollReveal, type ScrollRevealProps,
    FadeIn, FadeInView, ScaleIn, StaggerContainer, StaggerItem,
    // New components
    ToastProvider, useToast, toast, type Toast, type ToastType, type ToastPosition, type ToastVariant,
    Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator,
    Switch,
    Checkbox,
    RadioGroup, RadioGroupItem,
    Avatar, AvatarImage, AvatarFallback, avatarVariants,
    Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
    Progress,
    MultiSelect, type MultiSelectOption, type MultiSelectProps,
    Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption,
    // v1.1.0 — promoted from autara-customer-web
    BrandButton, brandButtonVariants, type BrandButtonProps,
    MetaChip, type MetaChipProps,
    OtpInput, type OtpInputProps,
    RatingStars, type RatingStarsProps,
    EmptyState, type EmptyStateProps,
    MerchantCard, type MerchantCardProps, type MerchantBadge,
    SectionHeading, type SectionHeadingProps,
    CarouselHeader, type CarouselHeaderProps,
    ServiceCard, type ServiceCardProps,
    TrustItem, type TrustItemProps,
    SectionBand, type SectionBandProps,
    StepCard, type StepCardProps,
    // v1.2.0 — async-surface primitives
    KpiCard, type KpiCardProps,
    AsyncSkeleton, type AsyncSkeletonProps,
    ErrorCard, type ErrorCardProps,
    // v1.3.0 markers — TrendingPill was folded into Badge via
    // shape="parallelogram" by AUTAA-UI-006.
    // v1.4.0 — merchant-mobile harvest (StatsStrip, InfoRow, ListSection, ModeChip, Logo, SearchInput, FilterChipRow)
    StatsStrip, type StatsStripProps, type StatItem,
    InfoRow, type InfoRowProps,
    ListSection, ListSectionRow, type ListSectionProps, type ListSectionRowProps,
    ModeChip, type ModeChipProps, type BookingMode,
    Logo, type LogoProps,
    SearchInput, type SearchInputProps,
    FilterChipRow, type FilterChipRowProps, type FilterChipOption,
    // v2.1.0 — customer-web marketing harvest (AUTAA-UI-007)
    CategoryRail, type CategoryRailProps, type CategoryRailItem,
    PWAInstallBanner, type PWAInstallBannerProps,
    NavSearchPill, type NavSearchPillProps, type NavSearchPillField,
    CompactSearchPill, type CompactSearchPillProps,
    // chat / conversation primitives (AUTM-159)
    MessageBubble, type MessageBubbleProps, type MessageSide,
    MessageComposer, type MessageComposerProps,
    MessageThread, type MessageThreadProps, type MessageItem,
    // Media — pick-then-crop dialog (AUTM-163)
    ImageCropDialog, type ImageCropDialogProps,
    // Wizard step indicator (AUTM-322)
    Stepper, type StepperProps, type StepperStep,
} from './components'

// Utilities
export { cn } from './lib/cn'

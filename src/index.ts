// Components
export {
    GradientBar,
    Button, buttonVariants, type ButtonProps,
    Input, inputVariants, type InputProps,
    PhoneInput, DEFAULT_COUNTRIES, findCountryByIso, type PhoneInputProps, type PhoneCountry,
    Textarea, textareaVariants, type TextareaProps,
    Label, labelVariants, type LabelProps,
    FormField, type FormFieldProps,
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants, type CardProps,
    Badge, badgeVariants, type BadgeProps,
    Separator,
    Skeleton,
    Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
    Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription,
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
    // v1.3.0 — markers
    TrendingPill, trendingPillVariants, type TrendingPillProps, type TrendingPillShape, type TrendingPillTone, type TrendingPillSize,
} from './components'

// Utilities
export { cn } from './lib/cn'

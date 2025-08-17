import {
  FolderIcon,
  // Development Icons
  CodeBracketIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  CloudIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
  BoltIcon,
  CogIcon,
  // Creative Icons
  PaintBrushIcon,
  CameraIcon,
  PhotoIcon,
  FilmIcon,
  MusicalNoteIcon,
  SpeakerWaveIcon,
  SparklesIcon,
  HeartIcon,
  // Business Icons
  BriefcaseIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  TruckIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  KeyIcon,
  // Content Icons
  BookOpenIcon,
  DocumentTextIcon,
  NewspaperIcon,
  AcademicCapIcon,
  ChatBubbleLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  // General Icons
  HomeIcon,
  StarIcon,
  FireIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  ClockIcon,
  CalendarIcon,
  MapPinIcon,
  WifiIcon,
  BeakerIcon,
  TagIcon,
} from "@heroicons/react/24/outline"

// Icon mapping object
export const iconMap = {
  // Development
  "Code": CodeBracketIcon,
  "Computer": ComputerDesktopIcon,
  "Mobile": DevicePhoneMobileIcon,
  "Cloud": CloudIcon,
  "CPU": CpuChipIcon,
  "Tools": WrenchScrewdriverIcon,
  "Bolt": BoltIcon,
  "Gear": CogIcon,
  
  // Creative
  "Paint": PaintBrushIcon,
  "Camera": CameraIcon,
  "Photo": PhotoIcon,
  "Film": FilmIcon,
  "Music": MusicalNoteIcon,
  "Speaker": SpeakerWaveIcon,
  "Sparkles": SparklesIcon,
  "Heart": HeartIcon,
  
  // Business
  "Briefcase": BriefcaseIcon,
  "Chart": ChartBarIcon,
  "Dollar": CurrencyDollarIcon,
  "Shopping": ShoppingBagIcon,
  "Truck": TruckIcon,
  "Users": UserGroupIcon,
  "Shield": ShieldCheckIcon,
  "Key": KeyIcon,
  
  // Content
  "Book": BookOpenIcon,
  "Document": DocumentTextIcon,
  "News": NewspaperIcon,
  "Academic": AcademicCapIcon,
  "Chat": ChatBubbleLeftIcon,
  "Envelope": EnvelopeIcon,
  "Phone": PhoneIcon,
  "Globe": GlobeAltIcon,
  
  // General
  "Folder": FolderIcon,
  "Home": HomeIcon,
  "Star": StarIcon,
  "Fire": FireIcon,
  "Lightbulb": LightBulbIcon,
  "Rocket": RocketLaunchIcon,
  "Clock": ClockIcon,
  "Calendar": CalendarIcon,
  "Map": MapPinIcon,
  "WiFi": WifiIcon,
  "Beaker": BeakerIcon,
  "Tag": TagIcon,
}

// Get icon component by name - always returns a valid component
export const getIconComponent = (iconName?: string) => {
  if (!iconName) return FolderIcon
  
  // Handle custom icons - return FolderIcon as fallback
  if (iconName.startsWith('custom:')) {
    return FolderIcon
  }
  
  // Return the icon component from the map, fallback to FolderIcon
  return iconMap[iconName as keyof typeof iconMap] || FolderIcon
}

// Icon display component
interface CategoryIconProps {
  iconName?: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const CategoryIcon = ({ 
  iconName, 
  color = '#6B7280', 
  size = 'md',
  className = '' 
}: CategoryIconProps) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  // Handle custom icon URLs
  if (iconName?.startsWith('custom:')) {
    const iconUrl = iconName.replace('custom:', '')
    return (
      <img 
        src={iconUrl} 
        alt="Custom icon"
        className={`${sizeClasses[size]} object-contain ${className}`}
        style={{ filter: 'brightness(0) invert(1)' }} // Make it white
      />
    )
  }

  // Get the icon component - this will always return a valid component
  const IconComponent = getIconComponent(iconName)
  
  return (
    <IconComponent 
      className={`${sizeClasses[size]} text-white drop-shadow-sm ${className}`}
    />
  )
}

// Badge component with icon and color
interface CategoryBadgeProps {
  name: string
  color: string
  iconName?: string
  size?: 'sm' | 'md'
  className?: string
}

export const CategoryBadge = ({ 
  name, 
  color, 
  iconName, 
  size = 'sm',
  className = '' 
}: CategoryBadgeProps) => {
  const isGradient = color.includes('gradient')
  
  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-white ${className}`}
      style={{ 
        background: color,
        ...(isGradient ? {} : { backgroundColor: color })
      }}
    >
      <CategoryIcon 
        iconName={iconName} 
        size={size === 'sm' ? 'sm' : 'md'} 
      />
      <span>{name}</span>
    </div>
  )
}

// Icon categories for the icon picker
export const iconCategories = {
  "Development": [
    { name: "Code", icon: CodeBracketIcon },
    { name: "Computer", icon: ComputerDesktopIcon },
    { name: "Mobile", icon: DevicePhoneMobileIcon },
    { name: "Cloud", icon: CloudIcon },
    { name: "CPU", icon: CpuChipIcon },
    { name: "Tools", icon: WrenchScrewdriverIcon },
    { name: "Bolt", icon: BoltIcon },
    { name: "Gear", icon: CogIcon },
  ],
  "Creative": [
    { name: "Paint", icon: PaintBrushIcon },
    { name: "Camera", icon: CameraIcon },
    { name: "Photo", icon: PhotoIcon },
    { name: "Film", icon: FilmIcon },
    { name: "Music", icon: MusicalNoteIcon },
    { name: "Speaker", icon: SpeakerWaveIcon },
    { name: "Sparkles", icon: SparklesIcon },
    { name: "Heart", icon: HeartIcon },
  ],
  "Business": [
    { name: "Briefcase", icon: BriefcaseIcon },
    { name: "Chart", icon: ChartBarIcon },
    { name: "Dollar", icon: CurrencyDollarIcon },
    { name: "Shopping", icon: ShoppingBagIcon },
    { name: "Truck", icon: TruckIcon },
    { name: "Users", icon: UserGroupIcon },
    { name: "Shield", icon: ShieldCheckIcon },
    { name: "Key", icon: KeyIcon },
  ],
  "Content": [
    { name: "Book", icon: BookOpenIcon },
    { name: "Document", icon: DocumentTextIcon },
    { name: "News", icon: NewspaperIcon },
    { name: "Academic", icon: AcademicCapIcon },
    { name: "Chat", icon: ChatBubbleLeftIcon },
    { name: "Envelope", icon: EnvelopeIcon },
    { name: "Phone", icon: PhoneIcon },
    { name: "Globe", icon: GlobeAltIcon },
  ],
  "General": [
    { name: "Folder", icon: FolderIcon },
    { name: "Home", icon: HomeIcon },
    { name: "Star", icon: StarIcon },
    { name: "Fire", icon: FireIcon },
    { name: "Lightbulb", icon: LightBulbIcon },
    { name: "Rocket", icon: RocketLaunchIcon },
    { name: "Clock", icon: ClockIcon },
    { name: "Calendar", icon: CalendarIcon },
    { name: "Map", icon: MapPinIcon },
    { name: "WiFi", icon: WifiIcon },
    { name: "Beaker", icon: BeakerIcon },
    { name: "Tag", icon: TagIcon },
  ]
}
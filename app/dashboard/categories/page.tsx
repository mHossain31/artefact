"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import Sidebar from "@/components/dashboard/sidebar"
import ActivityFeed from "@/components/dashboard/activity-feed"
import {
  FolderIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon,
  TagIcon,
  SwatchIcon,
  EyeDropperIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowsUpDownIcon,
  FunnelIcon,
  DocumentDuplicateIcon,
  // Category Icons
  CodeBracketIcon,
  PaintBrushIcon,
  BookOpenIcon,
  CameraIcon,
  MusicalNoteIcon,
  ShoppingBagIcon,
  HomeIcon,
  BriefcaseIcon,
  HeartIcon,
  StarIcon,
  FireIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CloudIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
  AcademicCapIcon,
  NewspaperIcon,
  FilmIcon,
  SpeakerWaveIcon,
  PhotoIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CalendarIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  WifiIcon,
  BoltIcon,
  ShieldCheckIcon,
  KeyIcon,
  CogIcon,
  BeakerIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline"

interface Category {
  id: string
  name: string
  color: string
  icon?: string
  urlCount: number
  createdAt: string
  updatedAt: string
  createdBy: {
    name?: string
    email: string
  }
}

interface CategoriesData {
  user: {
    name?: string
    email: string
  }
  currentWorkspace: {
    id: string
    name: string
    description?: string
  }
  workspaces: Array<{
    id: string
    name: string
    description?: string
  }>
  categories: Category[]
  currentUserRole: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER"
  activities: Array<{
    id: string
    type: string
    description: string
    user: {
      name?: string
      email: string
    }
    createdAt: string
  }>
}

const presetColors = [
  { name: "Blue", value: "#3B82F6", class: "bg-blue-500" },
  { name: "Green", value: "#10B981", class: "bg-emerald-500" },
  { name: "Purple", value: "#8B5CF6", class: "bg-violet-500" },
  { name: "Red", value: "#EF4444", class: "bg-red-500" },
  { name: "Orange", value: "#F97316", class: "bg-orange-500" },
  { name: "Pink", value: "#EC4899", class: "bg-pink-500" },
  { name: "Indigo", value: "#6366F1", class: "bg-indigo-500" },
  { name: "Yellow", value: "#EAB308", class: "bg-yellow-500" },
  { name: "Teal", value: "#14B8A6", class: "bg-teal-500" },
  { name: "Cyan", value: "#06B6D4", class: "bg-cyan-500" },
  { name: "Rose", value: "#F43F5E", class: "bg-rose-500" },
  { name: "Amber", value: "#F59E0B", class: "bg-amber-500" },
]

const gradientPresets = [
  { name: "Ocean", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Sunset", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Forest", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { name: "Fire", value: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
  { name: "Aurora", value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
  { name: "Space", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
]



import { getIconComponent, CategoryIcon, iconCategories } from "@/lib/icons"

export default function CategoriesPage() {
  const [data, setData] = useState<CategoriesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'urls'>('name')
  const [showEmpty, setShowEmpty] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    color: "#3B82F6",
    icon: "Folder",
    colorType: "solid" as "solid" | "gradient"
  })

  // Simple toast alternative for demo
  const showToast = (title: string, description?: string, variant?: "default" | "destructive") => {
    console.log(`Toast: ${title} - ${description}`)
  }

  useEffect(() => {
    fetchCategoriesData()
  }, [])

  const fetchCategoriesData = async () => {
    try {
      console.log('🔍 Fetching categories data...')
      const response = await fetch("/api/categories")
      if (response.ok) {
        const categoriesData = await response.json()
        console.log('✅ Categories data fetched:', categoriesData)
        setData(categoriesData)
      } else {
        console.error('❌ Failed to fetch categories data:', response.status)
        showToast(
          "Failed to load categories",
          "Please refresh the page and try again.",
          "destructive"
        )
      }
    } catch (error) {
      console.error("❌ Failed to fetch categories data:", error)
      showToast(
        "Error loading categories",
        "Please check your connection and try again.",
        "destructive"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log('➕ Creating category:', formData)
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        showToast(
          "Category created",
          "Your new category has been created successfully."
        )
        setIsCreateModalOpen(false)
        setFormData({ name: "", color: "#3B82F6", icon: "Folder", colorType: "solid" })
        fetchCategoriesData()
      } else {
        const data = await response.json()
        showToast(
          "Failed to create category",
          data.error || "Please try again.",
          "destructive"
        )
      }
    } catch (error) {
      console.error('❌ Create category error:', error)
      showToast(
        "Error",
        "Something went wrong. Please try again.",
        "destructive"
      )
    }
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory) return

    try {
      console.log('✏️ Updating category:', selectedCategory.id, formData)
      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        showToast(
          "Category updated",
          "Category has been updated successfully."
        )
        setIsEditModalOpen(false)
        setSelectedCategory(null)
        setFormData({ name: "", color: "#3B82F6", icon: "Folder", colorType: "solid" })
        fetchCategoriesData()
      } else {
        const data = await response.json()
        showToast(
          "Failed to update category",
          data.error || "Please try again.",
          "destructive"
        )
      }
    } catch (error) {
      console.error('❌ Update category error:', error)
      showToast(
        "Error",
        "Something went wrong. Please try again.",
        "destructive"
      )
    }
  }

  const handleDeleteCategory = async () => {
    if (!deleteCategory) return

    try {
      console.log('🗑️ Deleting category:', deleteCategory.id)
      const response = await fetch(`/api/categories/${deleteCategory.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        showToast(
          "Category deleted",
          "Category has been deleted successfully."
        )
        setDeleteCategory(null)
        fetchCategoriesData()
      } else {
        const data = await response.json()
        showToast(
          "Failed to delete category",
          data.error || "Please try again.",
          "destructive"
        )
      }
    } catch (error) {
      console.error('❌ Delete category error:', error)
      showToast(
        "Error",
        "Something went wrong. Please try again.",
        "destructive"
      )
    }
  }

  const handleDuplicateCategory = async (category: Category) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${category.name} Copy`,
          color: category.color,
          icon: category.icon,
        }),
      })

      if (response.ok) {
        showToast("Category duplicated", "A copy of the category has been created.")
        fetchCategoriesData()
      }
    } catch (error) {
      console.error('❌ Duplicate category error:', error)
    }
  }

  const openEditModal = (category: Category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon || "Folder",
      colorType: category.color.includes('gradient') ? 'gradient' : 'solid'
    })
    setIsEditModalOpen(true)
  }

  const canManageCategories = data?.currentUserRole === "OWNER" || 
                             data?.currentUserRole === "ADMIN" || 
                             data?.currentUserRole === "EDITOR"

  const filteredAndSortedCategories = data?.categories
    .filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = showEmpty || category.urlCount > 0
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'urls':
          return b.urlCount - a.urlCount
        default:
          return 0
      }
    }) || []

  const IconPicker = ({ value, onChange }: { value: string, onChange: (icon: string) => void }) => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center">
          {(() => {
            const IconComponent = getIconComponent(value)
            return <IconComponent className="w-8 h-8 text-gray-600" />
          })()}
        </div>
        <p className="text-sm text-gray-600 font-sans">Selected: {value}</p>
      </div>
      
      <Tabs defaultValue={Object.keys(iconCategories)[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="Development" className="font-sans text-xs">Dev</TabsTrigger>
          <TabsTrigger value="Creative" className="font-sans text-xs">Creative</TabsTrigger>
          <TabsTrigger value="Business" className="font-sans text-xs">Business</TabsTrigger>
        </TabsList>
        <TabsList className="grid w-full grid-cols-2 mt-2">
          <TabsTrigger value="Content" className="font-sans text-xs">Content</TabsTrigger>
          <TabsTrigger value="General" className="font-sans text-xs">General</TabsTrigger>
        </TabsList>
        
        {Object.entries(iconCategories).map(([categoryName, icons]) => (
          <TabsContent key={categoryName} value={categoryName} className="mt-4">
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {icons.map((icon) => {
                const IconComponent = icon.icon
                return (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => onChange(icon.name)}
                    className={`p-3 rounded-lg border transition-all hover:bg-gray-50 ${
                      value === icon.name 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200'
                    }`}
                    title={icon.name}
                  >
                    <IconComponent className="w-5 h-5 mx-auto text-gray-700" />
                    <span className="text-xs text-gray-600 mt-1 block font-sans">{icon.name}</span>
                  </button>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Custom Icon URL Input */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Custom Icon URL (Optional)</Label>
        <Input
          type="url"
          placeholder="https://example.com/icon.svg"
          className="font-sans text-sm"
          onChange={(e) => {
            if (e.target.value) {
              onChange(`custom:${e.target.value}`)
            }
          }}
        />
        <p className="text-xs text-gray-500 mt-1">Enter a URL to a custom icon (SVG, PNG, etc.)</p>
      </div>
    </div>
  )

  const ColorPicker = ({ value, onChange, type }: { 
    value: string, 
    onChange: (color: string) => void,
    type: "solid" | "gradient"
  }) => (
    <div className="space-y-4">
      {type === "solid" ? (
        <>
          {/* Preset Colors */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Preset Colors</Label>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => onChange(color.value)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    value === color.value ? 'border-gray-900 scale-110' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Custom Color Input */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Custom Color</Label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
                className="flex-1 font-mono text-sm"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Gradient Presets */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Gradient Presets</Label>
            <div className="grid grid-cols-3 gap-2">
              {gradientPresets.map((gradient) => (
                <button
                  key={gradient.name}
                  type="button"
                  onClick={() => onChange(gradient.value)}
                  className={`w-full h-12 rounded-lg border-2 transition-all ${
                    value === gradient.value ? 'border-gray-900 scale-105' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ background: gradient.value }}
                  title={gradient.name}
                />
              ))}
            </div>
          </div>

          {/* Custom Gradient */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Custom Gradient</Label>
            <Input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              className="font-mono text-sm"
            />
          </div>
        </>
      )}

      {/* Preview */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Preview</Label>
        <div 
          className="w-full h-16 rounded-lg border border-gray-200"
          style={{ background: value }}
        />
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-sans">Loading categories...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-sans">Failed to load categories. Please refresh the page.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentWorkspace={data.currentWorkspace} workspaces={data.workspaces} user={data.user} />

      <div className="ml-64 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sans">Categories</h1>
            <p className="text-gray-600 font-sans">
              Organize your URLs with custom categories for <span className="font-medium">{data.currentWorkspace.name}</span>
            </p>
          </div>
          {canManageCategories && (
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-sans shadow-lg">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 font-sans">
                    <SwatchIcon className="w-5 h-5" />
                    Create New Category
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCategory} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="font-sans font-medium">Category Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter category name"
                      required
                      className="font-sans mt-1"
                    />
                  </div>

                  <div>
                    <Label className="font-sans font-medium mb-3 block">Category Icon</Label>
                    <IconPicker
                      value={formData.icon}
                      onChange={(icon) => setFormData({ ...formData, icon })}
                    />
                  </div>

                  <div>
                    <Label className="font-sans font-medium mb-3 block">Color Style</Label>
                    <Tabs value={formData.colorType} onValueChange={(value) => setFormData({ ...formData, colorType: value as "solid" | "gradient" })}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="solid" className="font-sans">Solid Color</TabsTrigger>
                        <TabsTrigger value="gradient" className="font-sans">Gradient</TabsTrigger>
                      </TabsList>
                      <TabsContent value="solid" className="mt-4">
                        <ColorPicker
                          value={formData.color}
                          onChange={(color) => setFormData({ ...formData, color })}
                          type="solid"
                        />
                      </TabsContent>
                      <TabsContent value="gradient" className="mt-4">
                        <ColorPicker
                          value={formData.color}
                          onChange={(color) => setFormData({ ...formData, color })}
                          type="gradient"
                        />
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 font-sans">
                      Create Category
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateModalOpen(false)}
                      className="font-sans"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-sans"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Show Empty Toggle */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={showEmpty}
                  onCheckedChange={setShowEmpty}
                  id="show-empty"
                />
                <Label htmlFor="show-empty" className="text-sm font-sans">Show empty</Label>
              </div>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="font-sans">
                    <ArrowsUpDownIcon className="w-4 h-4 mr-2" />
                    Sort: {sortBy === 'name' ? 'Name' : sortBy === 'created' ? 'Created' : 'URLs'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy('name')} className="font-sans">
                    Sort by Name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('created')} className="font-sans">
                    Sort by Created Date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('urls')} className="font-sans">
                    Sort by URL Count
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Mode */}
              <div className="flex items-center border border-gray-200 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <ListBulletIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FolderIcon className="w-4 h-4" />
              <span className="font-sans">{filteredAndSortedCategories.length} of {data.categories.length} categories</span>
            </div>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              <span className="font-sans">
                {data.categories.reduce((total, cat) => total + cat.urlCount, 0)} total URLs
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TagIcon className="w-4 h-4" />
              <span className="font-sans">
                {data.categories.filter(cat => cat.urlCount === 0).length} empty categories
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Categories */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {filteredAndSortedCategories.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-16"
                >
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FolderIcon className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 font-sans">
                    {searchQuery ? "No categories found" : "No categories yet"}
                  </h3>
                  <p className="text-gray-600 mb-8 font-sans max-w-md mx-auto">
                    {searchQuery 
                      ? "Try adjusting your search terms or filters" 
                      : "Create your first category to organize your URLs into meaningful collections"}
                  </p>
                  {!searchQuery && canManageCategories && (
                    <Button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-sans shadow-lg"
                      size="lg"
                    >
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Create Your First Category
                    </Button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}
                >
                  {filteredAndSortedCategories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      {viewMode === 'grid' ? (
                        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="relative">
                                  <div 
                                    className="w-6 h-6 rounded-lg shadow-sm border border-white/20"
                                    style={{ background: category.color }}
                                  />
                                  {category.icon && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <CategoryIcon 
                                        iconName={category.icon}
                                        size="sm"
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 font-sans group-hover:text-indigo-600 transition-colors">
                                    {category.name}
                                  </h3>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-sm text-gray-500 font-sans">
                                      {category.urlCount} URL{category.urlCount !== 1 ? 's' : ''}
                                    </span>
                                    <span className="text-xs text-gray-400 font-sans">
                                      {new Date(category.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {canManageCategories && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <EllipsisHorizontalIcon className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => openEditModal(category)}
                                      className="font-sans"
                                    >
                                      <PencilIcon className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDuplicateCategory(category)}
                                      className="font-sans"
                                    >
                                      <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setDeleteCategory(category)}
                                      className="text-red-600 font-sans"
                                    >
                                      <TrashIcon className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Badge variant={category.urlCount > 0 ? "default" : "secondary"} className="font-sans">
                                {category.urlCount > 0 ? "Active" : "Empty"}
                              </Badge>
                              <div className="text-xs text-gray-400 font-sans">
                                by {category.createdBy.name || category.createdBy.email}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="relative">
                                  <div 
                                    className="w-8 h-8 rounded-lg shadow-sm border border-white/20"
                                    style={{ background: category.color }}
                                  />
                                  {category.icon && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <CategoryIcon 
                                        iconName={category.icon}
                                        size="md"
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 font-sans">{category.name}</h3>
                                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                    <span className="font-sans">{category.urlCount} URLs</span>
                                    <span className="font-sans">Created {new Date(category.createdAt).toLocaleDateString()}</span>
                                    <span className="font-sans">by {category.createdBy.name || category.createdBy.email}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={category.urlCount > 0 ? "default" : "secondary"} className="font-sans">
                                  {category.urlCount > 0 ? "Active" : "Empty"}
                                </Badge>
                                {canManageCategories && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <EllipsisHorizontalIcon className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => openEditModal(category)}
                                        className="font-sans"
                                      >
                                        <PencilIcon className="w-4 h-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDuplicateCategory(category)}
                                        className="font-sans"
                                      >
                                        <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                                        Duplicate
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => setDeleteCategory(category)}
                                        className="text-red-600 font-sans"
                                      >
                                        <TrashIcon className="w-4 h-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <ActivityFeed activities={data.activities} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-sans">
              <PencilIcon className="w-5 h-5" />
              Edit Category
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateCategory} className="space-y-6">
            <div>
              <Label htmlFor="edit-name" className="font-sans font-medium">Category Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
                required
                className="font-sans mt-1"
              />
            </div>

            <div>
              <Label className="font-sans font-medium mb-3 block">Category Icon</Label>
              <IconPicker
                value={formData.icon}
                onChange={(icon) => setFormData({ ...formData, icon })}
              />
            </div>

            <div>
              <Label className="font-sans font-medium mb-3 block">Color Style</Label>
              <Tabs value={formData.colorType} onValueChange={(value) => setFormData({ ...formData, colorType: value as "solid" | "gradient" })}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="solid" className="font-sans">Solid Color</TabsTrigger>
                  <TabsTrigger value="gradient" className="font-sans">Gradient</TabsTrigger>
                </TabsList>
                <TabsContent value="solid" className="mt-4">
                  <ColorPicker
                    value={formData.color}
                    onChange={(color) => setFormData({ ...formData, color })}
                    type="solid"
                  />
                </TabsContent>
                <TabsContent value="gradient" className="mt-4">
                  <ColorPicker
                    value={formData.color}
                    onChange={(color) => setFormData({ ...formData, color })}
                    type="gradient"
                  />
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 font-sans">
                Update Category
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)}
                className="font-sans"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-sans">
              <TrashIcon className="w-5 h-5 text-red-500" />
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription className="font-sans">
              Are you sure you want to delete <span className="font-semibold">"{deleteCategory?.name}"</span>? This action cannot be undone.
              {deleteCategory?.urlCount && deleteCategory.urlCount > 0 && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800">
                    <LinkIcon className="w-4 h-4" />
                    <span className="font-medium">
                      This category contains {deleteCategory.urlCount} URL{deleteCategory.urlCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    These URLs will become uncategorized but won't be deleted.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-sans">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCategory}
              className="bg-red-600 hover:bg-red-700 font-sans"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

















// "use client"

// import { useState, useEffect } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { 
//   Dialog, 
//   DialogContent, 
//   DialogHeader, 
//   DialogTitle, 
//   DialogTrigger 
// } from "@/components/ui/dialog"
// import { Label } from "@/components/ui/label"
// import { 
//   DropdownMenu, 
//   DropdownMenuContent, 
//   DropdownMenuItem, 
//   DropdownMenuTrigger 
// } from "@/components/ui/dropdown-menu"
// import { 
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Switch } from "@/components/ui/switch"
// import Sidebar from "@/components/dashboard/sidebar"
// import ActivityFeed from "@/components/dashboard/activity-feed"
// import {
//   FolderIcon,
//   PlusIcon,
//   MagnifyingGlassIcon,
//   EllipsisHorizontalIcon,
//   PencilIcon,
//   TrashIcon,
//   LinkIcon,
//   TagIcon,
//   SwatchIcon,
//   EyeDropperIcon,
//   Squares2X2Icon,
//   ListBulletIcon,
//   ArrowsUpDownIcon,
//   FunnelIcon,
//   DocumentDuplicateIcon,
// } from "@heroicons/react/24/outline"

// interface Category {
//   id: string
//   name: string
//   color: string
//   urlCount: number
//   createdAt: string
//   updatedAt: string
//   createdBy: {
//     name?: string
//     email: string
//   }
// }

// interface CategoriesData {
//   user: {
//     name?: string
//     email: string
//   }
//   currentWorkspace: {
//     id: string
//     name: string
//     description?: string
//   }
//   workspaces: Array<{
//     id: string
//     name: string
//     description?: string
//   }>
//   categories: Category[]
//   currentUserRole: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER"
//   activities: Array<{
//     id: string
//     type: string
//     description: string
//     user: {
//       name?: string
//       email: string
//     }
//     createdAt: string
//   }>
// }

// const presetColors = [
//   { name: "Blue", value: "#3B82F6", class: "bg-blue-500" },
//   { name: "Green", value: "#10B981", class: "bg-emerald-500" },
//   { name: "Purple", value: "#8B5CF6", class: "bg-violet-500" },
//   { name: "Red", value: "#EF4444", class: "bg-red-500" },
//   { name: "Orange", value: "#F97316", class: "bg-orange-500" },
//   { name: "Pink", value: "#EC4899", class: "bg-pink-500" },
//   { name: "Indigo", value: "#6366F1", class: "bg-indigo-500" },
//   { name: "Yellow", value: "#EAB308", class: "bg-yellow-500" },
//   { name: "Teal", value: "#14B8A6", class: "bg-teal-500" },
//   { name: "Cyan", value: "#06B6D4", class: "bg-cyan-500" },
//   { name: "Rose", value: "#F43F5E", class: "bg-rose-500" },
//   { name: "Amber", value: "#F59E0B", class: "bg-amber-500" },
// ]

// const gradientPresets = [
//   { name: "Ocean", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
//   { name: "Sunset", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
//   { name: "Forest", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
//   { name: "Fire", value: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
//   { name: "Aurora", value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
//   { name: "Space", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
// ]

// export default function CategoriesPage() {
//   const [data, setData] = useState<CategoriesData | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false)
//   const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
//   const [deleteCategory, setDeleteCategory] = useState<Category | null>(null)
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
//   const [sortBy, setSortBy] = useState<'name' | 'created' | 'urls'>('name')
//   const [showEmpty, setShowEmpty] = useState(true)
//   const [formData, setFormData] = useState({
//     name: "",
//     color: "#3B82F6",
//     colorType: "solid" as "solid" | "gradient"
//   })

//   // Simple toast alternative for demo
//   const showToast = (title: string, description?: string, variant?: "default" | "destructive") => {
//     console.log(`Toast: ${title} - ${description}`)
//   }

//   useEffect(() => {
//     fetchCategoriesData()
//   }, [])

//   const fetchCategoriesData = async () => {
//     try {
//       console.log('🔍 Fetching categories data...')
//       const response = await fetch("/api/categories")
//       if (response.ok) {
//         const categoriesData = await response.json()
//         console.log('✅ Categories data fetched:', categoriesData)
//         setData(categoriesData)
//       } else {
//         console.error('❌ Failed to fetch categories data:', response.status)
//         showToast(
//           "Failed to load categories",
//           "Please refresh the page and try again.",
//           "destructive"
//         )
//       }
//     } catch (error) {
//       console.error("❌ Failed to fetch categories data:", error)
//       showToast(
//         "Error loading categories",
//         "Please check your connection and try again.",
//         "destructive"
//       )
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleCreateCategory = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       console.log('➕ Creating category:', formData)
//       const response = await fetch("/api/categories", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       })

//       if (response.ok) {
//         showToast(
//           "Category created",
//           "Your new category has been created successfully."
//         )
//         setIsCreateModalOpen(false)
//         setFormData({ name: "", color: "#3B82F6", colorType: "solid" })
//         fetchCategoriesData()
//       } else {
//         const data = await response.json()
//         showToast(
//           "Failed to create category",
//           data.error || "Please try again.",
//           "destructive"
//         )
//       }
//     } catch (error) {
//       console.error('❌ Create category error:', error)
//       showToast(
//         "Error",
//         "Something went wrong. Please try again.",
//         "destructive"
//       )
//     }
//   }

//   const handleUpdateCategory = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!selectedCategory) return

//     try {
//       console.log('✏️ Updating category:', selectedCategory.id, formData)
//       const response = await fetch(`/api/categories/${selectedCategory.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       })

//       if (response.ok) {
//         showToast(
//           "Category updated",
//           "Category has been updated successfully."
//         )
//         setIsEditModalOpen(false)
//         setSelectedCategory(null)
//         setFormData({ name: "", color: "#3B82F6", colorType: "solid" })
//         fetchCategoriesData()
//       } else {
//         const data = await response.json()
//         showToast(
//           "Failed to update category",
//           data.error || "Please try again.",
//           "destructive"
//         )
//       }
//     } catch (error) {
//       console.error('❌ Update category error:', error)
//       showToast(
//         "Error",
//         "Something went wrong. Please try again.",
//         "destructive"
//       )
//     }
//   }

//   const handleDeleteCategory = async () => {
//     if (!deleteCategory) return

//     try {
//       console.log('🗑️ Deleting category:', deleteCategory.id)
//       const response = await fetch(`/api/categories/${deleteCategory.id}`, {
//         method: "DELETE",
//       })

//       if (response.ok) {
//         showToast(
//           "Category deleted",
//           "Category has been deleted successfully."
//         )
//         setDeleteCategory(null)
//         fetchCategoriesData()
//       } else {
//         const data = await response.json()
//         showToast(
//           "Failed to delete category",
//           data.error || "Please try again.",
//           "destructive"
//         )
//       }
//     } catch (error) {
//       console.error('❌ Delete category error:', error)
//       showToast(
//         "Error",
//         "Something went wrong. Please try again.",
//         "destructive"
//       )
//     }
//   }

//   const handleDuplicateCategory = async (category: Category) => {
//     try {
//       const response = await fetch("/api/categories", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: `${category.name} Copy`,
//           color: category.color,
//         }),
//       })

//       if (response.ok) {
//         showToast("Category duplicated", "A copy of the category has been created.")
//         fetchCategoriesData()
//       }
//     } catch (error) {
//       console.error('❌ Duplicate category error:', error)
//     }
//   }

//   const openEditModal = (category: Category) => {
//     setSelectedCategory(category)
//     setFormData({
//       name: category.name,
//       color: category.color,
//       colorType: category.color.includes('gradient') ? 'gradient' : 'solid'
//     })
//     setIsEditModalOpen(true)
//   }

//   const canManageCategories = data?.currentUserRole === "OWNER" || 
//                              data?.currentUserRole === "ADMIN" || 
//                              data?.currentUserRole === "EDITOR"

//   const filteredAndSortedCategories = data?.categories
//     .filter(category => {
//       const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase())
//       const matchesFilter = showEmpty || category.urlCount > 0
//       return matchesSearch && matchesFilter
//     })
//     .sort((a, b) => {
//       switch (sortBy) {
//         case 'name':
//           return a.name.localeCompare(b.name)
//         case 'created':
//           return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//         case 'urls':
//           return b.urlCount - a.urlCount
//         default:
//           return 0
//       }
//     }) || []

//   const ColorPicker = ({ value, onChange, type }: { 
//     value: string, 
//     onChange: (color: string) => void,
//     type: "solid" | "gradient"
//   }) => (
//     <div className="space-y-4">
//       {type === "solid" ? (
//         <>
//           {/* Preset Colors */}
//           <div>
//             <Label className="text-sm font-medium text-gray-700 mb-2 block">Preset Colors</Label>
//             <div className="grid grid-cols-6 gap-2">
//               {presetColors.map((color) => (
//                 <button
//                   key={color.value}
//                   type="button"
//                   onClick={() => onChange(color.value)}
//                   className={`w-10 h-10 rounded-lg border-2 transition-all ${
//                     value === color.value ? 'border-gray-900 scale-110' : 'border-gray-200 hover:border-gray-400'
//                   }`}
//                   style={{ backgroundColor: color.value }}
//                   title={color.name}
//                 />
//               ))}
//             </div>
//           </div>

//           {/* Custom Color Input */}
//           <div>
//             <Label className="text-sm font-medium text-gray-700 mb-2 block">Custom Color</Label>
//             <div className="flex gap-3 items-center">
//               <input
//                 type="color"
//                 value={value}
//                 onChange={(e) => onChange(e.target.value)}
//                 className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
//               />
//               <Input
//                 type="text"
//                 value={value}
//                 onChange={(e) => onChange(e.target.value)}
//                 placeholder="#000000"
//                 className="flex-1 font-mono text-sm"
//                 pattern="^#[0-9A-Fa-f]{6}$"
//               />
//             </div>
//           </div>
//         </>
//       ) : (
//         <>
//           {/* Gradient Presets */}
//           <div>
//             <Label className="text-sm font-medium text-gray-700 mb-2 block">Gradient Presets</Label>
//             <div className="grid grid-cols-3 gap-2">
//               {gradientPresets.map((gradient) => (
//                 <button
//                   key={gradient.name}
//                   type="button"
//                   onClick={() => onChange(gradient.value)}
//                   className={`w-full h-12 rounded-lg border-2 transition-all ${
//                     value === gradient.value ? 'border-gray-900 scale-105' : 'border-gray-200 hover:border-gray-400'
//                   }`}
//                   style={{ background: gradient.value }}
//                   title={gradient.name}
//                 />
//               ))}
//             </div>
//           </div>

//           {/* Custom Gradient */}
//           <div>
//             <Label className="text-sm font-medium text-gray-700 mb-2 block">Custom Gradient</Label>
//             <Input
//               type="text"
//               value={value}
//               onChange={(e) => onChange(e.target.value)}
//               placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
//               className="font-mono text-sm"
//             />
//           </div>
//         </>
//       )}

//       {/* Preview */}
//       <div>
//         <Label className="text-sm font-medium text-gray-700 mb-2 block">Preview</Label>
//         <div 
//           className="w-full h-16 rounded-lg border border-gray-200"
//           style={{ background: value }}
//         />
//       </div>
//     </div>
//   )

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//           <p className="text-gray-600 font-sans">Loading categories...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!data) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-600 font-sans">Failed to load categories. Please refresh the page.</p>
//           <Button 
//             onClick={() => window.location.reload()} 
//             className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600"
//           >
//             Refresh Page
//           </Button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Sidebar currentWorkspace={data.currentWorkspace} workspaces={data.workspaces} user={data.user} />

//       <div className="ml-64 p-8">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="flex items-center justify-between mb-8"
//         >
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sans">Categories</h1>
//             <p className="text-gray-600 font-sans">
//               Organize your URLs with custom categories for <span className="font-medium">{data.currentWorkspace.name}</span>
//             </p>
//           </div>
//           {canManageCategories && (
//             <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
//               <DialogTrigger asChild>
//                 <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-sans shadow-lg">
//                   <PlusIcon className="w-5 h-5 mr-2" />
//                   Create Category
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="max-w-md">
//                 <DialogHeader>
//                   <DialogTitle className="flex items-center gap-2 font-sans">
//                     <SwatchIcon className="w-5 h-5" />
//                     Create New Category
//                   </DialogTitle>
//                 </DialogHeader>
//                 <form onSubmit={handleCreateCategory} className="space-y-6">
//                   <div>
//                     <Label htmlFor="name" className="font-sans font-medium">Category Name</Label>
//                     <Input
//                       id="name"
//                       value={formData.name}
//                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                       placeholder="Enter category name"
//                       required
//                       className="font-sans mt-1"
//                     />
//                   </div>

//                   <div>
//                     <Label className="font-sans font-medium mb-3 block">Color Style</Label>
//                     <Tabs value={formData.colorType} onValueChange={(value) => setFormData({ ...formData, colorType: value as "solid" | "gradient" })}>
//                       <TabsList className="grid w-full grid-cols-2">
//                         <TabsTrigger value="solid" className="font-sans">Solid Color</TabsTrigger>
//                         <TabsTrigger value="gradient" className="font-sans">Gradient</TabsTrigger>
//                       </TabsList>
//                       <TabsContent value="solid" className="mt-4">
//                         <ColorPicker
//                           value={formData.color}
//                           onChange={(color) => setFormData({ ...formData, color })}
//                           type="solid"
//                         />
//                       </TabsContent>
//                       <TabsContent value="gradient" className="mt-4">
//                         <ColorPicker
//                           value={formData.color}
//                           onChange={(color) => setFormData({ ...formData, color })}
//                           type="gradient"
//                         />
//                       </TabsContent>
//                     </Tabs>
//                   </div>

//                   <div className="flex gap-3 pt-4">
//                     <Button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 font-sans">
//                       Create Category
//                     </Button>
//                     <Button 
//                       type="button" 
//                       variant="outline" 
//                       onClick={() => setIsCreateModalOpen(false)}
//                       className="font-sans"
//                     >
//                       Cancel
//                     </Button>
//                   </div>
//                 </form>
//               </DialogContent>
//             </Dialog>
//           )}
//         </motion.div>

//         {/* Controls */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
//         >
//           <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
//             {/* Search */}
//             <div className="relative flex-1 max-w-md">
//               <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <Input
//                 placeholder="Search categories..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10 font-sans"
//               />
//             </div>

//             {/* Controls */}
//             <div className="flex items-center gap-4">
//               {/* Show Empty Toggle */}
//               <div className="flex items-center gap-2">
//                 <Switch
//                   checked={showEmpty}
//                   onCheckedChange={setShowEmpty}
//                   id="show-empty"
//                 />
//                 <Label htmlFor="show-empty" className="text-sm font-sans">Show empty</Label>
//               </div>

//               {/* Sort */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="outline" size="sm" className="font-sans">
//                     <ArrowsUpDownIcon className="w-4 h-4 mr-2" />
//                     Sort: {sortBy === 'name' ? 'Name' : sortBy === 'created' ? 'Created' : 'URLs'}
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                   <DropdownMenuItem onClick={() => setSortBy('name')} className="font-sans">
//                     Sort by Name
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => setSortBy('created')} className="font-sans">
//                     Sort by Created Date
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => setSortBy('urls')} className="font-sans">
//                     Sort by URL Count
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               {/* View Mode */}
//               <div className="flex items-center border border-gray-200 rounded-lg">
//                 <Button
//                   variant={viewMode === 'grid' ? 'default' : 'ghost'}
//                   size="sm"
//                   onClick={() => setViewMode('grid')}
//                   className="rounded-r-none"
//                 >
//                   <Squares2X2Icon className="w-4 h-4" />
//                 </Button>
//                 <Button
//                   variant={viewMode === 'list' ? 'default' : 'ghost'}
//                   size="sm"
//                   onClick={() => setViewMode('list')}
//                   className="rounded-l-none"
//                 >
//                   <ListBulletIcon className="w-4 h-4" />
//                 </Button>
//               </div>
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
//             <div className="flex items-center gap-2">
//               <FolderIcon className="w-4 h-4" />
//               <span className="font-sans">{filteredAndSortedCategories.length} of {data.categories.length} categories</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <LinkIcon className="w-4 h-4" />
//               <span className="font-sans">
//                 {data.categories.reduce((total, cat) => total + cat.urlCount, 0)} total URLs
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <TagIcon className="w-4 h-4" />
//               <span className="font-sans">
//                 {data.categories.filter(cat => cat.urlCount === 0).length} empty categories
//               </span>
//             </div>
//           </div>
//         </motion.div>

//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Categories */}
//           <div className="lg:col-span-2">
//             <AnimatePresence mode="wait">
//               {filteredAndSortedCategories.length === 0 ? (
//                 <motion.div
//                   key="empty"
//                   initial={{ opacity: 0, scale: 0.95 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, scale: 0.95 }}
//                   className="text-center py-16"
//                 >
//                   <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
//                     <FolderIcon className="w-16 h-16 text-gray-400" />
//                   </div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-3 font-sans">
//                     {searchQuery ? "No categories found" : "No categories yet"}
//                   </h3>
//                   <p className="text-gray-600 mb-8 font-sans max-w-md mx-auto">
//                     {searchQuery 
//                       ? "Try adjusting your search terms or filters" 
//                       : "Create your first category to organize your URLs into meaningful collections"}
//                   </p>
//                   {!searchQuery && canManageCategories && (
//                     <Button 
//                       onClick={() => setIsCreateModalOpen(true)}
//                       className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-sans shadow-lg"
//                       size="lg"
//                     >
//                       <PlusIcon className="w-5 h-5 mr-2" />
//                       Create Your First Category
//                     </Button>
//                   )}
//                 </motion.div>
//               ) : (
//                 <motion.div
//                   key="categories"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}
//                 >
//                   {filteredAndSortedCategories.map((category, index) => (
//                     <motion.div
//                       key={category.id}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: index * 0.05 }}
//                       className="group"
//                     >
//                       {viewMode === 'grid' ? (
//                         <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur">
//                           <CardContent className="p-6">
//                             <div className="flex items-start justify-between mb-4">
//                               <div className="flex items-center gap-3 flex-1">
//                                 <div 
//                                   className="w-6 h-6 rounded-lg shadow-sm border border-white/20"
//                                   style={{ background: category.color }}
//                                 />
//                                 <div className="flex-1">
//                                   <h3 className="font-semibold text-gray-900 font-sans group-hover:text-indigo-600 transition-colors">
//                                     {category.name}
//                                   </h3>
//                                   <div className="flex items-center gap-3 mt-1">
//                                     <span className="text-sm text-gray-500 font-sans">
//                                       {category.urlCount} URL{category.urlCount !== 1 ? 's' : ''}
//                                     </span>
//                                     <span className="text-xs text-gray-400 font-sans">
//                                       {new Date(category.createdAt).toLocaleDateString()}
//                                     </span>
//                                   </div>
//                                 </div>
//                               </div>
//                               {canManageCategories && (
//                                 <DropdownMenu>
//                                   <DropdownMenuTrigger asChild>
//                                     <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
//                                       <EllipsisHorizontalIcon className="w-4 h-4" />
//                                     </Button>
//                                   </DropdownMenuTrigger>
//                                   <DropdownMenuContent align="end">
//                                     <DropdownMenuItem
//                                       onClick={() => openEditModal(category)}
//                                       className="font-sans"
//                                     >
//                                       <PencilIcon className="w-4 h-4 mr-2" />
//                                       Edit
//                                     </DropdownMenuItem>
//                                     <DropdownMenuItem
//                                       onClick={() => handleDuplicateCategory(category)}
//                                       className="font-sans"
//                                     >
//                                       <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
//                                       Duplicate
//                                     </DropdownMenuItem>
//                                     <DropdownMenuItem
//                                       onClick={() => setDeleteCategory(category)}
//                                       className="text-red-600 font-sans"
//                                     >
//                                       <TrashIcon className="w-4 h-4 mr-2" />
//                                       Delete
//                                     </DropdownMenuItem>
//                                   </DropdownMenuContent>
//                                 </DropdownMenu>
//                               )}
//                             </div>
                            
//                             <div className="flex items-center justify-between">
//                               <Badge variant={category.urlCount > 0 ? "default" : "secondary"} className="font-sans">
//                                 {category.urlCount > 0 ? "Active" : "Empty"}
//                               </Badge>
//                               <div className="text-xs text-gray-400 font-sans">
//                                 by {category.createdBy.name || category.createdBy.email}
//                               </div>
//                             </div>
//                           </CardContent>
//                         </Card>
//                       ) : (
//                         <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
//                           <CardContent className="p-4">
//                             <div className="flex items-center justify-between">
//                               <div className="flex items-center gap-4 flex-1">
//                                 <div 
//                                   className="w-8 h-8 rounded-lg shadow-sm border border-white/20"
//                                   style={{ background: category.color }}
//                                 />
//                                 <div className="flex-1">
//                                   <h3 className="font-semibold text-gray-900 font-sans">{category.name}</h3>
//                                   <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
//                                     <span className="font-sans">{category.urlCount} URLs</span>
//                                     <span className="font-sans">Created {new Date(category.createdAt).toLocaleDateString()}</span>
//                                     <span className="font-sans">by {category.createdBy.name || category.createdBy.email}</span>
//                                   </div>
//                                 </div>
//                               </div>
//                               <div className="flex items-center gap-2">
//                                 <Badge variant={category.urlCount > 0 ? "default" : "secondary"} className="font-sans">
//                                   {category.urlCount > 0 ? "Active" : "Empty"}
//                                 </Badge>
//                                 {canManageCategories && (
//                                   <DropdownMenu>
//                                     <DropdownMenuTrigger asChild>
//                                       <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                                         <EllipsisHorizontalIcon className="w-4 h-4" />
//                                       </Button>
//                                     </DropdownMenuTrigger>
//                                     <DropdownMenuContent align="end">
//                                       <DropdownMenuItem
//                                         onClick={() => openEditModal(category)}
//                                         className="font-sans"
//                                       >
//                                         <PencilIcon className="w-4 h-4 mr-2" />
//                                         Edit
//                                       </DropdownMenuItem>
//                                       <DropdownMenuItem
//                                         onClick={() => handleDuplicateCategory(category)}
//                                         className="font-sans"
//                                       >
//                                         <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
//                                         Duplicate
//                                       </DropdownMenuItem>
//                                       <DropdownMenuItem
//                                         onClick={() => setDeleteCategory(category)}
//                                         className="text-red-600 font-sans"
//                                       >
//                                         <TrashIcon className="w-4 h-4 mr-2" />
//                                         Delete
//                                       </DropdownMenuItem>
//                                     </DropdownMenuContent>
//                                   </DropdownMenu>
//                                 )}
//                               </div>
//                             </div>
//                           </CardContent>
//                         </Card>
//                       )}
//                     </motion.div>
//                   ))}
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* Activity Feed */}
//           <div className="lg:col-span-1">
//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
//               <ActivityFeed activities={data.activities} />
//             </motion.div>
//           </div>
//         </div>
//       </div>

//       {/* Edit Modal */}
//       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2 font-sans">
//               <PencilIcon className="w-5 h-5" />
//               Edit Category
//             </DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleUpdateCategory} className="space-y-6">
//             <div>
//               <Label htmlFor="edit-name" className="font-sans font-medium">Category Name</Label>
//               <Input
//                 id="edit-name"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 placeholder="Enter category name"
//                 required
//                 className="font-sans mt-1"
//               />
//             </div>

//             <div>
//               <Label className="font-sans font-medium mb-3 block">Color Style</Label>
//               <Tabs value={formData.colorType} onValueChange={(value) => setFormData({ ...formData, colorType: value as "solid" | "gradient" })}>
//                 <TabsList className="grid w-full grid-cols-2">
//                   <TabsTrigger value="solid" className="font-sans">Solid Color</TabsTrigger>
//                   <TabsTrigger value="gradient" className="font-sans">Gradient</TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="solid" className="mt-4">
//                   <ColorPicker
//                     value={formData.color}
//                     onChange={(color) => setFormData({ ...formData, color })}
//                     type="solid"
//                   />
//                 </TabsContent>
//                 <TabsContent value="gradient" className="mt-4">
//                   <ColorPicker
//                     value={formData.color}
//                     onChange={(color) => setFormData({ ...formData, color })}
//                     type="gradient"
//                   />
//                 </TabsContent>
//               </Tabs>
//             </div>

//             <div className="flex gap-3 pt-4">
//               <Button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 font-sans">
//                 Update Category
//               </Button>
//               <Button 
//                 type="button" 
//                 variant="outline" 
//                 onClick={() => setIsEditModalOpen(false)}
//                 className="font-sans"
//               >
//                 Cancel
//               </Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation */}
//       <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle className="flex items-center gap-2 font-sans">
//               <TrashIcon className="w-5 h-5 text-red-500" />
//               Delete Category
//             </AlertDialogTitle>
//             <AlertDialogDescription className="font-sans">
//               Are you sure you want to delete <span className="font-semibold">"{deleteCategory?.name}"</span>? This action cannot be undone.
//               {deleteCategory?.urlCount && deleteCategory.urlCount > 0 && (
//                 <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
//                   <div className="flex items-center gap-2 text-orange-800">
//                     <LinkIcon className="w-4 h-4" />
//                     <span className="font-medium">
//                       This category contains {deleteCategory.urlCount} URL{deleteCategory.urlCount !== 1 ? 's' : ''}
//                     </span>
//                   </div>
//                   <p className="text-sm text-orange-700 mt-1">
//                     These URLs will become uncategorized but won't be deleted.
//                   </p>
//                 </div>
//               )}
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel className="font-sans">Cancel</AlertDialogCancel>
//             <AlertDialogAction 
//               onClick={handleDeleteCategory}
//               className="bg-red-600 hover:bg-red-700 font-sans"
//             >
//               Delete Category
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   )
// }
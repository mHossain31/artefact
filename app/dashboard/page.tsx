"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import Sidebar from "@/components/dashboard/sidebar"
import UrlCard from "@/components/dashboard/url-card"
import AddUrlModal from "@/components/dashboard/add-url-modal"
import EditUrlModal from "@/components/dashboard/edit-url-modal"
import DeleteUrlModal from "@/components/dashboard/delete-url-modal"
import { PlusIcon, MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon, FunnelIcon } from "@heroicons/react/24/outline"

interface DashboardData {
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
  urls: Array<{
    id: string
    title: string
    url: string
    description?: string
    screenshot?: string
    favicon?: string
    category?: {
      id: string
      name: string
      color: string
      icon?: string
    }
    addedBy: {
      name?: string
      email: string
    }
    createdAt: string
  }>
  categories: Array<{
    id: string
    name: string
    color: string
    icon?: string
  }>
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isAddUrlModalOpen, setIsAddUrlModalOpen] = useState(false)
  const [isEditUrlModalOpen, setIsEditUrlModalOpen] = useState(false)
  const [isDeleteUrlModalOpen, setIsDeleteUrlModalOpen] = useState(false)
  const [selectedUrl, setSelectedUrl] = useState<any>(null)

  useEffect(() => {
    if (user && !authLoading) {
      fetchDashboardData()
    }
  }, [user, authLoading])

  const fetchDashboardData = async () => {
    try {
      console.log('📊 Fetching dashboard data...')
      const response = await fetch("/api/dashboard")
      if (response.ok) {
        const dashboardData = await response.json()
        console.log('✅ Dashboard data fetched successfully')
        setData(dashboardData)
      } else {
        console.error('❌ Failed to fetch dashboard data:', response.status)
      }
    } catch (error) {
      console.error("❌ Failed to fetch dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUrl = (urlData: any) => {
    setSelectedUrl(urlData)
    setIsEditUrlModalOpen(true)
  }

  const handleDeleteUrl = (urlData: any) => {
    setSelectedUrl(urlData)
    setIsDeleteUrlModalOpen(true)
  }

  const handleShareUrl = (urlId: string) => {
    // Copy URL to clipboard or open share modal
    const url = data?.urls.find((u) => u.id === urlId)
    if (url) {
      navigator.clipboard.writeText(url.url)
      // You could show a toast here
    }
  }

  const filteredUrls =
    data?.urls.filter((url) => {
      const matchesSearch =
        url.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        url.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        url.url.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategory === "all" || url.category?.id === selectedCategory

      return matchesSearch && matchesCategory
    }) || []

  // Show loading while checking auth or fetching data
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-sans">
            {authLoading ? 'Checking authentication...' : 'Loading your dashboard...'}
          </p>
        </div>
      </div>
    )
  }

  // Auth hook will handle redirect if user is not authenticated
  if (!user) {
    return null
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-sans">Failed to load dashboard. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentWorkspace={data.currentWorkspace} workspaces={data.workspaces} user={data.user} />

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sans">
                Welcome back, {data.user.name || "User"}!
              </h1>
              <p className="text-gray-600 font-sans">
                Manage your URLs in <span className="font-medium">{data.currentWorkspace.name}</span>
              </p>
            </div>
            <Button
              onClick={() => setIsAddUrlModalOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-sans"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add URL
            </Button>
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex flex-1 gap-4 w-full sm:w-auto">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search URLs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 font-sans"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 font-sans">
                  <FunnelIcon className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-sans">
                    All Categories
                  </SelectItem>
                  {data.categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="font-sans">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                        {category.icon} {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="font-sans"
              >
                <Squares2X2Icon className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="font-sans"
              >
                <ListBulletIcon className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* URLs Grid/List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {filteredUrls.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 font-sans">
                {searchQuery || selectedCategory !== "all" ? "No URLs found" : "No URLs yet"}
              </h3>
              <p className="text-gray-600 mb-6 font-sans">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start by adding your first URL to this workspace"}
              </p>
              {!searchQuery && selectedCategory === "all" && (
                <Button
                  onClick={() => setIsAddUrlModalOpen(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-sans"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Your First URL
                </Button>
              )}
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
              {filteredUrls.map((url, index) => (
                <motion.div
                  key={url.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="h-full" // Ensure consistent height
                >
                  <UrlCard url={url} onEdit={handleEditUrl} onDelete={handleDeleteUrl} onShare={handleShareUrl} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <AddUrlModal
        isOpen={isAddUrlModalOpen}
        onClose={() => setIsAddUrlModalOpen(false)}
        categories={data.categories}
        onUrlAdded={fetchDashboardData}
      />

      <EditUrlModal
        isOpen={isEditUrlModalOpen}
        onClose={() => setIsEditUrlModalOpen(false)}
        urlData={selectedUrl}
        categories={data.categories}
        onUrlUpdated={fetchDashboardData}
      />

      <DeleteUrlModal
        isOpen={isDeleteUrlModalOpen}
        onClose={() => setIsDeleteUrlModalOpen(false)}
        urlData={selectedUrl}
        onUrlDeleted={fetchDashboardData}
      />
    </div>
  )
}













// "use client"

// import { useState, useEffect } from "react"
// import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import Sidebar from "@/components/dashboard/sidebar"
// import UrlCard from "@/components/dashboard/url-card"
// import AddUrlModal from "@/components/dashboard/add-url-modal"
// import EditUrlModal from "@/components/dashboard/edit-url-modal"
// import DeleteUrlModal from "@/components/dashboard/delete-url-modal"
// import { PlusIcon, MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon, FunnelIcon } from "@heroicons/react/24/outline"

// interface DashboardData {
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
//   urls: Array<{
//     id: string
//     title: string
//     url: string
//     description?: string
//     screenshot?: string
//     favicon?: string
//     category?: {
//       id: string
//       name: string
//       color: string
//       icon?: string
//     }
//     addedBy: {
//       name?: string
//       email: string
//     }
//     createdAt: string
//   }>
//   categories: Array<{
//     id: string
//     name: string
//     color: string
//     icon?: string
//   }>
// }

// export default function DashboardPage() {
//   const [data, setData] = useState<DashboardData | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [selectedCategory, setSelectedCategory] = useState("")
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
//   const [isAddUrlModalOpen, setIsAddUrlModalOpen] = useState(false)
//   const [isEditUrlModalOpen, setIsEditUrlModalOpen] = useState(false)
//   const [isDeleteUrlModalOpen, setIsDeleteUrlModalOpen] = useState(false)
//   const [selectedUrl, setSelectedUrl] = useState<any>(null)

//   useEffect(() => {
//     fetchDashboardData()
//   }, [])

//   const fetchDashboardData = async () => {
//     try {
//       const response = await fetch("/api/dashboard")
//       if (response.ok) {
//         const dashboardData = await response.json()
//         setData(dashboardData)
//       }
//     } catch (error) {
//       console.error("Failed to fetch dashboard data:", error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleEditUrl = (urlData: any) => {
//     setSelectedUrl(urlData)
//     setIsEditUrlModalOpen(true)
//   }

//   const handleDeleteUrl = (urlData: any) => {
//     setSelectedUrl(urlData)
//     setIsDeleteUrlModalOpen(true)
//   }

//   const handleShareUrl = (urlId: string) => {
//     // Copy URL to clipboard or open share modal
//     const url = data?.urls.find((u) => u.id === urlId)
//     if (url) {
//       navigator.clipboard.writeText(url.url)
//       // You could show a toast here
//     }
//   }

//   const filteredUrls =
//     data?.urls.filter((url) => {
//       const matchesSearch =
//         url.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         url.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         url.url.toLowerCase().includes(searchQuery.toLowerCase())

//       const matchesCategory = !selectedCategory || url.category?.id === selectedCategory

//       return matchesSearch && matchesCategory
//     }) || []

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//           <p className="text-gray-600 font-sans">Loading your dashboard...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!data) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-600 font-sans">Failed to load dashboard. Please refresh the page.</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Sidebar currentWorkspace={data.currentWorkspace} workspaces={data.workspaces} user={data.user} />

//       {/* Main Content */}
//       <div className="ml-64 p-8">
//         {/* Header */}
//         <div className="mb-8">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="flex items-center justify-between mb-6"
//           >
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sans">
//                 Welcome back, {data.user.name || "User"}!
//               </h1>
//               <p className="text-gray-600 font-sans">
//                 Manage your URLs in <span className="font-medium">{data.currentWorkspace.name}</span>
//               </p>
//             </div>
//             <Button
//               onClick={() => setIsAddUrlModalOpen(true)}
//               className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-sans"
//             >
//               <PlusIcon className="w-5 h-5 mr-2" />
//               Add URL
//             </Button>
//           </motion.div>

//           {/* Filters and Search */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200"
//           >
//             <div className="flex flex-1 gap-4 w-full sm:w-auto">
//               <div className="relative flex-1 max-w-md">
//                 <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <Input
//                   placeholder="Search URLs..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-10 font-sans"
//                 />
//               </div>

//               <Select value={selectedCategory} onValueChange={setSelectedCategory}>
//                 <SelectTrigger className="w-48 font-sans">
//                   <FunnelIcon className="w-4 h-4 mr-2" />
//                   <SelectValue placeholder="All Categories" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="" className="font-sans">
//                     All Categories
//                   </SelectItem>
//                   {data.categories.map((category) => (
//                     <SelectItem key={category.id} value={category.id} className="font-sans">
//                       <div className="flex items-center gap-2">
//                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
//                         {category.icon} {category.name}
//                       </div>
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="flex items-center gap-2">
//               <Button
//                 variant={viewMode === "grid" ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => setViewMode("grid")}
//                 className="font-sans"
//               >
//                 <Squares2X2Icon className="w-4 h-4" />
//               </Button>
//               <Button
//                 variant={viewMode === "list" ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => setViewMode("list")}
//                 className="font-sans"
//               >
//                 <ListBulletIcon className="w-4 h-4" />
//               </Button>
//             </div>
//           </motion.div>
//         </div>

//         {/* URLs Grid/List */}
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
//           {filteredUrls.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <PlusIcon className="w-12 h-12 text-gray-400" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2 font-sans">
//                 {searchQuery || selectedCategory ? "No URLs found" : "No URLs yet"}
//               </h3>
//               <p className="text-gray-600 mb-6 font-sans">
//                 {searchQuery || selectedCategory
//                   ? "Try adjusting your search or filters"
//                   : "Start by adding your first URL to this workspace"}
//               </p>
//               {!searchQuery && !selectedCategory && (
//                 <Button
//                   onClick={() => setIsAddUrlModalOpen(true)}
//                   className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-sans"
//                 >
//                   <PlusIcon className="w-5 h-5 mr-2" />
//                   Add Your First URL
//                 </Button>
//               )}
//             </div>
//           ) : (
//             <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
//               {filteredUrls.map((url, index) => (
//                 <motion.div
//                   key={url.id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                 >
//                   <UrlCard url={url} onEdit={handleEditUrl} onDelete={handleDeleteUrl} onShare={handleShareUrl} />
//                 </motion.div>
//               ))}
//             </div>
//           )}
//         </motion.div>
//       </div>

//       {/* Modals */}
//       <AddUrlModal
//         isOpen={isAddUrlModalOpen}
//         onClose={() => setIsAddUrlModalOpen(false)}
//         categories={data.categories}
//         onUrlAdded={fetchDashboardData}
//       />

//       <EditUrlModal
//         isOpen={isEditUrlModalOpen}
//         onClose={() => setIsEditUrlModalOpen(false)}
//         urlData={selectedUrl}
//         categories={data.categories}
//         onUrlUpdated={fetchDashboardData}
//       />

//       <DeleteUrlModal
//         isOpen={isDeleteUrlModalOpen}
//         onClose={() => setIsDeleteUrlModalOpen(false)}
//         urlData={selectedUrl}
//         onUrlDeleted={fetchDashboardData}
//       />
//     </div>
//   )
// }

"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthMe } from '@/hooks/useAuthMe'
import { useTheme } from '@/hooks/useTheme'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UtensilsCrossed, TrendingUp, Gift, Award } from "lucide-react"
import LoadingState from '@/components/LoadingState'

const HomePage = () => {
  const router = useRouter()
  const { data: user, isLoading: isUserLoading } = useAuthMe()
  const { 
    sidebarPrimary,
    sidebarPrimaryForeground,
  } = useTheme()

  useEffect(() => {
    if (isUserLoading) return

    if (!user) {
      router.push('/auth/login')
      return
    }

    // Check if user is internal (super_admin, admin, teacher)
    const internalRoles = ['super_admin', 'admin', 'teacher']
    if (internalRoles.includes(user.role_name.toLowerCase())) {
      router.push('/dashboard')
    }
  }, [user, isUserLoading, router])

  if (isUserLoading || !user) {
    return <LoadingState message="Loading dashboard..." />
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div 
        className="relative overflow-hidden rounded-xl p-8 shadow-2xl"
        style={{ 
          backgroundColor: sidebarPrimary || '#1E293B',
          color: sidebarPrimaryForeground || '#FFFFFF'
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Selamat Datang, {user.full_name}!
          </h1>
          <p className="opacity-80">
            {user.role_name}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items Today</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No data available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 0</div>
            <p className="text-xs text-muted-foreground">
              No data available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Seller Daily</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">-</div>
            <p className="text-xs text-muted-foreground">
              No data available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complimentary Items</CardTitle>
            <Gift className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No data available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for future features */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Dashboard content will be available soon. Please check back later.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default HomePage
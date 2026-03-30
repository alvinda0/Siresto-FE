"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuthMe } from '@/hooks/useAuthMe'
import { useTheme } from '@/hooks/useTheme'
import { homeService } from '@/services/home.service'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UtensilsCrossed, TrendingUp, Gift, Award } from "lucide-react"
import LoadingState from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const HomePage = () => {
  const router = useRouter()
  const { data: user, isLoading: isUserLoading } = useAuthMe()
  const { 
    sidebarPrimary,
    sidebarPrimaryForeground,
  } = useTheme()

  const { data: homeData, isLoading: isHomeLoading, error } = useQuery({
    queryKey: ['home-data'],
    queryFn: () => homeService.getHomeData(),
    enabled: !!user && user.role.type === 'EXTERNAL',
  })

  useEffect(() => {
    if (isUserLoading) return

    if (!user) {
      router.push('/auth/login')
      return
    }

    // Check if user is internal
    if (user.role.type !== 'EXTERNAL') {
      router.push('/dashboard')
    }
  }, [user, isUserLoading, router])

  if (isUserLoading || !user) {
    return <LoadingState message="Loading dashboard..." />
  }

  if (isHomeLoading) {
    return <LoadingState message="Loading dashboard data..." />
  }

  if (error) {
    return <ErrorState code={500} title="Failed to load dashboard data" />
  }

  const data = homeData?.data

  // Calculate totals
  const todayItems = data?.total_items_by_date.find(d => d.date === new Date().toISOString().split('T')[0])?.value || 0
  const yesterdayItems = data?.total_items_by_date.find(d => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return d.date === yesterday.toISOString().split('T')[0]
  })?.value || 0
  
  const todayRevenue = data?.revenue_by_date.find(d => d.date === new Date().toISOString().split('T')[0])?.value || 0
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Prepare chart data - get last 7 days
  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date.toISOString().split('T')[0])
    }
    return days
  }

  const last7Days = getLast7Days()
  
  const chartData = last7Days.map(date => {
    const itemData = data?.total_items_by_date.find(d => d.date === date)
    const revenueData = data?.revenue_by_date.find(d => d.date === date)
    
    return {
      date: new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      items: itemData?.value || 0,
      revenue: revenueData?.value || 0,
    }
  })

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
            Selamat Datang, {user.name}!
          </h1>
          <p className="opacity-80">
            {user.company?.name} - {user.role.display_name}
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
            <div className="text-2xl font-bold">{todayItems}</div>
            <p className="text-xs text-muted-foreground">
              {yesterdayItems > 0 && `Yesterday: ${yesterdayItems}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todayRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Pendapatan hari ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Seller Daily</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {data?.best_selling_daily[0]?.product_name || '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {data?.best_selling_daily[0]?.total_qty || 0} items sold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complimentary Items</CardTitle>
            <Gift className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.complimentary_items.reduce((sum, item) => sum + item.total_qty, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total gratis items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Items - 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="items" fill="#3b82f6" name="Total Items" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue - 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Revenue (IDR)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Best Selling Products */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Best Selling Daily</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.best_selling_daily.slice(0, 5).map((product, index) => (
                <div key={product.product_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{product.product_name}</p>
                      <p className="text-xs text-muted-foreground">{product.total_qty} items</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(product.total_amount)}</p>
                </div>
              ))}
              {(!data?.best_selling_daily || data.best_selling_daily.length === 0) && (
                <p className="text-sm text-muted-foreground">Belum ada data</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Best Selling Weekly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.best_selling_weekly.slice(0, 5).map((product, index) => (
                <div key={product.product_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{product.product_name}</p>
                      <p className="text-xs text-muted-foreground">{product.total_qty} items</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(product.total_amount)}</p>
                </div>
              ))}
              {(!data?.best_selling_weekly || data.best_selling_weekly.length === 0) && (
                <p className="text-sm text-muted-foreground">Belum ada data</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Best Selling Monthly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.best_selling_monthly.slice(0, 5).map((product, index) => (
                <div key={product.product_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{product.product_name}</p>
                      <p className="text-xs text-muted-foreground">{product.total_qty} items</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(product.total_amount)}</p>
                </div>
              ))}
              {(!data?.best_selling_monthly || data.best_selling_monthly.length === 0) && (
                <p className="text-sm text-muted-foreground">Belum ada data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complimentary Items */}
      <Card>
        <CardHeader>
          <CardTitle>Complimentary Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.complimentary_items.map((item, index) => (
              <div key={item.product_id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold">
                    {index + 1}
                  </span>
                  <p className="text-sm font-medium">{item.product_name}</p>
                </div>
                <p className="text-sm font-semibold">{item.total_qty} items</p>
              </div>
            ))}
            {(!data?.complimentary_items || data.complimentary_items.length === 0) && (
              <p className="text-sm text-muted-foreground">Belum ada complimentary items</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default HomePage
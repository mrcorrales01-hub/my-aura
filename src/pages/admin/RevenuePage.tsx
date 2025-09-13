import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Zap, Gift, Users } from "lucide-react"

type Snapshot = { 
  plus: number
  pro: number
  free: number
  total: number
  updated_at?: string 
}

export default function RevenuePage() {
  const [snap, setSnap] = useState<Snapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .from("subscribers")
          .select("subscribed, subscription_tier")
        
        if (error) throw error
        
        const plus = data.filter(x => x.subscribed && x.subscription_tier === 'plus').length
        const pro = data.filter(x => x.subscribed && x.subscription_tier === 'pro').length
        const free = data.length - plus - pro
        
        setSnap({ 
          plus, 
          pro, 
          free, 
          total: data.length, 
          updated_at: new Date().toISOString() 
        })
      } catch (error) {
        console.error('Failed to load revenue data:', error)
        setSnap({ plus: 0, pro: 0, free: 0, total: 0 })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!snap) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Revenue Dashboard</h1>
        <p className="text-muted-foreground">Failed to load revenue data.</p>
      </div>
    )
  }

  const revenue = {
    pro: snap.pro * 299, // Assuming 299 SEK/month for Pro
    plus: snap.plus * 99, // Assuming 99 SEK/month for Plus
    total: (snap.pro * 299) + (snap.plus * 99)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Revenue Dashboard</h1>
        <p className="text-muted-foreground">
          Last updated: {snap.updated_at ? new Date(snap.updated_at).toLocaleString() : 'Unknown'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Pro Subscribers"
          value={snap.pro}
          icon={Crown}
          color="text-amber-600"
          revenue={revenue.pro}
        />
        <MetricCard
          label="Plus Subscribers"
          value={snap.plus}
          icon={Zap}
          color="text-primary"
          revenue={revenue.plus}
        />
        <MetricCard
          label="Free Users"
          value={snap.free}
          icon={Gift}
          color="text-muted-foreground"
        />
        <MetricCard
          label="Total Users"
          value={snap.total}
          icon={Users}
          color="text-foreground"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Revenue (SEK)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenue.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated based on subscription tiers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {snap.total > 0 ? (((snap.plus + snap.pro) / snap.total) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Free to paid conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Revenue Per User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {snap.total > 0 ? Math.round(revenue.total / snap.total) : 0} SEK
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly ARPU
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ 
  label, 
  value, 
  icon: Icon, 
  color = "text-foreground",
  revenue 
}: {
  label: string
  value: number
  icon: any
  color?: string
  revenue?: number
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {revenue !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            {revenue.toLocaleString()} SEK/month
          </p>
        )}
      </CardContent>
    </Card>
  )
}
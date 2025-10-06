"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Users, Activity, Network, Clock, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";

type CivicAction = {
  id: string;
  title: string;
  description: string;
  category: string;
  impact_points: number;
  verified: boolean;
  location_name: string;
  created_at: string;
  user_profiles: {
    username: string;
    full_name: string;
  } | null;
};

export default function DashboardPage() {
  const [actions, setActions] = useState<CivicAction[]>([]);
  const [stats, setStats] = useState({
    totalActions: 0,
    totalImpactPoints: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadDashboardData = async () => {
    try {
      // Fetch recent civic actions with user profiles
      const { data: actionsData, error: actionsError } = await supabase
        .from("civic_actions")
        .select(`
          *,
          user_profiles (
            username,
            full_name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (actionsError) throw actionsError;

      // Calculate stats
      const { count: totalActions } = await supabase
        .from("civic_actions")
        .select("*", { count: "exact", head: true });

      const { data: impactData } = await supabase
        .from("civic_actions")
        .select("impact_points");

      const totalImpactPoints = impactData?.reduce((sum, action) => sum + (action.impact_points || 0), 0) || 0;

      const { count: activeUsers } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true });

      setActions(actionsData || []);
      setStats({
        totalActions: totalActions || 0,
        totalImpactPoints,
        activeUsers: activeUsers || 0,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      "Mutual Aid": "❤️",
      "Sustainability": "🌱",
      "Housing": "🏠",
      "Education": "📚",
      "Arts & Culture": "🎨",
      "Food Security": "🍎",
      "Health & Wellness": "💪",
      "Infrastructure": "🏗️",
      "Advocacy": "📢",
      "Emergency Response": "🚨",
    };
    return icons[category] || "📍";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Track civic actions and analyze community networks
            </p>
          </div>
          <div className="flex gap-2">
            {currentUser ? (
              <Button asChild>
                <Link href="/dashboard/log-action">
                  <Plus className="mr-2 h-4 w-4" />
                  Log Action
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/auth/signup">
                  <Plus className="mr-2 h-4 w-4" />
                  Sign Up to Log Actions
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/network">
                <Network className="mr-2 h-4 w-4" />
                View Network
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalActions}</div>
              <p className="text-xs text-muted-foreground">Community contributions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Making impact</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Impact</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalImpactPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Impact points</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentUser ? "—" : "Sign in"}</div>
              <p className="text-xs text-muted-foreground">
                {currentUser ? "Start logging actions!" : "to see your rank"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Recent Activity</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Civic Activity Stream</CardTitle>
                <CardDescription>
                  Latest community actions making a difference
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading actions...
                  </div>
                ) : actions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No actions logged yet. Be the first to make an impact!
                    </p>
                    <Button asChild>
                      <Link href={currentUser ? "/dashboard/log-action" : "/auth/signup"}>
                        <Plus className="mr-2 h-4 w-4" />
                        {currentUser ? "Log Your First Action" : "Sign Up to Get Started"}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {actions.map((action) => (
                      <div key={action.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{action.title}</p>
                            {action.verified && (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {action.description || "No description provided"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="gap-1">
                              {getCategoryIcon(action.category)} {action.category}
                            </Badge>
                            {action.user_profiles && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {action.user_profiles.username || action.user_profiles.full_name}
                              </span>
                            )}
                            {action.location_name && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {action.location_name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg font-bold text-green-600">+{action.impact_points}</p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Mutual Aid", icon: "❤️", count: 0 },
                { name: "Sustainability", icon: "🌱", count: 0 },
                { name: "Housing", icon: "🏠", count: 0 },
                { name: "Education", icon: "📚", count: 0 },
                { name: "Arts & Culture", icon: "🎨", count: 0 },
                { name: "Food Security", icon: "🍎", count: 0 },
              ].map((category) => (
                <Card key={category.name}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {actions.filter(a => a.category === category.name).length}
                    </p>
                    <p className="text-xs text-muted-foreground">actions logged</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

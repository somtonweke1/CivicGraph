"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Import ALL revolutionary components
import { RealtimeActivityFeed } from "@/components/realtime-activity-feed";
import { NetworkGraphViz } from "@/components/network-graph-viz";
import { AIRecommendations } from "@/components/ai-recommendations";
import { ImpactMap } from "@/components/impact-map";
import { AchievementSystem } from "@/components/achievement-system";
import { PredictiveAnalytics } from "@/components/predictive-analytics";
import { AIChatAssistant } from "@/components/ai-chat-assistant";

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              CivicGraph Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              AI-Powered Civic Impact Platform with Real-Time Analytics
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentUser ? (
              <>
                <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <Link href="/dashboard/log-action">
                    Log Action
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link href="/leaderboard">
                    Leaderboard
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Link href="/auth/signup">
                  Sign Up to Get Started
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Main Revolutionary Features in Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
            <TabsTrigger value="overview" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="network" className="gap-2">
              <NetworkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Network</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Impact Map</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI Insights</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Real-Time Feed + AI Recommendations */}
          <TabsContent value="overview" className="space-y-6">
            {/* AI Recommendations Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-bold">AI-Powered Recommendations</h2>
              </div>
              <AIRecommendations />
            </div>

            {/* Real-Time Activity Feed */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Live Community Activity</h2>
              <RealtimeActivityFeed />
            </div>
          </TabsContent>

          {/* Network Visualization Tab */}
          <TabsContent value="network" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Interactive Network Graph</h2>
                <p className="text-muted-foreground">
                  Explore relationships between users, actions, and locations in real-time
                </p>
              </div>
              <NetworkGraphViz />
            </div>
          </TabsContent>

          {/* Predictive Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Predictive Analytics</h2>
                <p className="text-muted-foreground">
                  AI-powered forecasts and insights for community growth
                </p>
              </div>
              <PredictiveAnalytics />
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Your Achievements</h2>
                <p className="text-muted-foreground">
                  Track progress, unlock rewards, and earn bonus points
                </p>
              </div>
              <AchievementSystem />
            </div>
          </TabsContent>

          {/* Impact Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Geospatial Impact Map</h2>
                <p className="text-muted-foreground">
                  Visualize civic impact across geographic locations
                </p>
              </div>
              <ImpactMap />
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">AI-Powered Insights</h2>
                <p className="text-muted-foreground">
                  Get personalized recommendations and strategic guidance
                </p>
              </div>

              {/* AI Recommendations */}
              <AIRecommendations />

              {/* Predictive Analytics Summary */}
              <PredictiveAnalytics />
            </div>
          </TabsContent>
        </Tabs>

        {/* Floating AI Chat Assistant - Always Visible */}
        <AIChatAssistant />
      </div>
    </div>
  );
}

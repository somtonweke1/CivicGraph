"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Import all the revolutionary components
import { RealtimeActivityFeed } from "@/components/realtime-activity-feed";
import { NetworkGraphViz } from "@/components/network-graph-viz";
import { AIRecommendations } from "@/components/ai-recommendations";
import { ImpactMap } from "@/components/impact-map";
import { AchievementSystem } from "@/components/achievement-system";
import { PredictiveAnalytics } from "@/components/predictive-analytics";
import { AIChatAssistant } from "@/components/ai-chat-assistant";

export default function EnhancedDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              CivicGraph Dashboard
            </h1>
            <p className="text-muted-foreground">
              Analytics, insights, and real-time civic impact tracking
            </p>
          </div>
          <div className="flex gap-2">
            {currentUser ? (
              <>
                <Button asChild>
                  <Link href="/dashboard/log-action">
                    Log Action
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/leaderboard">
                    Leaderboard
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link href="/auth/signup">
                  Sign Up to Get Started
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="map">Impact Map</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* AI Recommendations */}
            <AIRecommendations />

            {/* Real-time Activity Feed */}
            <RealtimeActivityFeed />
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network" className="space-y-6">
            <NetworkGraphViz />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <PredictiveAnalytics />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <AchievementSystem />
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <ImpactMap />
          </TabsContent>
        </Tabs>

        {/* Floating AI Chat Assistant */}
        <AIChatAssistant />
      </div>
    </div>
  );
}

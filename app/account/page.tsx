"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Crown, Zap, TrendingUp, Calendar, CreditCard, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [usage, setUsage] = useState({ current: 0, limit: 10 });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);

        // Get current month's action count
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count } = await supabase
          .from("civic_actions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", startOfMonth.toISOString());

        setUsage({
          current: count || 0,
          limit: profileData.subscription_tier === "Free" ? 10 : 999999,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      // TODO: Implement Stripe portal session
      // For now, redirect to pricing
      router.push("/pricing");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Profile not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const tier = profile.subscription_tier || "Free";
  const isFreeTier = tier === "Free";
  const usagePercent = isFreeTier ? (usage.current / usage.limit) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Account Settings</h1>
            <p className="text-muted-foreground">
              Manage your subscription and account preferences
            </p>
          </div>

          {/* Subscription Card */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {tier !== "Free" && <Crown className="h-6 w-6 text-yellow-500" />}
                    {tier} Plan
                  </CardTitle>
                  <CardDescription>
                    {isFreeTier
                      ? "Upgrade to unlock unlimited actions and premium features"
                      : "You have full access to all premium features"}
                  </CardDescription>
                </div>
                <Badge
                  variant={profile.subscription_status === "active" ? "default" : "secondary"}
                  className="text-lg px-4 py-2"
                >
                  {profile.subscription_status || "Free"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Usage Stats for Free Tier */}
              {isFreeTier && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Actions this month</span>
                    <span className="font-semibold">
                      {usage.current} / {usage.limit}
                    </span>
                  </div>
                  <Progress value={usagePercent} className="h-2" />
                  {usage.current >= usage.limit && (
                    <p className="text-sm text-red-600">
                      ⚠️ You've reached your monthly limit. Upgrade to continue!
                    </p>
                  )}
                </div>
              )}

              {/* Features List */}
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Actions per month</p>
                    <p className="text-sm text-muted-foreground">
                      {isFreeTier ? "10 actions" : "Unlimited"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">AI Recommendations</p>
                    <p className="text-sm text-muted-foreground">
                      {isFreeTier ? "Basic only" : "Full GPT-4 access"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Settings className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Data Export</p>
                    <p className="text-sm text-muted-foreground">
                      {isFreeTier ? "Not available" : "CSV & JSON"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Crown className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Priority Support</p>
                    <p className="text-sm text-muted-foreground">
                      {isFreeTier ? "Community only" : "Priority response"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4 border-t">
                {isFreeTier ? (
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    <Link href="/pricing">
                      <Crown className="mr-2 h-5 w-5" />
                      Upgrade to Pro
                    </Link>
                  </Button>
                ) : (
                  <Button onClick={handleManageSubscription} size="lg" variant="outline">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Manage Subscription
                  </Button>
                )}
                <Button asChild variant="outline" size="lg">
                  <Link href="/pricing">View All Plans</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Profile Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Username</label>
                  <p className="text-lg font-semibold">{profile.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-lg font-semibold">{profile.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Impact Points</label>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    {profile.total_impact_points?.toLocaleString() || 0}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Streak</label>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    {profile.streak_days || 0} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-xl text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full md:w-auto"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

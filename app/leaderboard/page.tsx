"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type LeaderboardUser = {
  id: string;
  username: string;
  full_name: string;
  total_impact_points: number;
  actions_count: number;
  reputation_score: number;
};

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("total_impact_points", { ascending: false })
        .limit(100);

      if (error) throw error;

      setLeaders(data || []);

      // Find current user rank
      if (currentUser && data) {
        const userIndex = data.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
          setCurrentUserRank(userIndex + 1);
        }
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "Champion";
    if (rank === 2) return "Runner-up";
    if (rank === 3) return "Third Place";
    return rank.toString();
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500">Champion</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400">Runner-up</Badge>;
    if (rank === 3) return <Badge className="bg-amber-700">Third Place</Badge>;
    if (rank <= 10) return <Badge variant="secondary">Top 10</Badge>;
    return null;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4">
            Back to Dashboard
          </Button>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            See who's making the biggest impact in our community
          </p>
        </div>

        {/* Current User Card */}
        {currentUser && currentUserRank && (
          <Card className="mb-6 border-primary bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-primary">
                    #{currentUserRank}
                  </div>
                  <div>
                    <p className="font-medium">Your Rank</p>
                    <p className="text-sm text-muted-foreground">
                      Keep logging actions to climb higher!
                    </p>
                  </div>
                </div>
                <Button asChild>
                  <Link href="/dashboard/log-action">
                    Log Action
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 3 Podium */}
        {!loading && leaders.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* Second Place */}
            <Card className="mt-8">
              <CardHeader className="text-center pb-3">
                <div className="mx-auto mb-2">
                </div>
                <CardTitle className="text-lg">2nd Place</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Avatar className="mx-auto mb-2 h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {getInitials(leaders[1].full_name || leaders[1].username)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium">{leaders[1].username}</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  {leaders[1].total_impact_points.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">points</p>
              </CardContent>
            </Card>

            {/* First Place */}
            <Card className="border-yellow-500 border-2 bg-yellow-500/10">
              <CardHeader className="text-center pb-3">
                <div className="mx-auto mb-2">
                </div>
                <CardTitle className="text-lg">Champion</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Avatar className="mx-auto mb-2 h-20 w-20">
                  <AvatarFallback className="text-xl">
                    {getInitials(leaders[0].full_name || leaders[0].username)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium text-lg">{leaders[0].username}</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {leaders[0].total_impact_points.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">points</p>
              </CardContent>
            </Card>

            {/* Third Place */}
            <Card className="mt-8">
              <CardHeader className="text-center pb-3">
                <div className="mx-auto mb-2">
                </div>
                <CardTitle className="text-lg">3rd Place</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Avatar className="mx-auto mb-2 h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {getInitials(leaders[2].full_name || leaders[2].username)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium">{leaders[2].username}</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  {leaders[2].total_impact_points.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">points</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>
              All-time impact leaders in our community
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading leaderboard...
              </div>
            ) : leaders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No users yet. Be the first to join!
                </p>
                <Button asChild>
                  <Link href="/auth/signup">Sign Up Now</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {leaders.map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      currentUser?.id === user.id ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2 w-12">
                        {getRankIcon(index + 1)}
                        <span className="font-bold text-lg">#{index + 1}</span>
                      </div>
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(user.full_name || user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.username}</p>
                          {getRankBadge(index + 1)}
                          {currentUser?.id === user.id && (
                            <Badge variant="outline">You</Badge>
                          )}
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            {user.actions_count} actions
                          </span>
                          <span className="flex items-center gap-1">
                            {user.reputation_score} reputation
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        {user.total_impact_points.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        {!currentUser && (
          <Card className="mt-6 border-primary bg-primary/5">
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-bold mb-2">Join the Leaderboard!</h3>
              <p className="text-muted-foreground mb-4">
                Start logging civic actions and see your name here
              </p>
              <Button asChild size="lg">
                <Link href="/auth/signup">
                  Sign Up Now
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

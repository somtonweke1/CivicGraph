"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Zap, Target, Users, TrendingUp, Award, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type Achievement = {
  id: string;
  icon: any;
  name: string;
  description: string;
  requirement: number;
  current: number;
  unlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
  reward_points: number;
};

export function AchievementSystem() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState({
    total_actions: 0,
    total_impact: 0,
    unique_categories: 0,
    verified_actions: 0,
    streak_days: 0,
  });
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch user's civic actions
    const { data: actions } = await supabase
      .from("civic_actions")
      .select("*")
      .eq("user_id", user.id);

    if (!actions) return;

    const stats = {
      total_actions: actions.length,
      total_impact: actions.reduce((sum, a) => sum + (a.impact_points || 0), 0),
      unique_categories: new Set(actions.map(a => a.category)).size,
      verified_actions: actions.filter(a => a.verified).length,
      streak_days: calculateStreak(actions),
    };

    setUserStats(stats);
    generateAchievements(stats);
  };

  const calculateStreak = (actions: any[]): number => {
    if (actions.length === 0) return 0;

    const dates = actions
      .map(a => new Date(a.created_at).toDateString())
      .sort()
      .reverse();

    let streak = 1;
    const today = new Date().toDateString();

    if (dates[0] !== today) return 0;

    for (let i = 0; i < dates.length - 1; i++) {
      const current = new Date(dates[i]);
      const next = new Date(dates[i + 1]);
      const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const generateAchievements = (stats: typeof userStats) => {
    const allAchievements: Achievement[] = [
      // First Steps
      {
        id: "first_action",
        icon: Star,
        name: "First Steps",
        description: "Log your first civic action",
        requirement: 1,
        current: stats.total_actions,
        unlocked: stats.total_actions >= 1,
        rarity: "common",
        reward_points: 10,
      },
      // Rising Star
      {
        id: "rising_star",
        icon: TrendingUp,
        name: "Rising Star",
        description: "Log 10 civic actions",
        requirement: 10,
        current: stats.total_actions,
        unlocked: stats.total_actions >= 10,
        rarity: "rare",
        reward_points: 50,
      },
      // Impact Champion
      {
        id: "impact_champion",
        icon: Zap,
        name: "Impact Champion",
        description: "Earn 100 total impact points",
        requirement: 100,
        current: stats.total_impact,
        unlocked: stats.total_impact >= 100,
        rarity: "epic",
        reward_points: 100,
      },
      // Category Explorer
      {
        id: "category_explorer",
        icon: Target,
        name: "Category Explorer",
        description: "Complete actions in 5 different categories",
        requirement: 5,
        current: stats.unique_categories,
        unlocked: stats.unique_categories >= 5,
        rarity: "rare",
        reward_points: 75,
      },
      // Verified Pro
      {
        id: "verified_pro",
        icon: Award,
        name: "Verified Pro",
        description: "Get 5 actions verified",
        requirement: 5,
        current: stats.verified_actions,
        unlocked: stats.verified_actions >= 5,
        rarity: "epic",
        reward_points: 150,
      },
      // Streak Master
      {
        id: "streak_master",
        icon: Trophy,
        name: "Streak Master",
        description: "Maintain a 7-day action streak",
        requirement: 7,
        current: stats.streak_days,
        unlocked: stats.streak_days >= 7,
        rarity: "legendary",
        reward_points: 200,
      },
      // Community Builder
      {
        id: "community_builder",
        icon: Users,
        name: "Community Builder",
        description: "Log 50 civic actions",
        requirement: 50,
        current: stats.total_actions,
        unlocked: stats.total_actions >= 50,
        rarity: "legendary",
        reward_points: 500,
      },
    ];

    // Check for newly unlocked achievements
    const previousAchievements = achievements;
    const nowUnlocked = allAchievements.filter(a => a.unlocked);
    const wasUnlocked = previousAchievements.filter(a => a.unlocked);

    if (nowUnlocked.length > wasUnlocked.length) {
      const newAchievement = nowUnlocked.find(
        a => !wasUnlocked.some(w => w.id === a.id)
      );
      if (newAchievement) {
        setNewlyUnlocked(newAchievement);
        toast.success(`🏆 Achievement Unlocked: ${newAchievement.name}!`, {
          description: `You earned ${newAchievement.reward_points} bonus points!`,
        });
        setTimeout(() => setNewlyUnlocked(null), 5000);
      }
    }

    setAchievements(allAchievements);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500";
      case "rare":
        return "bg-blue-500";
      case "epic":
        return "bg-purple-500";
      case "legendary":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "shadow-[0_0_20px_rgba(234,179,8,0.5)]";
      case "epic":
        return "shadow-[0_0_15px_rgba(168,85,247,0.5)]";
      case "rare":
        return "shadow-[0_0_10px_rgba(59,130,246,0.5)]";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Newly Unlocked Achievement Modal */}
      <AnimatePresence>
        {newlyUnlocked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setNewlyUnlocked(null)}
          >
            <Card className={`max-w-md ${getRarityGlow(newlyUnlocked.rarity)}`}>
              <CardContent className="pt-6 text-center">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                >
                  <newlyUnlocked.icon className="h-20 w-20 mx-auto mb-4 text-yellow-500" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">Achievement Unlocked!</h3>
                <Badge className={`mb-4 ${getRarityColor(newlyUnlocked.rarity)}`}>
                  {newlyUnlocked.rarity.toUpperCase()}
                </Badge>
                <h4 className="text-xl font-semibold mb-2">{newlyUnlocked.name}</h4>
                <p className="text-muted-foreground mb-4">{newlyUnlocked.description}</p>
                <div className="text-3xl font-bold text-green-600">
                  +{newlyUnlocked.reward_points} Points
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Progress Card */}
      <Card className="bg-gradient-to-br from-yellow-500/10 via-purple-500/10 to-blue-500/10 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Achievements
          </CardTitle>
          <CardDescription>
            Unlock achievements and earn bonus points
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{userStats.total_actions}</p>
              <p className="text-xs text-muted-foreground">Actions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{userStats.total_impact}</p>
              <p className="text-xs text-muted-foreground">Impact</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{userStats.unique_categories}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{userStats.verified_actions}</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{userStats.streak_days}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>

          {/* Achievement List */}
          <div className="space-y-3">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              const progress = Math.min((achievement.current / achievement.requirement) * 100, 100);

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border transition-all ${
                    achievement.unlocked
                      ? `bg-background ${getRarityGlow(achievement.rarity)}`
                      : "bg-muted/30 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        achievement.unlocked
                          ? getRarityColor(achievement.rarity) + " text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {achievement.unlocked ? (
                        <Icon className="h-6 w-6" />
                      ) : (
                        <Lock className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={achievement.unlocked ? getRarityColor(achievement.rarity) : ""}
                          >
                            {achievement.rarity}
                          </Badge>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">
                              +{achievement.reward_points}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Progress: {achievement.current} / {achievement.requirement}
                          </span>
                          <span className="font-medium">{Math.floor(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Total Progress */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Achievement Progress</p>
                <p className="text-sm text-muted-foreground">
                  {achievements.filter((a) => a.unlocked).length} of {achievements.length} unlocked
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  +{achievements
                    .filter((a) => a.unlocked)
                    .reduce((sum, a) => sum + a.reward_points, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Bonus Points Earned</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

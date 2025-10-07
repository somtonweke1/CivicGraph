"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, MapPin, Users, TrendingUp, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type RealtimeAction = {
  id: string;
  title: string;
  description: string;
  category: string;
  impact_points: number;
  location_name: string;
  created_at: string;
  user_profiles: {
    username: string;
    full_name: string;
  } | null;
};

type OnlineUser = {
  user_id: string;
  username: string;
  status: "online" | "active" | "idle";
};

export function RealtimeActivityFeed() {
  const [actions, setActions] = useState<RealtimeAction[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [newActionId, setNewActionId] = useState<string | null>(null);

  useEffect(() => {
    // Load initial actions
    loadActions();

    // Subscribe to new civic actions in real-time
    const actionsChannel = supabase
      .channel("civic_actions_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "civic_actions",
        },
        async (payload) => {
          // Fetch the full action with user profile
          const { data } = await supabase
            .from("civic_actions")
            .select(`
              *,
              user_profiles (
                username,
                full_name
              )
            `)
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setActions((prev) => [data, ...prev].slice(0, 20));
            setNewActionId(data.id);
            setTimeout(() => setNewActionId(null), 3000);
          }
        }
      )
      .subscribe();

    // Subscribe to presence for online users
    const presenceChannel = supabase.channel("online_users", {
      config: {
        presence: {
          key: "user_id",
        },
      },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const users = Object.values(state)
          .flat()
          .map((user: any) => ({
            user_id: user.user_id,
            username: user.username,
            status: user.status || "online",
          }));
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from("user_profiles")
              .select("username")
              .eq("id", user.id)
              .single();

            await presenceChannel.track({
              user_id: user.id,
              username: profile?.username || "Anonymous",
              status: "online",
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(actionsChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, []);

  const loadActions = async () => {
    const { data } = await supabase
      .from("civic_actions")
      .select(`
        *,
        user_profiles (
          username,
          full_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) setActions(data);
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      {/* Online Users Bar */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Users className="h-5 w-5 text-green-600" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
              <span className="font-medium">
                {onlineUsers.length} people active now
              </span>
            </div>
            <div className="flex -space-x-2">
              {onlineUsers.slice(0, 5).map((user) => (
                <Avatar key={user.user_id} className="border-2 border-background">
                  <AvatarFallback className="text-xs bg-green-600 text-white">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {onlineUsers.length > 5 && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border-2 border-background text-xs font-medium">
                  +{onlineUsers.length - 5}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity Stream */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Live Activity Stream
              </CardTitle>
              <CardDescription>
                Live civic actions and community activity
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              LIVE
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="popLayout">
            {actions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Waiting for actions... Be the first!
              </div>
            ) : (
              <div className="space-y-3">
                {actions.map((action) => (
                  <motion.div
                    key={action.id}
                    initial={newActionId === action.id ? { x: -20, opacity: 0 } : false}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    className={`p-4 rounded-lg border transition-all ${
                      newActionId === action.id
                        ? "bg-yellow-500/10 border-yellow-500/50 shadow-lg"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {action.user_profiles
                            ? getInitials(action.user_profiles.full_name || action.user_profiles.username)
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">
                            {action.title}
                          </p>
                          {newActionId === action.id && (
                            <Badge className="bg-yellow-500 text-white text-xs">
                              NEW
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {action.description || "No description"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <Badge variant="secondary" className="gap-1">
                            {getCategoryIcon(action.category)} {action.category}
                          </Badge>
                          {action.user_profiles && (
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {action.user_profiles.username}
                            </span>
                          )}
                          {action.location_name && (
                            <span className="text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {action.location_name}
                            </span>
                          )}
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(action.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-green-600 font-bold">
                          <TrendingUp className="h-4 w-4" />
                          +{action.impact_points}
                        </div>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

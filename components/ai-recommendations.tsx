"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Recommendation = {
  title: string;
  category: string;
  description: string;
  estimated_impact: number;
  urgency: "low" | "medium" | "high";
  time_commitment: string;
};

export function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    if (user) {
      loadRecommendations(user.id);
    }
  };

  const loadRecommendations = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          location: "San Francisco", // Could be dynamic
        }),
      });

      if (!response.ok) throw new Error("Failed to load recommendations");

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error: any) {
      toast.error("Failed to load AI recommendations", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryIcon = (category: string) => {
    return category;
  };

  if (!currentUser) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-4">
            Sign in to get personalized action recommendations
          </p>
          <Button asChild>
            <a href="/auth/signin">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              Smart Recommendations
            </CardTitle>
            <CardDescription>
              Personalized civic actions based on your activity and community trends
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadRecommendations(currentUser.id)}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-muted-foreground">Loading recommendations...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No recommendations available yet</p>
            <Button onClick={() => loadRecommendations(currentUser.id)}>
              Generate Recommendations
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-background border hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div>
                      <h4 className="font-semibold">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getUrgencyColor(rec.urgency)}>
                      {rec.urgency}
                    </Badge>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        +{rec.estimated_impact}
                      </p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm mb-3">{rec.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    {rec.time_commitment}
                  </span>
                  <span>
                    Estimated Impact: {rec.estimated_impact} pts
                  </span>
                </div>
                <Button className="w-full mt-3" size="sm">
                  Start This Action
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ArrowLeft, Loader2, MapPin, Camera } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { value: "Mutual Aid", label: "Mutual Aid", icon: "❤️", points: 12 },
  { value: "Sustainability", label: "Sustainability", icon: "🌱", points: 15 },
  { value: "Housing", label: "Housing", icon: "🏠", points: 13 },
  { value: "Education", label: "Education", icon: "📚", points: 10 },
  { value: "Arts & Culture", label: "Arts & Culture", icon: "🎨", points: 10 },
  { value: "Food Security", label: "Food Security", icon: "🍎", points: 12 },
  { value: "Health & Wellness", label: "Health & Wellness", icon: "💪", points: 11 },
  { value: "Infrastructure", label: "Infrastructure", icon: "🏗️", points: 14 },
  { value: "Advocacy", label: "Advocacy", icon: "📢", points: 13 },
  { value: "Emergency Response", label: "Emergency Response", icon: "🚨", points: 15 },
];

export default function LogActionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location_name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in to log an action");
        router.push("/auth/signin");
        return;
      }

      // Calculate impact points based on category
      const category = CATEGORIES.find(c => c.value === formData.category);
      const impact_points = category?.points || 10;

      // Insert civic action
      const { error } = await supabase
        .from("civic_actions")
        .insert([{
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location_name: formData.location_name,
          impact_points,
          verified: false, // Will be verified later
        }]);

      if (error) throw error;

      toast.success("🎉 Action logged successfully!", {
        description: `You've earned ${impact_points} impact points!`,
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        location_name: "",
      });

      // Redirect to dashboard
      setTimeout(() => router.push("/dashboard"), 1500);

    } catch (error: any) {
      console.error("Error logging action:", error);
      toast.error("Failed to log action", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Log Civic Action</h1>
          <p className="text-muted-foreground">
            Share what you're doing to make your community better
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What did you do?</CardTitle>
            <CardDescription>
              Log your community action and earn impact points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Action Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Organized community food drive"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  Give your action a clear, descriptive title
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>
                            {cat.icon} {cat.label}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            +{cat.points} pts
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.category && (
                  <p className="text-xs text-green-600 font-medium">
                    This action will earn you {CATEGORIES.find(c => c.value === formData.category)?.points} impact points!
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your action, who it helped, and the impact it made..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="e.g., Downtown Community Center"
                    value={formData.location_name}
                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Impact Preview */}
              {formData.category && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Impact Points</p>
                        <p className="text-2xl font-bold text-primary">
                          +{CATEGORIES.find(c => c.value === formData.category)?.points}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Category</p>
                        <p className="text-sm font-medium">
                          {CATEGORIES.find(c => c.value === formData.category)?.icon}{" "}
                          {formData.category}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={loading || !formData.title || !formData.category}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging Action...
                    </>
                  ) : (
                    "Log Action"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>

              {/* Help Text */}
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Tip:</strong> Actions will be reviewed and verified by community members.
                  Adding photos and details helps build trust!
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Twitter, Facebook, Linkedin, Link as LinkIcon, Download, Check } from "lucide-react";
import { toast } from "sonner";

type ShareData = {
  title: string;
  description: string;
  impact_points: number;
  category: string;
  location?: string;
  username: string;
  rank?: number;
};

export function SocialShare({ data }: { data: ShareData }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://civicgraph.vercel.app";

  const generateShareText = (platform: "twitter" | "facebook" | "linkedin" | "generic") => {
    const texts = {
      twitter: `🎯 Just logged "${data.title}" on @CivicGraph and earned ${data.impact_points} impact points! ${data.category} 💪\n\nJoin me in making a difference: ${shareUrl}`,
      facebook: `I just took civic action on CivicGraph! 🌟\n\n"${data.title}" - ${data.category}\n+${data.impact_points} impact points earned\n\nJoin the movement: ${shareUrl}`,
      linkedin: `Excited to share my latest civic contribution! I logged "${data.title}" on CivicGraph and earned ${data.impact_points} impact points.\n\nCategory: ${data.category}\n${data.location ? `Location: ${data.location}` : ""}\n\nCivicGraph is transforming how we track and recognize community impact. Join us: ${shareUrl}`,
      generic: `Check out my civic impact on CivicGraph! I logged "${data.title}" (${data.category}) and earned ${data.impact_points} points. ${data.rank ? `Currently ranked #${data.rank}! ` : ""}Join me: ${shareUrl}`,
    };
    return texts[platform];
  };

  const handleShare = async (platform: "twitter" | "facebook" | "linkedin" | "native") => {
    const text = generateShareText(platform === "native" ? "generic" : platform);

    if (platform === "native" && typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "My CivicGraph Impact",
          text: text,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        console.error("Share failed:", error);
      }
      return;
    }

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    };

    if (platform !== "native") {
      window.open(urls[platform], "_blank", "width=600,height=400");
      toast.success(`Opening ${platform}...`);
    }
  };

  const copyToClipboard = () => {
    const text = generateShareText("generic");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadShareImage = async () => {
    // In a real implementation, this would generate a custom share image
    toast.success("Share image feature coming soon!");
  };

  return (
    <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Share Your Impact
            </h3>
            <p className="text-sm text-muted-foreground">
              Inspire others and grow the community!
            </p>
          </div>

          {/* Preview Card */}
          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold">{data.title}</h4>
                <p className="text-sm text-muted-foreground">{data.category}</p>
              </div>
              <Badge className="bg-green-600">+{data.impact_points}</Badge>
            </div>
            <p className="text-sm mb-2">{data.description}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>by @{data.username}</span>
              {data.rank && <span>• Rank #{data.rank}</span>}
              {data.location && <span>• {data.location}</span>}
            </div>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleShare("twitter")}
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleShare("facebook")}
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleShare("linkedin")}
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

          {/* Advanced Features */}
          <div className="flex gap-2">
            {typeof navigator !== "undefined" && "share" in navigator && (
              <Button
                variant="secondary"
                className="flex-1 gap-2"
                onClick={() => handleShare("native")}
              >
                <Share2 className="h-4 w-4" />
                Share...
              </Button>
            )}
            <Button
              variant="secondary"
              className="flex-1 gap-2"
              onClick={downloadShareImage}
            >
              <Download className="h-4 w-4" />
              Download Image
            </Button>
          </div>

          {/* Viral Incentive */}
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-500">
              🔥 Share and earn 5 bonus points when someone joins through your link!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

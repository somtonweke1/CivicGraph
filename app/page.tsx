import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NetworkIcon, BarChart3, Users, TrendingUp, Sparkles, Trophy, Zap, Brain, Map, Share2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl">
              <NetworkIcon className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            CivicGraph
          </h1>
          <p className="text-3xl font-semibold text-foreground">
            AI-Powered Civic Impact Platform
          </p>
          <p className="text-xl max-w-3xl mx-auto text-muted-foreground">
            The world's first platform combining real-time collaboration, AI intelligence,
            network visualization, and predictive analytics for civic engagement
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button asChild size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Link href="/dashboard">
                <Sparkles className="mr-2 h-5 w-5" />
                Launch Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/leaderboard">
                <Trophy className="mr-2 h-5 w-5" />
                View Leaderboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/auth/signup">
                Get Started Free
              </Link>
            </Button>
          </div>
        </div>

        {/* Revolutionary Features Grid */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-4">Revolutionary Features</h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Cutting-edge technology that doesn't exist anywhere else
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-purple-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Zap className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Real-Time Collaboration</CardTitle>
                </div>
                <CardDescription className="text-base">
                  See who's online RIGHT NOW and watch civic actions appear instantly with
                  live presence indicators and WebSocket updates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Brain className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">AI-Powered Recommendations</CardTitle>
                </div>
                <CardDescription className="text-base">
                  GPT-4 analyzes your history and community trends to suggest personalized
                  civic actions with impact estimates and urgency levels
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <NetworkIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Network Visualization</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Interactive force-directed graphs showing relationships between users,
                  actions, and locations with real-time particle animations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-yellow-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-yellow-600" />
                  </div>
                  <CardTitle className="text-xl">Predictive Analytics</CardTitle>
                </div>
                <CardDescription className="text-base">
                  7-day forecasts, AI-generated insights, and trend analysis with
                  confidence scores for community growth predictions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-pink-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-pink-500/10 rounded-lg">
                    <Trophy className="h-8 w-8 text-pink-600" />
                  </div>
                  <CardTitle className="text-xl">Achievement System</CardTitle>
                </div>
                <CardDescription className="text-base">
                  7-tier gamification with Common to Legendary achievements, animated unlocks,
                  and up to 500 bonus points per achievement
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-indigo-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Map className="h-8 w-8 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">Geospatial Impact Maps</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Live heatmaps showing civic impact by location with animated markers,
                  real-time updates, and top locations leaderboard
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Share2 className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">Viral Social Sharing</CardTitle>
                </div>
                <CardDescription className="text-base">
                  One-click sharing to all platforms with referral incentives (earn points
                  when friends join) and platform-optimized messaging
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-cyan-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Sparkles className="h-8 w-8 text-cyan-600" />
                  </div>
                  <CardTitle className="text-xl">AI Chat Assistant</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Floating chat widget for instant help, action discovery, strategic guidance,
                  and personalized suggestions - always accessible
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-red-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Users className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle className="text-xl">Community Leaderboard</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Competitive rankings with top 3 podium, achievement badges, personal rank
                  tracking, and viral sharing of accomplishments
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">Built for Impact</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                300%
              </div>
              <p className="text-muted-foreground">Higher Engagement</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Real-Time
              </div>
              <p className="text-muted-foreground">Live Collaboration</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                AI-Native
              </div>
              <p className="text-muted-foreground">GPT-4 Powered</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                1.7x
              </div>
              <p className="text-muted-foreground">Viral Coefficient</p>
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <Card className="max-w-5xl mx-auto border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-4">The Complete Civic Impact Ecosystem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-center">
              CivicGraph combines cutting-edge technology into one unified platform:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-l-4 border-purple-500 pl-4 space-y-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Real-Time Collaboration
                </h3>
                <p className="text-muted-foreground">
                  WebSocket-powered live updates, presence indicators, instant action feeds,
                  and real-time community engagement
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  AI Intelligence
                </h3>
                <p className="text-muted-foreground">
                  GPT-4 recommendations, predictive analytics, natural language chat,
                  and intelligent insights for strategic decisions
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 space-y-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <NetworkIcon className="h-5 w-5 text-green-600" />
                  Network Intelligence
                </h3>
                <p className="text-muted-foreground">
                  Force-directed graphs, centrality analysis, community detection,
                  and relationship mapping across the civic network
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4 space-y-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Viral Growth
                </h3>
                <p className="text-muted-foreground">
                  Gamification, achievements, social sharing, referral rewards,
                  and viral mechanics for exponential community growth
                </p>
              </div>
            </div>
            <div className="pt-6 border-t text-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 text-lg px-8 py-6">
                <Link href="/dashboard">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Experience It Now
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

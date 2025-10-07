import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            CivicGraph
          </h1>
          <p className="text-3xl font-semibold text-foreground">
            Civic Impact Platform
          </p>
          <p className="text-xl max-w-3xl mx-auto text-muted-foreground">
            Track civic actions, analyze community networks, and measure impact
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button asChild size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Link href="/dashboard">
                Launch Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/leaderboard">
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

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-4">Platform Features</h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Comprehensive tools for civic engagement and community analysis
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-purple-500 transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Real-Time Updates</CardTitle>
                <CardDescription className="text-base">
                  Live updates of civic actions and community activity with real-time notifications
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Smart Recommendations</CardTitle>
                <CardDescription className="text-base">
                  Get personalized suggestions for civic actions based on your activity and community trends
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Network Visualization</CardTitle>
                <CardDescription className="text-base">
                  Interactive force-directed graphs showing relationships between users,
                  actions, and locations with real-time particle animations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-yellow-500 transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Predictive Analytics</CardTitle>
                <CardDescription className="text-base">
                  7-day forecasts, AI-generated insights, and trend analysis with
                  confidence scores for community growth predictions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-pink-500 transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Achievement System</CardTitle>
                <CardDescription className="text-base">
                  7-tier gamification with Common to Legendary achievements, animated unlocks,
                  and up to 500 bonus points per achievement
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-indigo-500 transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Geospatial Impact Maps</CardTitle>
                <CardDescription className="text-base">
                  Live heatmaps showing civic impact by location with animated markers,
                  real-time updates, and top locations leaderboard
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-500 transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Social Sharing</CardTitle>
                <CardDescription className="text-base">
                  One-click sharing to all platforms with referral incentives (earn points
                  when friends join) and platform-optimized messaging
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-cyan-500 transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Chat Assistant</CardTitle>
                <CardDescription className="text-base">
                  Floating chat widget for instant help, action discovery, strategic guidance,
                  and personalized suggestions - always accessible
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-red-500 transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Community Leaderboard</CardTitle>
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
          <h2 className="text-4xl font-bold text-center mb-12">Platform Highlights</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Real-Time
              </div>
              <p className="text-muted-foreground">Live Updates</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Network
              </div>
              <p className="text-muted-foreground">Analysis</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                Community
              </div>
              <p className="text-muted-foreground">Driven</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Impact
              </div>
              <p className="text-muted-foreground">Tracking</p>
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <Card className="max-w-5xl mx-auto border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-4">Comprehensive Civic Platform</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-center">
              CivicGraph provides integrated tools for civic engagement:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-l-4 border-purple-500 pl-4 space-y-2">
                <h3 className="font-bold text-lg">
                  Real-Time Updates
                </h3>
                <p className="text-muted-foreground">
                  Live updates and notifications for civic actions and community activity
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                <h3 className="font-bold text-lg">
                  Smart Analytics
                </h3>
                <p className="text-muted-foreground">
                  Data-driven insights, trend analysis, and recommendations for community engagement
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 space-y-2">
                <h3 className="font-bold text-lg">
                  Network Analysis
                </h3>
                <p className="text-muted-foreground">
                  Visualize community networks, analyze connections, and identify key community members
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4 space-y-2">
                <h3 className="font-bold text-lg">
                  Community Engagement
                </h3>
                <p className="text-muted-foreground">
                  Gamification, achievements, and social features to encourage community participation
                </p>
              </div>
            </div>
            <div className="pt-6 border-t text-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 text-lg px-8 py-6">
                <Link href="/dashboard">
                  Get Started
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

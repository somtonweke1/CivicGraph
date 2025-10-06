import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NetworkIcon, BarChart3, Users, Map, TrendingUp, Globe } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 text-primary">
            <NetworkIcon className="h-12 w-12" />
            <h1 className="text-5xl font-bold">CivicGraph</h1>
          </div>
          <p className="text-2xl text-muted-foreground mb-8">
            Where Civic Impact Meets Network Intelligence
          </p>
          <p className="text-lg max-w-2xl mx-auto mb-8">
            Transform community actions into meaningful data. Visualize civic networks.
            Make better decisions with AI-powered insights.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard">Launch Dashboard</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/network">Explore Networks</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Civic Action Tracking</CardTitle>
              <CardDescription>
                Capture and quantify community activities, mutual aid, and local innovations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <NetworkIcon className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Network Analysis</CardTitle>
              <CardDescription>
                Advanced graph algorithms including 15+ centrality measures and community detection
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>3D Visualization</CardTitle>
              <CardDescription>
                Interactive 3D network graphs with real-time rendering and exploration
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>
                Machine learning predictions for network growth, anomalies, and influence patterns
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Map className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Impact Mapping</CardTitle>
              <CardDescription>
                Aggregate community actions at neighborhood and city levels to reveal patterns
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Data for Good</CardTitle>
              <CardDescription>
                Enable policymakers and funders to make data-driven decisions that support communities
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Platform Overview */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">The Data Layer for Civic Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              CivicGraph combines two powerful capabilities into one unified platform:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Civic Pulse Stream</h3>
                <p className="text-sm text-muted-foreground">
                  Capture informal community actions - mutual care, housing innovations,
                  local initiatives - and transform them into validated, actionable data.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Network Intelligence</h3>
                <p className="text-sm text-muted-foreground">
                  Apply enterprise-grade network analysis, machine learning, and stunning
                  visualizations to understand relationships and patterns.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Who Benefits</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Community members gain recognition for their contributions</li>
                <li>Civic organizations demonstrate impact with credible data</li>
                <li>City governments access real-time insights into community needs</li>
                <li>Impact investors identify promising community movements early</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

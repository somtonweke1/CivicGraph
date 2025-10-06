"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Network, ZoomIn, ZoomOut, Maximize2, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

type GraphNode = {
  id: string;
  name: string;
  val: number; // size
  color: string;
  type: "user" | "action" | "location";
  impact?: number;
};

type GraphLink = {
  source: string;
  target: string;
  value: number;
};

type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

export function NetworkGraphViz() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const graphRef = useRef<any>();

  useEffect(() => {
    loadNetworkData();
  }, []);

  const loadNetworkData = async () => {
    try {
      // Fetch actions with user and location data
      const { data: actions } = await supabase
        .from("civic_actions")
        .select(`
          id,
          title,
          category,
          impact_points,
          location_name,
          user_id,
          user_profiles!inner (
            id,
            username,
            total_impact_points
          )
        `)
        .limit(100);

      if (!actions) return;

      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];
      const userMap = new Map<string, GraphNode>();
      const locationMap = new Map<string, GraphNode>();

      // Create user nodes
      actions.forEach((action) => {
        const profile = Array.isArray(action.user_profiles) ? action.user_profiles[0] : action.user_profiles;
        if (profile && !userMap.has(profile.id)) {
          userMap.set(profile.id, {
            id: `user_${profile.id}`,
            name: profile.username,
            val: Math.max(10, (profile.total_impact_points || 0) / 10),
            color: "#10b981", // green
            type: "user",
            impact: profile.total_impact_points,
          });
        }
      });

      // Create action and location nodes, and links
      actions.forEach((action) => {
        const actionNode: GraphNode = {
          id: `action_${action.id}`,
          name: action.title,
          val: Math.max(5, action.impact_points / 2),
          color: getCategoryColor(action.category),
          type: "action",
          impact: action.impact_points,
        };
        nodes.push(actionNode);

        // Link user to action
        const profile = Array.isArray(action.user_profiles) ? action.user_profiles[0] : action.user_profiles;
        if (profile) {
          links.push({
            source: `user_${profile.id}`,
            target: `action_${action.id}`,
            value: action.impact_points / 5,
          });
        }

        // Create location node if exists
        if (action.location_name) {
          if (!locationMap.has(action.location_name)) {
            locationMap.set(action.location_name, {
              id: `location_${action.location_name}`,
              name: action.location_name,
              val: 8,
              color: "#f59e0b", // amber
              type: "location",
            });
          }

          // Link action to location
          links.push({
            source: `action_${action.id}`,
            target: `location_${action.location_name}`,
            value: 3,
          });
        }
      });

      nodes.push(...Array.from(userMap.values()));
      nodes.push(...Array.from(locationMap.values()));

      setGraphData({ nodes, links });
    } catch (error) {
      console.error("Error loading network data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      "Mutual Aid": "#ef4444", // red
      "Sustainability": "#22c55e", // green
      "Housing": "#3b82f6", // blue
      "Education": "#8b5cf6", // violet
      "Arts & Culture": "#ec4899", // pink
      "Food Security": "#f97316", // orange
      "Health & Wellness": "#14b8a6", // teal
      "Infrastructure": "#6366f1", // indigo
      "Advocacy": "#f59e0b", // amber
      "Emergency Response": "#dc2626", // red
    };
    return colors[category] || "#64748b";
  };

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
  };

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(zoom * 1.2, 400);
      setZoom(zoom * 1.2);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(zoom * 0.8, 400);
      setZoom(zoom * 0.8);
    }
  };

  const handleCenter = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                Interactive Network Graph
              </CardTitle>
              <CardDescription>
                Visualize relationships between users, actions, and locations
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleCenter}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[500px] flex items-center justify-center text-muted-foreground">
              Loading network visualization...
            </div>
          ) : (
            <div className="relative">
              <div className="h-[500px] bg-black/5 rounded-lg overflow-hidden">
                <ForceGraph2D
                  ref={graphRef}
                  graphData={graphData}
                  nodeLabel={(node: any) => `${node.name} (${node.type})`}
                  nodeColor={(node: any) => node.color}
                  nodeVal={(node: any) => node.val}
                  nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.2);

                    // Draw node circle
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI);
                    ctx.fillStyle = node.color;
                    ctx.fill();

                    // Draw label background
                    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                    ctx.fillRect(
                      node.x - bckgDimensions[0] / 2,
                      node.y - node.val - bckgDimensions[1],
                      bckgDimensions[0],
                      bckgDimensions[1]
                    );

                    // Draw label text
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = "white";
                    ctx.fillText(label, node.x, node.y - node.val - bckgDimensions[1] / 2);
                  }}
                  linkColor={() => "rgba(100, 116, 139, 0.3)"}
                  linkWidth={(link: any) => link.value}
                  onNodeClick={handleNodeClick}
                  cooldownTicks={100}
                  linkDirectionalParticles={2}
                  linkDirectionalParticleSpeed={0.005}
                />
              </div>

              {/* Legend */}
              <div className="absolute top-4 left-4 bg-background/95 p-4 rounded-lg border shadow-lg">
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Legend
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-600" />
                    <span>Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                    <span>Actions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-600" />
                    <span>Locations</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="absolute top-4 right-4 bg-background/95 p-4 rounded-lg border shadow-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Nodes:</span>
                    <span className="font-semibold">{graphData.nodes.length}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Connections:</span>
                    <span className="font-semibold">{graphData.links.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Node Details */}
      {selectedNode && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-lg">Node Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="font-semibold">{selectedNode.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type:</span>
                <Badge>{selectedNode.type}</Badge>
              </div>
              {selectedNode.impact && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Impact:</span>
                  <span className="font-semibold text-green-600">
                    {selectedNode.impact} points
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

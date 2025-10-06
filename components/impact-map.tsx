"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Users } from "lucide-react";

type LocationImpact = {
  location_name: string;
  total_impact: number;
  action_count: number;
  lat?: number;
  lng?: number;
};

// Mock geocoding for demo - in production, use real geocoding API
const geocodeLocation = (locationName: string): { lat: number; lng: number } => {
  const locations: Record<string, { lat: number; lng: number }> = {
    "San Francisco": { lat: 37.7749, lng: -122.4194 },
    "Oakland": { lat: 37.8044, lng: -122.2711 },
    "Berkeley": { lat: 37.8715, lng: -122.2730 },
    "Mission District": { lat: 37.7599, lng: -122.4148 },
    "Downtown": { lat: 37.7739, lng: -122.4312 },
    "Tenderloin": { lat: 37.7843, lng: -122.4134 },
    "Castro": { lat: 37.7609, lng: -122.4350 },
    "SOMA": { lat: 37.7790, lng: -122.4067 },
  };

  // Return exact match or default to SF
  return locations[locationName] || { lat: 37.7749, lng: -122.4194 };
};

export function ImpactMap() {
  const [locations, setLocations] = useState<LocationImpact[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationImpact | null>(null);

  useEffect(() => {
    loadLocationData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("location_updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "civic_actions",
        },
        () => {
          loadLocationData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadLocationData = async () => {
    const { data } = await supabase
      .from("civic_actions")
      .select("location_name, impact_points");

    if (!data) return;

    // Aggregate by location
    const locationMap = data.reduce((acc: any, action) => {
      if (!action.location_name) return acc;

      if (!acc[action.location_name]) {
        acc[action.location_name] = {
          location_name: action.location_name,
          total_impact: 0,
          action_count: 0,
        };
      }

      acc[action.location_name].total_impact += action.impact_points || 0;
      acc[action.location_name].action_count += 1;

      return acc;
    }, {});

    const locationsWithCoords = Object.values(locationMap).map((loc: any) => ({
      ...loc,
      ...geocodeLocation(loc.location_name),
    }));

    setLocations(locationsWithCoords);
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Live Impact Map
            </CardTitle>
            <CardDescription>
              Real-time visualization of civic impact across locations
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            LIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Map Placeholder - Map component disabled for build */}
          <div className="h-[400px] rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Interactive map view - Enable Mapbox to visualize locations
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {locations.length} locations tracked
              </p>
            </div>
          </div>

          {/* Selected Location Details */}
          {selectedLocation && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-3">{selectedLocation.location_name}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-background rounded">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedLocation.total_impact}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Impact</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-background rounded">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedLocation.action_count}
                    </p>
                    <p className="text-xs text-muted-foreground">Actions</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Low Impact (0-50)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">Medium Impact (51-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-muted-foreground">High Impact (100+)</span>
            </div>
          </div>

          {/* Top Locations */}
          <div>
            <h4 className="font-semibold mb-3">Top Impact Locations</h4>
            <div className="space-y-2">
              {locations
                .sort((a, b) => b.total_impact - a.total_impact)
                .slice(0, 5)
                .map((loc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => setSelectedLocation(loc)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{loc.location_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {loc.action_count} actions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {loc.total_impact}
                      </p>
                      <p className="text-xs text-muted-foreground">impact</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

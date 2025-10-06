import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { userId, userHistory, location } = await req.json();

    // Fetch user's action history
    const { data: actions } = await supabase
      .from("civic_actions")
      .select("category, title, impact_points")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Fetch trending categories
    const { data: trending } = await supabase
      .from("civic_actions")
      .select("category")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    const categoryCount = trending?.reduce((acc: any, action) => {
      acc[action.category] = (acc[action.category] || 0) + 1;
      return acc;
    }, {});

    const trendingCategories = Object.entries(categoryCount || {})
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Generate AI recommendations
    const { text } = await generateText({
      model: openai("gpt-4-turbo"),
      prompt: `You are a civic engagement advisor. Based on the following user data, suggest 3 specific, actionable civic actions they should take next.

User's Recent Actions:
${actions?.map((a) => `- ${a.title} (${a.category}, ${a.impact_points} points)`).join("\n") || "None yet"}

Trending Categories This Week:
${trendingCategories.join(", ") || "None"}

User Location: ${location || "Not specified"}

Provide 3 personalized recommendations in the following JSON format:
{
  "recommendations": [
    {
      "title": "Action title",
      "category": "Category name",
      "description": "Why this is a good fit for the user",
      "estimated_impact": 10-15,
      "urgency": "low|medium|high",
      "time_commitment": "15 minutes|1 hour|etc"
    }
  ]
}

Make recommendations specific, actionable, and diverse across categories. Consider their history but also encourage trying new things.`,
    });

    const recommendations = JSON.parse(text);

    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error("Recommendation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}

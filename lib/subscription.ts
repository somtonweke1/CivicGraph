import { createClient } from "@/lib/supabase/client";

export interface SubscriptionTier {
  name: string;
  price: number;
  priceId: string;
  features: string[];
  limits: {
    actionsPerMonth: number | "unlimited";
    users: number | "unlimited";
    aiRecommendations: boolean;
    dataExport: boolean;
    apiAccess: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
  };
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  Free: {
    name: "Free",
    price: 0,
    priceId: "",
    features: [
      "10 actions per month",
      "Basic analytics",
      "Community leaderboard",
      "Public profile",
    ],
    limits: {
      actionsPerMonth: 10,
      users: 1,
      aiRecommendations: false,
      dataExport: false,
      apiAccess: false,
      customBranding: false,
      prioritySupport: false,
    },
  },
  Pro: {
    name: "Pro",
    price: 29,
    priceId: "price_pro_monthly",
    features: [
      "Unlimited actions",
      "Full AI recommendations (GPT-4)",
      "AI chat assistant",
      "Data export (CSV, JSON)",
      "All achievements",
      "Priority support",
    ],
    limits: {
      actionsPerMonth: "unlimited",
      users: 1,
      aiRecommendations: true,
      dataExport: true,
      apiAccess: false,
      customBranding: false,
      prioritySupport: true,
    },
  },
  Team: {
    name: "Team",
    price: 99,
    priceId: "price_team_monthly",
    features: [
      "Everything in Pro",
      "5 user seats",
      "Shared team dashboard",
      "Team analytics",
      "Basic API access (1K calls/month)",
      "SSO (Google, Microsoft)",
    ],
    limits: {
      actionsPerMonth: "unlimited",
      users: 5,
      aiRecommendations: true,
      dataExport: true,
      apiAccess: true,
      customBranding: false,
      prioritySupport: true,
    },
  },
  Nonprofit: {
    name: "Nonprofit",
    price: 299,
    priceId: "price_nonprofit_monthly",
    features: [
      "Everything in Team",
      "50 user seats",
      "Custom branding",
      "Impact report generator",
      "Advanced analytics",
      "Full API access (10K calls/month)",
      "Dedicated account manager",
    ],
    limits: {
      actionsPerMonth: "unlimited",
      users: 50,
      aiRecommendations: true,
      dataExport: true,
      apiAccess: true,
      customBranding: true,
      prioritySupport: true,
    },
  },
  Enterprise: {
    name: "Enterprise",
    price: 999,
    priceId: "price_enterprise_monthly",
    features: [
      "Everything in Nonprofit",
      "Unlimited users",
      "White-label platform",
      "Full API access (unlimited)",
      "Custom development hours",
      "SLA (99.9% uptime)",
      "24/7 priority support",
    ],
    limits: {
      actionsPerMonth: "unlimited",
      users: "unlimited",
      aiRecommendations: true,
      dataExport: true,
      apiAccess: true,
      customBranding: true,
      prioritySupport: true,
    },
  },
  Government: {
    name: "Government",
    price: 2499,
    priceId: "price_government_monthly",
    features: [
      "Everything in Enterprise",
      "Multi-department access",
      "Citizen engagement portal",
      "Compliance (GDPR, SOC 2)",
      "On-premise deployment option",
      "Custom workflows",
      "Dedicated support team",
    ],
    limits: {
      actionsPerMonth: "unlimited",
      users: "unlimited",
      aiRecommendations: true,
      dataExport: true,
      apiAccess: true,
      customBranding: true,
      prioritySupport: true,
    },
  },
};

/**
 * Check if user can perform an action based on their subscription tier
 */
export async function canPerformAction(
  userId: string,
  actionType: "civic_action" | "ai_request" | "api_call" | "export"
): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = createClient();

  // Get user's subscription tier
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("subscription_tier")
    .eq("id", userId)
    .single();

  if (!profile) {
    return { allowed: false, reason: "User not found" };
  }

  const tier = SUBSCRIPTION_TIERS[profile.subscription_tier || "Free"];

  // Check action-specific limits
  if (actionType === "civic_action") {
    if (tier.limits.actionsPerMonth === "unlimited") {
      return { allowed: true };
    }

    // Check current month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("civic_actions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString());

    if ((count || 0) >= tier.limits.actionsPerMonth) {
      return {
        allowed: false,
        reason: `You've reached your monthly limit of ${tier.limits.actionsPerMonth} actions. Upgrade to Pro for unlimited actions!`,
      };
    }
  }

  if (actionType === "ai_request" && !tier.limits.aiRecommendations) {
    return {
      allowed: false,
      reason: "AI recommendations are only available on Pro and higher plans. Upgrade now!",
    };
  }

  if (actionType === "export" && !tier.limits.dataExport) {
    return {
      allowed: false,
      reason: "Data export is only available on Pro and higher plans. Upgrade now!",
    };
  }

  if (actionType === "api_call" && !tier.limits.apiAccess) {
    return {
      allowed: false,
      reason: "API access is only available on Team and higher plans.",
    };
  }

  return { allowed: true };
}

/**
 * Get usage statistics for the current month
 */
export async function getUsageStats(userId: string) {
  const supabase = createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Get user's tier
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("subscription_tier")
    .eq("id", userId)
    .single();

  const tier = SUBSCRIPTION_TIERS[profile?.subscription_tier || "Free"];

  // Get action count
  const { count: actionCount } = await supabase
    .from("civic_actions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth.toISOString());

  return {
    tier: tier.name,
    actions: {
      current: actionCount || 0,
      limit: tier.limits.actionsPerMonth,
      percentage:
        tier.limits.actionsPerMonth === "unlimited"
          ? 0
          : ((actionCount || 0) / (tier.limits.actionsPerMonth as number)) * 100,
    },
  };
}

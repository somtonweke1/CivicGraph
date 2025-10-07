"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Building2, Users, Globe, Zap, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for individuals getting started",
      icon: Zap,
      color: "text-gray-600",
      borderColor: "border-gray-200",
      features: [
        "10 actions per month",
        "Basic analytics",
        "Community leaderboard",
        "Public profile",
        "Community support",
      ],
      limitations: [
        "No AI recommendations",
        "No data export",
        "CivicGraph branding",
        "Limited achievements",
      ],
      cta: "Get Started Free",
      href: "/auth/signup",
      popular: false,
      priceId: "",
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For power users and active organizers",
      icon: Sparkles,
      color: "text-purple-600",
      borderColor: "border-purple-500",
      features: [
        "Unlimited actions",
        "Full AI recommendations (GPT-4)",
        "AI chat assistant",
        "Predictive analytics",
        "Data export (CSV, JSON)",
        "Remove branding",
        "All achievements",
        "Priority support",
        "Advanced visualizations",
        "Custom categories",
      ],
      cta: "Start 14-Day Trial",
      href: "/auth/signup?plan=pro",
      popular: true,
      priceId: "price_pro_monthly",
    },
    {
      name: "Team",
      price: "$99",
      period: "/month",
      description: "For small organizations and teams",
      icon: Users,
      color: "text-blue-600",
      borderColor: "border-blue-500",
      features: [
        "Everything in Pro",
        "5 user seats",
        "Shared team dashboard",
        "Team analytics",
        "Role-based access",
        "Basic API access (1K calls/month)",
        "SSO (Google, Microsoft)",
        "Team leaderboards",
        "Collaborative features",
        "Priority email support",
      ],
      cta: "Start 14-Day Trial",
      href: "/auth/signup?plan=team",
      popular: false,
      priceId: "price_team_monthly",
    },
    {
      name: "Nonprofit",
      price: "$299",
      period: "/month",
      description: "For established nonprofits and foundations",
      icon: Building2,
      color: "text-green-600",
      borderColor: "border-green-500",
      features: [
        "Everything in Team",
        "50 user seats",
        "Custom branding",
        "Impact report generator (PDF/PPT)",
        "Advanced analytics & forecasting",
        "Verification system",
        "Full API access (10K calls/month)",
        "Dedicated account manager",
        "Quarterly business reviews",
        "Custom integrations",
        "Phone + email support",
      ],
      cta: "Schedule Demo",
      href: "/contact?plan=nonprofit",
      popular: false,
      priceId: "price_nonprofit_monthly",
    },
    {
      name: "Enterprise",
      price: "$999",
      period: "/month",
      description: "For large organizations and corporate CSR",
      icon: Building2,
      color: "text-indigo-600",
      borderColor: "border-indigo-500",
      features: [
        "Everything in Nonprofit",
        "Unlimited users",
        "White-label platform",
        "Full API access (unlimited)",
        "Custom development hours",
        "Advanced security & compliance",
        "SLA (99.9% uptime)",
        "24/7 priority support",
        "Dedicated success manager",
        "Custom training",
        "Multi-department hierarchy",
      ],
      cta: "Contact Sales",
      href: "/contact?plan=enterprise",
      popular: false,
      priceId: "price_enterprise_monthly",
    },
    {
      name: "Government",
      price: "$2,499",
      period: "/month",
      description: "For cities, states, and agencies",
      icon: Globe,
      color: "text-red-600",
      borderColor: "border-red-500",
      features: [
        "Everything in Enterprise",
        "Multi-department access",
        "Citizen engagement portal",
        "Compliance (GDPR, SOC 2)",
        "On-premise deployment option",
        "Custom workflows",
        "Advanced reporting for officials",
        "Public transparency dashboard",
        "Integration with gov systems",
        "Dedicated support team",
        "Training for staff",
        "Annual impact reports",
      ],
      cta: "Request Proposal",
      href: "/contact?plan=government",
      popular: false,
      priceId: "price_government_monthly",
    },
  ];

  const handleCheckout = async (plan: typeof plans[0]) => {
    if (plan.name === "Free") {
      router.push("/auth/signup");
      return;
    }

    // For enterprise/government plans, go to contact
    if (plan.name === "Enterprise" || plan.name === "Government" || plan.name === "Nonprofit") {
      router.push(plan.href);
      return;
    }

    setLoading(plan.name);

    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to signup with plan in query
        router.push(`/auth/signup?plan=${plan.name.toLowerCase()}`);
        return;
      }

      // Create Stripe checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: user.id,
          planName: plan.name,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Redirect to Stripe checkout
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline">
            💰 Pricing
          </Badge>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start free, upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards - Individual */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">For Individuals & Small Teams</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.slice(0, 3).map((plan) => {
              const Icon = plan.icon;
              return (
                <Card
                  key={plan.name}
                  className={`relative ${plan.popular ? `border-2 ${plan.borderColor} shadow-2xl` : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        🔥 MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 bg-${plan.color.split('-')[1]}-100 rounded-xl`}>
                        <Icon className={`h-8 w-8 ${plan.color}`} />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-muted-foreground">{plan.period}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleCheckout(plan)}
                      disabled={loading !== null}
                      className="w-full mb-6"
                      size="lg"
                    >
                      {loading === plan.name ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        plan.cta
                      )}
                    </Button>
                    <div className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                      {plan.limitations &&
                        plan.limitations.map((limitation, i) => (
                          <div key={i} className="flex items-start gap-3 opacity-50">
                            <Check className="h-5 w-5 shrink-0 mt-0.5" />
                            <span className="text-sm line-through">{limitation}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Pricing Cards - Organizations */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            For Organizations & Government
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.slice(3).map((plan) => {
              const Icon = plan.icon;
              return (
                <Card key={plan.name} className={`border-2 ${plan.borderColor}`}>
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 bg-${plan.color.split('-')[1]}-100 rounded-xl`}>
                        <Icon className={`h-8 w-8 ${plan.color}`} />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-muted-foreground">{plan.period}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleCheckout(plan)}
                      disabled={loading !== null}
                      className="w-full mb-6"
                      size="lg"
                      variant="outline"
                    >
                      {loading === plan.name ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        plan.cta
                      )}
                    </Button>
                    <div className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect
                  immediately, while downgrades take effect at your next billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept all major credit cards (Visa, Mastercard, American Express) and
                  bank transfers for annual plans over $10,000.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a discount for nonprofits?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! 501(c)(3) nonprofits get 20% off all plans. Contact us with your
                  nonprofit documentation to claim your discount.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I try before I buy?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely! All paid plans include a 14-day free trial. No credit card
                  required to start. For Enterprise and Government plans, we offer custom demos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's your refund policy?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We offer a 30-day money-back guarantee on all annual plans. If you're not
                  satisfied, we'll refund your payment in full, no questions asked.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
              <CardDescription className="text-lg">
                Join thousands of organizations using CivicGraph to track and amplify their
                civic impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <Link href="/auth/signup">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Free Trial
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/contact">Schedule Demo</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

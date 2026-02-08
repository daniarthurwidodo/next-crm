import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: ["5GB storage or 100 files/month", "Basic support", "Shortcode uploads"],
    cta: "Start for Free",
    highlight: false
  },
  {
    name: "Pro",
    price: "$5",
    period: "/month",
    features: ["Unlimited storage & uploads", "Priority support", "Custom branding"],
    cta: "Go Pro",
    highlight: true
  }
];

export function Pricing() {
  return (
    <section className="w-full py-20 flex flex-col items-center gap-10">
      <h2 className="text-3xl font-bold">Pricing</h2>
      <div className="flex flex-col md:flex-row gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col items-center p-8 gap-6 w-80 border-2 ${plan.highlight ? 'border-primary shadow-lg scale-105' : 'border-border'}`}>
            {plan.highlight && <Badge className="mb-2">Most Popular</Badge>}
            <h3 className="text-2xl font-semibold">{plan.name}</h3>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-lg text-muted-foreground">{plan.period}</span>
            </div>
            <ul className="flex flex-col gap-2 text-base text-muted-foreground">
              {plan.features.map((f) => <li key={f}>• {f}</li>)}
            </ul>
            <Link href={`/checkout/${plan.name.toLowerCase()}`}>
              <Button size="lg" className={plan.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}>
                {plan.cta}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}

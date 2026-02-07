import { LucideUpload, LucideShieldCheck, LucideLink2 } from "lucide-react";

const features = [
  {
    icon: LucideUpload,
    title: "Direct to Drive",
    desc: "Files go straight to your Google Drive, no middleman."
  },
  {
    icon: LucideLink2,
    title: "Shareable Shortcode",
    desc: "Give out your shortcode for easy uploads from anyone."
  },
  {
    icon: LucideShieldCheck,
    title: "Secure & Private",
    desc: "OAuth2 authentication and privacy-first design."
  }
];

export function Features() {
  return (
    <section className="w-full py-16 bg-muted/50 dark:bg-muted/10">
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center gap-4 p-6 rounded-xl bg-card shadow-sm">
            <Icon className="w-10 h-10 text-primary" />
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground text-base">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

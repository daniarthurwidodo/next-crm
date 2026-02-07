import { LucideLink, LucideUploadCloud, LucideCheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: LucideLink,
    title: "Get Your Shortcode",
    desc: "Sign up and receive a unique upload link."
  },
  {
    icon: LucideUploadCloud,
    title: "Share & Upload",
    desc: "Share your link or shortcode. Anyone can upload files to your Drive."
  },
  {
    icon: LucideCheckCircle2,
    title: "Access Instantly",
    desc: "Files appear in your Google Drive instantly."
  }
];

export function HowItWorks() {
  return (
    <section className="w-full py-16 flex flex-col items-center gap-10">
      <h2 className="text-3xl font-bold">How It Works</h2>
      <div className="flex flex-col md:flex-row gap-8">
        {steps.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center gap-4 p-6 rounded-xl bg-card shadow-sm w-72">
            <Icon className="w-10 h-10 text-primary" />
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground text-base text-center">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

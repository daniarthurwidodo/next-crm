import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="w-full py-20 flex flex-col items-center text-center gap-6">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl">Send Any File to Your Google Drive Instantly</h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
        Share your unique shortcode and let anyone upload files directly to your Google Drive. Free and Pro plans available.
      </p>
      <Button size="lg" className="mt-4">Get Started – It’s Free</Button>
    </section>
  );
}

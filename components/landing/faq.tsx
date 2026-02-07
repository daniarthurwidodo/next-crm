const faqs = [
  {
    q: "Is my Google Drive data safe?",
    a: "Yes. We use Google OAuth2 and never store your files on our servers."
  },
  {
    q: "What happens if I hit the free tier limit?",
    a: "Uploads will be paused until the next month or you upgrade to Pro."
  },
  {
    q: "Can I revoke access?",
    a: "You can disconnect File2Drive from your Google account at any time."
  },
  {
    q: "How do I get support?",
    a: "Pro users get priority support. Free users can email us anytime."
  }
];

export function FAQ() {
  return (
    <section className="w-full py-16 bg-muted/50 dark:bg-muted/10 flex flex-col items-center gap-10">
      <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
      <div className="max-w-2xl w-full flex flex-col gap-6">
        {faqs.map(({ q, a }) => (
          <div key={q} className="rounded-lg bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-2">{q}</h3>
            <p className="text-muted-foreground text-base">{a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

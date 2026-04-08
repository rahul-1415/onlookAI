import { AppShell, PagePlaceholder } from "@onlook/ui";

export default function LoginPage() {
  return (
    <AppShell
      title="Login"
      subtitle="Email/password auth is part of the scaffold, but the full implementation will be added later."
    >
      <PagePlaceholder
        eyebrow="Auth"
        title="Authentication Entry Point"
        description="Reserved for the MVP login flow, role resolution, and post-login routing."
      />
    </AppShell>
  );
}


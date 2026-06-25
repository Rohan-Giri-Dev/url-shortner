import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#030712] px-4 py-10 text-neutral-100 overflow-hidden">
      {/* Background Subtle Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_85%_at_50%_-20%,rgba(16,185,129,0.06),rgba(255,255,255,0))]" />

      <div className="relative z-10 w-full max-w-md">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          forceRedirectUrl="/dashboard/me"
          fallbackRedirectUrl="/dashboard/me"
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              cardBox: "mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/[0.04]",
            },
          }}
        />
      </div>
    </main>
  );
}

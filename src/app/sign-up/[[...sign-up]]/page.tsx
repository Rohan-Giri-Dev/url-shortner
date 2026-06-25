import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#000000] px-4 py-10 text-neutral-100 overflow-hidden">
      <div className="relative z-10 w-full max-w-md">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          forceRedirectUrl="/dashboard/me"
          fallbackRedirectUrl="/dashboard/me"
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              cardBox: "mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-neutral-800",
            },
          }}
        />
      </div>
    </main>
  );
}

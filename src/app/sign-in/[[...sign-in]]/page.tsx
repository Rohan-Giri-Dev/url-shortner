import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070a0f] px-4 py-10 text-neutral-100">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard/me"
        fallbackRedirectUrl="/dashboard/me"
        appearance={{
          elements: {
            rootBox: "mx-auto w-full",
            cardBox: "mx-auto",
          },
        }}
      />
    </main>
  );
}

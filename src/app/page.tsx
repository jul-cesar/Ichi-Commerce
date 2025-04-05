"use client";

import { authClient } from "@/lib/client";

export default function Home() {
  const signIn = async () => {
    const data = await authClient.signIn.social({
      provider: "google",
    });
  };

  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch, //refetch the session
  } = authClient.useSession();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <button
        onClick={() => {
          signIn();
        }}
      >
        google
      </button>
      <button
        onClick={async () => {
          await authClient.signOut();
        }}
      >
        logout
      </button>
      <p>{session?.user.email}</p>
    </div>
  );
}

import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { MobileFrame } from "@/components/MobileFrame";

export const Route = createFileRoute("/")({
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) navigate({ to: "/home", replace: true });
      else navigate({ to: "/onboarding", replace: true });
    }, 1400);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <MobileFrame bg="bg-gradient-to-b from-sage-50 via-cream to-sage-100">
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="size-20 rounded-full bg-sage-600 text-cream grid place-items-center text-4xl shadow-lg shadow-sage-600/20 mb-6">
          🌱
        </div>
        <h1 className="font-serif italic text-5xl text-sage-900 mb-3">Haven</h1>
        <p className="text-sage-700/70 text-sm tracking-wide">You are not alone.</p>
      </div>
      <p className="pb-10 text-center text-xs text-sage-600/50 font-serif italic">
        Growing through the journey, together.
      </p>
    </MobileFrame>
  );
}

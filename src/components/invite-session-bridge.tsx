"use client";

import { useEffect, useRef } from "react";
import { readInviteFragment } from "@/lib/supabase/invite";

export function InviteSessionBridge() {
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const invitation = readInviteFragment(window.location.hash);
    if (!invitation) return;
    // Remove credentials from the address bar before importing the Auth client.
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + window.location.search,
    );
    const fail = () => window.location.replace("/entrar?auth=invite-error");
    if (invitation.kind === "error") {
      fail();
      return;
    }
    const { accessToken, refreshToken } = invitation;
    async function accept() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const client = createClient();
        const checked = await client.auth.getUser(accessToken);
        if (checked.error || !checked.data.user?.invited_at) {
          fail();
          return;
        }
        const { data, error } = await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error || !data.user?.invited_at) {
          fail();
          return;
        }
        // Browser cookies are not an authorization decision: verify via server.
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        });
        const verified = await response.json();
        if (!response.ok || verified.user?.id !== data.user.id) {
          fail();
          return;
        }
        window.location.replace("/conta/definir-senha?convite=aceito");
      } catch {
        fail();
      }
    }
    void accept();
  }, []);
  return null;
}

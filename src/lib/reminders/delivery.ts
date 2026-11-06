import "server-only";
import { isIP } from "node:net";
import { z } from "zod";
import type { getReminderConfig } from "./config";

type Config = NonNullable<ReturnType<typeof getReminderConfig>>;
type DeliveryCheck =
  | { ready: true }
  | {
      ready: false;
      code:
        | "provider_unavailable"
        | "provider_ip_blocked"
        | "sender_unavailable"
        | "relay_not_disabled";
      ip?: string;
    };

export async function checkReminderDelivery(
  config: Config,
): Promise<DeliveryCheck> {
  try {
    const response = await fetch(
      config.mode === "local"
        ? `${config.mailpitUrl}/api/v1/webui`
        : "https://api.brevo.com/v3/senders",
      {
        ...(config.mode === "brevo"
          ? {
              headers: { "api-key": config.apiKey, Accept: "application/json" },
            }
          : {}),
        signal: AbortSignal.timeout(3000),
        redirect: "error",
        cache: "no-store",
      },
    );
    const payload: unknown = await response.json();
    if (!response.ok) {
      const message = z.object({ message: z.string() }).safeParse(payload);
      if (
        config.mode === "brevo" &&
        response.status === 401 &&
        message.success &&
        /(?:unrecogni[sz]ed|unauthori[sz]ed).*ip|ip.*(?:authori[sz]|block|allow)/i.test(
          message.data.message,
        )
      ) {
        const ip = message.data.message.match(
          /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
        )?.[0];
        return {
          ready: false,
          code: "provider_ip_blocked",
          ...(ip && isIP(ip) === 4 ? { ip } : {}),
        };
      }
      return { ready: false, code: "provider_unavailable" };
    }
    if (config.mode === "local")
      return z
        .object({ MessageRelay: z.object({ Enabled: z.literal(false) }) })
        .safeParse(payload).success
        ? { ready: true }
        : { ready: false, code: "relay_not_disabled" };
    const senders = z
      .object({
        senders: z.array(z.object({ email: z.email(), active: z.boolean() })),
      })
      .safeParse(payload);
    return senders.success &&
      senders.data.senders.some(
        (sender) =>
          sender.active &&
          sender.email.toLowerCase() === config.senderEmail.toLowerCase(),
      )
      ? { ready: true }
      : { ready: false, code: "sender_unavailable" };
  } catch {
    return { ready: false, code: "provider_unavailable" };
  }
}

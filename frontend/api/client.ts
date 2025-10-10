import { Api } from "./api";

const baseUrl = process.env.NEXT_PUBLIC_WEBHOOK ?? "webhook_server";
const basePort = process.env.NEXT_PUBLIC_PORT ?? "8001"

export const api = new Api({
  baseUrl: `http://${baseUrl}:${basePort}`,
  baseApiParams: {
    headers: {
      "Content-Type": "application/json",
    },
  },
});

// calls
// api.webhook.callAgentMiniworldWebhookMiniworldPost()
// api.webhook.callAgentMiniworldWebhookRequirementsPost()
// api.webhook.callAgentMiniworldWebhookUseCasesPost()
// api.webhook.callAgentMiniworldWebhookClassDiagramsPost()
// api.webhook.callAgentMiniworldWebhookRevisionPost()
// api.webhook.callAgentMiniworldWebhookInterfacePrototypePost()
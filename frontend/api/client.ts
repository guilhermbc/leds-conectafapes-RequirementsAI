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
// Miniworld
// api.webhook.callAgentMiniworldWebhookMiniworldPost()

// Requirements
// api.webhook.callAgentMiniworldWebhookRequirementsPost()

// Use Case
// api.webhook.callAgentMiniworldWebhookUseCasesPost()

// Class Diagram
// api.webhook.callAgentMiniworldWebhookClassDiagramsPost()

// Revision
// api.webhook.callAgentMiniworldWebhookRevisionPost()

// Interface Prototype
// api.webhook.callAgentMiniworldWebhookInterfacePrototypePost()
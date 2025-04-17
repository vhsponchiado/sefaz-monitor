export enum WebhookType {
  TECHNICAL_NOTE = "TECHNICAL_NOTE",
  AVAILABILITY = "AVAILABILITY",
  CONTINGENCY = "CONTINGENCY"
}

export interface Webhook {
  url: string;
  type: WebhookType;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WebhookDocument extends Webhook {
  id: string;
}

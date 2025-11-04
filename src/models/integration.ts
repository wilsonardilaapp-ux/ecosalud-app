export type Integration = {
    id: string;
    name: string;
    fields: string; // JSON string for API keys, etc.
    status: 'active'
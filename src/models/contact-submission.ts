export type ContactSubmission = {
    id: string;
    businessId: string;
    formId: string;
    sender: string;
    email: string;
    message: string;
    date: string; // ISO 8601 date string
};

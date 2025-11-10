
export type GlobalConfig = {
    id: string;
    maintenance: boolean;
    logoURL: string;
    theme: string;
    supportEmail: string;
    defaultLimits: number;
    mainBusinessId?: string; // Add this line
};

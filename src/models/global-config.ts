
export type GlobalConfig = {
    id: string;
    maintenance: boolean;
    logoURL: string;
    theme: string;
    supportEmail: string;
    defaultLimits: number;
    allowUserRegistration: boolean; // Nuevo campo para controlar el registro
};

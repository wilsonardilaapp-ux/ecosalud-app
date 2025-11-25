
export type GlobalConfig = {
    id: string;
    maintenance: boolean;
    logoURL: string;
    theme: string;
    supportEmail: string;
    defaultLimits: number;
    allowUserRegistration: boolean;
    mainBusinessId?: string; // ID del negocio a mostrar en la landing principal
};

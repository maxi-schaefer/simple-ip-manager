export interface IPProfile {
    id: string;
    name: string;
    description: string;
    ip: string;
    gateway: string;
    dns?: string[];
    subnet: string;
    createdAt: Date;
    updatedAt: Date;
}
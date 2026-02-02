import { ConfigService } from '@nestjs/config';
export declare class WhatsAppService {
    private configService;
    private readonly apiUrl;
    private readonly apiKey;
    constructor(configService: ConfigService);
    createInstance(salaoId: string): Promise<any>;
    getQRCode(salaoId: string): Promise<any>;
    getInstanceStatus(salaoId: string): Promise<any>;
    sendMessage(salaoId: string, phoneNumber: string, message: string): Promise<any>;
    disconnectInstance(salaoId: string): Promise<any>;
}
//# sourceMappingURL=whatsapp.service.d.ts.map
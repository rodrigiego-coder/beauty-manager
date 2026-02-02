import { WhatsAppService } from './whatsapp.service';
export declare class WhatsAppController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsAppService);
    createInstance(salaoId: string): Promise<any>;
    getQRCode(salaoId: string): Promise<any>;
    getStatus(salaoId: string): Promise<any>;
    sendMessage(salaoId: string, data: {
        phoneNumber: string;
        message: string;
    }): Promise<any>;
    disconnect(salaoId: string): Promise<any>;
}
//# sourceMappingURL=whatsapp.controller.d.ts.map
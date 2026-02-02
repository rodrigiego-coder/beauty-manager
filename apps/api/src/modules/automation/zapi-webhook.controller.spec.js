"use strict";
/**
 * =====================================================
 * ZAPI WEBHOOK CONTROLLER - UNIT TESTS (ALFA.4)
 * Tests for filtering, logging, and salon resolution
 * =====================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
const zapi_webhook_controller_1 = require("./zapi-webhook.controller");
describe('ZapiWebhookController - Pure Functions (ALFA.4)', () => {
    // =====================================================
    // isValidUuid
    // =====================================================
    describe('isValidUuid', () => {
        it('should return true for valid UUID (any version)', () => {
            // v4 UUIDs
            expect((0, zapi_webhook_controller_1.isValidUuid)('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
            expect((0, zapi_webhook_controller_1.isValidUuid)('6ba7b810-9dad-41d8-80b4-00c04fd430c8')).toBe(true);
            // v1 UUID
            expect((0, zapi_webhook_controller_1.isValidUuid)('550e8400-e29b-11d4-a716-446655440000')).toBe(true);
            // Synthetic UUID (all a's)
            expect((0, zapi_webhook_controller_1.isValidUuid)('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa')).toBe(true);
            // Mixed case
            expect((0, zapi_webhook_controller_1.isValidUuid)('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
        });
        it('should return false for invalid UUID format', () => {
            expect((0, zapi_webhook_controller_1.isValidUuid)('not-a-uuid')).toBe(false);
            expect((0, zapi_webhook_controller_1.isValidUuid)('550e8400-e29b-41d4-a716')).toBe(false); // too short
            expect((0, zapi_webhook_controller_1.isValidUuid)('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false); // too long
            expect((0, zapi_webhook_controller_1.isValidUuid)('550e8400e29b41d4a716446655440000')).toBe(false); // no dashes
            expect((0, zapi_webhook_controller_1.isValidUuid)('')).toBe(false);
        });
        it('should return false for undefined/null', () => {
            expect((0, zapi_webhook_controller_1.isValidUuid)(undefined)).toBe(false);
        });
    });
    // =====================================================
    // summarizePayload
    // =====================================================
    describe('summarizePayload', () => {
        it('should extract key fields from payload', () => {
            const payload = {
                instanceId: 'inst-123',
                connectedPhone: '5511999998888',
                phone: '5511888887777',
                chatName: 'John Doe',
                isGroup: false,
                isNewsletter: false,
                fromMe: false,
                messageId: 'msg-456',
                type: 'ReceivedCallback',
                text: { message: 'Hello world' },
            };
            const summary = (0, zapi_webhook_controller_1.summarizePayload)(payload);
            expect(summary.instanceId).toBe('inst-123');
            expect(summary.connectedPhone).toBe('5511999998888');
            expect(summary.phone).toBe('5511888887777');
            expect(summary.chatName).toBe('John Doe');
            expect(summary.isGroup).toBe(false);
            expect(summary.isNewsletter).toBe(false);
            expect(summary.fromMe).toBe(false);
            expect(summary.hasText).toBe(true);
            expect(summary.messageId).toBe('msg-456');
            expect(summary.type).toBe('ReceivedCallback');
            expect(summary.messagePreview).toBe('Hello world');
        });
        it('should truncate long messages to 120 chars', () => {
            const longMessage = 'A'.repeat(200);
            const payload = {
                text: { message: longMessage },
            };
            const summary = (0, zapi_webhook_controller_1.summarizePayload)(payload);
            expect(summary.messagePreview).toBe('A'.repeat(120) + '...');
            expect(summary.messagePreview.length).toBe(123); // 120 + "..."
        });
        it('should handle missing fields gracefully', () => {
            const payload = {};
            const summary = (0, zapi_webhook_controller_1.summarizePayload)(payload);
            expect(summary.instanceId).toBeNull();
            expect(summary.phone).toBeNull();
            expect(summary.isGroup).toBe(false);
            expect(summary.isNewsletter).toBe(false);
            expect(summary.fromMe).toBe(false);
            expect(summary.hasText).toBe(false);
            expect(summary.messagePreview).toBeNull();
        });
        it('should use from field if phone is missing', () => {
            const payload = {
                from: '5511777776666@c.us',
            };
            const summary = (0, zapi_webhook_controller_1.summarizePayload)(payload);
            expect(summary.phone).toBe('5511777776666@c.us');
        });
    });
    // =====================================================
    // shouldIgnorePayload
    // =====================================================
    describe('shouldIgnorePayload', () => {
        it('should NOT ignore valid DM with text', () => {
            const payload = {
                text: { message: 'Hello' },
                fromMe: false,
                isGroup: false,
                isNewsletter: false,
            };
            const result = (0, zapi_webhook_controller_1.shouldIgnorePayload)(payload);
            expect(result.ignore).toBe(false);
            expect(result.reason).toBeNull();
        });
        it('should ignore payload without text', () => {
            const payload = {
                fromMe: false,
                isGroup: false,
            };
            const result = (0, zapi_webhook_controller_1.shouldIgnorePayload)(payload);
            expect(result.ignore).toBe(true);
            expect(result.reason).toBe('no_text');
        });
        it('should ignore payload with empty text', () => {
            const payload = {
                text: { message: '' },
                fromMe: false,
                isGroup: false,
            };
            const result = (0, zapi_webhook_controller_1.shouldIgnorePayload)(payload);
            expect(result.ignore).toBe(true);
            expect(result.reason).toBe('no_text');
        });
        it('should ignore messages sent by us (fromMe)', () => {
            const payload = {
                text: { message: 'Hello' },
                fromMe: true,
                isGroup: false,
                isNewsletter: false,
            };
            const result = (0, zapi_webhook_controller_1.shouldIgnorePayload)(payload);
            expect(result.ignore).toBe(true);
            expect(result.reason).toBe('from_me');
        });
        it('should ignore group messages', () => {
            const payload = {
                text: { message: 'Hello group' },
                fromMe: false,
                isGroup: true,
                isNewsletter: false,
            };
            const result = (0, zapi_webhook_controller_1.shouldIgnorePayload)(payload);
            expect(result.ignore).toBe(true);
            expect(result.reason).toBe('is_group');
        });
        it('should ignore newsletter messages', () => {
            const payload = {
                text: { message: 'Newsletter content' },
                fromMe: false,
                isGroup: false,
                isNewsletter: true,
            };
            const result = (0, zapi_webhook_controller_1.shouldIgnorePayload)(payload);
            expect(result.ignore).toBe(true);
            expect(result.reason).toBe('is_newsletter');
        });
        it('should check conditions in priority order (no_text > from_me > is_group > is_newsletter)', () => {
            // If multiple conditions are true, no_text should be returned first
            const payload1 = {
                fromMe: true,
                isGroup: true,
                isNewsletter: true,
            };
            expect((0, zapi_webhook_controller_1.shouldIgnorePayload)(payload1).reason).toBe('no_text');
            // If has text but fromMe, return from_me
            const payload2 = {
                text: { message: 'Hi' },
                fromMe: true,
                isGroup: true,
                isNewsletter: true,
            };
            expect((0, zapi_webhook_controller_1.shouldIgnorePayload)(payload2).reason).toBe('from_me');
            // If has text, not fromMe, but is group, return is_group
            const payload3 = {
                text: { message: 'Hi' },
                fromMe: false,
                isGroup: true,
                isNewsletter: true,
            };
            expect((0, zapi_webhook_controller_1.shouldIgnorePayload)(payload3).reason).toBe('is_group');
            // If has text, not fromMe, not group, but newsletter, return is_newsletter
            const payload4 = {
                text: { message: 'Hi' },
                fromMe: false,
                isGroup: false,
                isNewsletter: true,
            };
            expect((0, zapi_webhook_controller_1.shouldIgnorePayload)(payload4).reason).toBe('is_newsletter');
        });
    });
});
//# sourceMappingURL=zapi-webhook.controller.spec.js.map
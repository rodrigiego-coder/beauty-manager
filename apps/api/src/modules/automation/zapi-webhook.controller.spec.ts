/**
 * =====================================================
 * ZAPI WEBHOOK CONTROLLER - UNIT TESTS (ALFA.4)
 * Tests for filtering, logging, and salon resolution
 * =====================================================
 */

import {
  isValidUuid,
  summarizePayload,
  shouldIgnorePayload,
  ZapiPayload,
} from './zapi-webhook.controller';

describe('ZapiWebhookController - Pure Functions (ALFA.4)', () => {
  // =====================================================
  // isValidUuid
  // =====================================================
  describe('isValidUuid', () => {
    it('should return true for valid UUID (any version)', () => {
      // v4 UUIDs
      expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUuid('6ba7b810-9dad-41d8-80b4-00c04fd430c8')).toBe(true);
      // v1 UUID
      expect(isValidUuid('550e8400-e29b-11d4-a716-446655440000')).toBe(true);
      // Synthetic UUID (all a's)
      expect(isValidUuid('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa')).toBe(true);
      // Mixed case
      expect(isValidUuid('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
    });

    it('should return false for invalid UUID format', () => {
      expect(isValidUuid('not-a-uuid')).toBe(false);
      expect(isValidUuid('550e8400-e29b-41d4-a716')).toBe(false); // too short
      expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false); // too long
      expect(isValidUuid('550e8400e29b41d4a716446655440000')).toBe(false); // no dashes
      expect(isValidUuid('')).toBe(false);
    });

    it('should return false for undefined/null', () => {
      expect(isValidUuid(undefined)).toBe(false);
    });
  });

  // =====================================================
  // summarizePayload
  // =====================================================
  describe('summarizePayload', () => {
    it('should extract key fields from payload', () => {
      const payload: ZapiPayload = {
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

      const summary = summarizePayload(payload);

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
      const payload: ZapiPayload = {
        text: { message: longMessage },
      };

      const summary = summarizePayload(payload);

      expect(summary.messagePreview).toBe('A'.repeat(120) + '...');
      expect(summary.messagePreview!.length).toBe(123); // 120 + "..."
    });

    it('should handle missing fields gracefully', () => {
      const payload: ZapiPayload = {};

      const summary = summarizePayload(payload);

      expect(summary.instanceId).toBeNull();
      expect(summary.phone).toBeNull();
      expect(summary.isGroup).toBe(false);
      expect(summary.isNewsletter).toBe(false);
      expect(summary.fromMe).toBe(false);
      expect(summary.hasText).toBe(false);
      expect(summary.messagePreview).toBeNull();
    });

    it('should use from field if phone is missing', () => {
      const payload: ZapiPayload = {
        from: '5511777776666@c.us',
      };

      const summary = summarizePayload(payload);

      expect(summary.phone).toBe('5511777776666@c.us');
    });
  });

  // =====================================================
  // shouldIgnorePayload
  // =====================================================
  describe('shouldIgnorePayload', () => {
    it('should NOT ignore valid DM with text', () => {
      const payload: ZapiPayload = {
        text: { message: 'Hello' },
        fromMe: false,
        isGroup: false,
        isNewsletter: false,
      };

      const result = shouldIgnorePayload(payload);

      expect(result.ignore).toBe(false);
      expect(result.reason).toBeNull();
    });

    it('should ignore payload without text', () => {
      const payload: ZapiPayload = {
        fromMe: false,
        isGroup: false,
      };

      const result = shouldIgnorePayload(payload);

      expect(result.ignore).toBe(true);
      expect(result.reason).toBe('no_text');
    });

    it('should ignore payload with empty text', () => {
      const payload: ZapiPayload = {
        text: { message: '' },
        fromMe: false,
        isGroup: false,
      };

      const result = shouldIgnorePayload(payload);

      expect(result.ignore).toBe(true);
      expect(result.reason).toBe('no_text');
    });

    it('should ignore messages sent by us (fromMe)', () => {
      const payload: ZapiPayload = {
        text: { message: 'Hello' },
        fromMe: true,
        isGroup: false,
        isNewsletter: false,
      };

      const result = shouldIgnorePayload(payload);

      expect(result.ignore).toBe(true);
      expect(result.reason).toBe('from_me');
    });

    it('should ignore group messages', () => {
      const payload: ZapiPayload = {
        text: { message: 'Hello group' },
        fromMe: false,
        isGroup: true,
        isNewsletter: false,
      };

      const result = shouldIgnorePayload(payload);

      expect(result.ignore).toBe(true);
      expect(result.reason).toBe('is_group');
    });

    it('should ignore newsletter messages', () => {
      const payload: ZapiPayload = {
        text: { message: 'Newsletter content' },
        fromMe: false,
        isGroup: false,
        isNewsletter: true,
      };

      const result = shouldIgnorePayload(payload);

      expect(result.ignore).toBe(true);
      expect(result.reason).toBe('is_newsletter');
    });

    it('should check conditions in priority order (from_me > is_group > is_newsletter > no_text)', () => {
      // If fromMe is true, return from_me first (regardless of other conditions)
      const payload1: ZapiPayload = {
        fromMe: true,
        isGroup: true,
        isNewsletter: true,
      };
      expect(shouldIgnorePayload(payload1).reason).toBe('from_me');

      // If not fromMe but is group, return is_group
      const payload2: ZapiPayload = {
        text: { message: 'Hi' },
        fromMe: false,
        isGroup: true,
        isNewsletter: true,
      };
      expect(shouldIgnorePayload(payload2).reason).toBe('is_group');

      // If not fromMe, not group, but newsletter, return is_newsletter
      const payload3: ZapiPayload = {
        text: { message: 'Hi' },
        fromMe: false,
        isGroup: false,
        isNewsletter: true,
      };
      expect(shouldIgnorePayload(payload3).reason).toBe('is_newsletter');

      // If none of the above but no text, return no_text
      const payload4: ZapiPayload = {
        fromMe: false,
        isGroup: false,
        isNewsletter: false,
      };
      expect(shouldIgnorePayload(payload4).reason).toBe('no_text');
    });
  });
});

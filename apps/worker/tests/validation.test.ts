import { describe, it, expect } from 'vitest';
import {
  analyzeRequestSchema,
  downloadRequestSchema,
  workerCreateJobSchema,
} from '@videodrop/shared';

describe('Validation Schemas', () => {
  it('validates analyze requests', () => {
    expect(() =>
      analyzeRequestSchema.parse({ url: 'https://www.youtube.com/watch?v=12345' })
    ).not.toThrow();

    expect(() => analyzeRequestSchema.parse({ url: '' })).toThrow();
    expect(() => analyzeRequestSchema.parse({ url: 'not-a-valid-url' })).toThrow();

    // Check max length (2048 chars)
    const longUrl = 'https://example.com/' + 'a'.repeat(2100);
    expect(() => analyzeRequestSchema.parse({ url: longUrl })).toThrow();
  });

  it('validates download requests', () => {
    expect(() =>
      downloadRequestSchema.parse({
        url: 'https://vimeo.com/12345',
        format: 'mp4',
        quality: '1080p',
      })
    ).not.toThrow();

    expect(() =>
      downloadRequestSchema.parse({
        url: 'https://vimeo.com/12345',
        format: 'mp3',
        quality: 'Audio only (MP3)',
      })
    ).not.toThrow();

    // Invalid format
    expect(() =>
      downloadRequestSchema.parse({
        url: 'https://vimeo.com/12345',
        format: 'avi' as unknown,
        quality: '1080p',
      })
    ).toThrow();

    // Missing quality
    expect(() =>
      downloadRequestSchema.parse({
        url: 'https://vimeo.com/12345',
        format: 'mp4',
        quality: '',
      })
    ).toThrow();
  });

  it('validates worker job payload with IP', () => {
    expect(() =>
      workerCreateJobSchema.parse({
        url: 'https://tiktok.com/@user/video/123',
        format: 'mp4',
        quality: 'Best',
        ip: '198.51.100.5',
      })
    ).not.toThrow();
  });
});

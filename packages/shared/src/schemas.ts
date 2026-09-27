import { z } from 'zod';

export const analyzeRequestSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'Please enter a video URL')
    .max(2048, 'URL exceeds maximum length of 2048 characters')
    .url('Please enter a valid URL (starting with http:// or https://)'),
});

export type AnalyzeRequestInput = z.infer<typeof analyzeRequestSchema>;

export const downloadRequestSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'Please enter a video URL')
    .max(2048, 'URL exceeds maximum length of 2048 characters')
    .url('Please enter a valid URL'),
  format: z.enum(['mp4', 'mp3'], {
    errorMap: () => ({ message: 'Format must be either mp4 or mp3' }),
  }),
  quality: z
    .string()
    .trim()
    .min(1, 'Quality is required')
    .max(32, 'Quality identifier is invalid'),
});

export type DownloadRequestInput = z.infer<typeof downloadRequestSchema>;

export const workerCreateJobSchema = downloadRequestSchema.extend({
  ip: z.string().optional(),
});

export type WorkerCreateJobInput = z.infer<typeof workerCreateJobSchema>;

export const jobStatusSchema = z.object({
  jobId: z.string().uuid(),
});

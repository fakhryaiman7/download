import { NextRequest, NextResponse } from 'next/server';
import { analyzeRequestSchema, AppError } from '@videodrop/shared';
import { ZodError } from 'zod';
import { WorkerClient } from '@/lib/worker-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = analyzeRequestSchema.parse(body);

    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const video = await WorkerClient.analyze(url, clientIp);

    return NextResponse.json({
      success: true,
      video,
    });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: err.issues[0]?.message || 'Invalid URL provided',
        },
        { status: 400 }
      );
    }

    if (err instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: err.userMessage,
        },
        { status: err.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze video. Please check the URL and try again.',
      },
      { status: 500 }
    );
  }
}

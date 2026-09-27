import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@videodrop/shared';
import { WorkerClient } from '@/lib/worker-client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const job = await WorkerClient.getJobStatus(jobId);

    return NextResponse.json({
      success: true,
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      title: job.title,
      downloadUrl: job.downloadUrl,
      fileName: job.fileName,
      fileSize: job.fileSize,
      error: job.error,
    });
  } catch (err: unknown) {
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
        error: 'Failed to retrieve job status.',
      },
      { status: 500 }
    );
  }
}

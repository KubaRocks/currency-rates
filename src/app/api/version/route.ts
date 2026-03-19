import { NextResponse } from 'next/server';
import { readVersionFile } from '@/lib/helpers/version';
import { logger } from '@/lib/logger';
import type { VersionResponse } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const version = await readVersionFile();
    const payload: VersionResponse = { version };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    logger.error(`[version] Unable to read VERSION file: ${String(error)}`);

    return NextResponse.json(
      { message: 'Unable to read application version' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  }
}

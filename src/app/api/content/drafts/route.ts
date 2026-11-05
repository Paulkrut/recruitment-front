import { POST as handlePost } from '../../../../server/content-drafts/handler.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  return handlePost(request);
}
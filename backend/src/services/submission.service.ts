import { Submission } from '../models/submission.model';

export async function getUserLastCode(params: {
  userId: string;
  pid: number;
  language?: string | null;
}): Promise<{ code: string; language: string | null; pid: number }> {
  const filter: any = { user: params.userId, pid: params.pid };
  if (params.language) filter.language = params.language;
  const last = await Submission.findOne(filter)
    .sort({ createdAt: -1 })
    .select('code language pid')
    .lean();
  return {
    code: last?.code ?? '',
    language: (last?.language as string | undefined) ?? params.language ?? null,
    pid: params.pid,
  };
}

export async function listUserSubmissions(params: {
  userId: string;
  limit?: number;
  includeCode?: boolean;
}) {
  const limit = Math.max(1, Math.min(100, params.limit ?? 50));
  const query = Submission.find({ user: params.userId }).sort({ createdAt: -1 }).limit(limit);
  if (!params.includeCode) query.select('-code');
  return query.lean();
}

import { Problem } from '../models/problem.model';
import { NotFoundError } from '../utils/errors';

export async function createProblem(input: {
  title: string;
  descriptionMd: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}) {
  const doc = await Problem.create({
    title: input.title,
    descriptionMd: input.descriptionMd,
    difficulty: input.difficulty ?? 'easy',
    tags: input.tags ?? [],
  });
  return toDto(doc);
}

export async function getProblemByPid(pid: number) {
  const doc = await Problem.findOne({ pid });
  if (!doc) throw new NotFoundError('Problem not found');
  return toDto(doc);
}

export async function listProblems(params: { page?: number; limit?: number; tag?: string }) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const filter = params.tag ? { tags: params.tag } : {};

  const [items, total] = await Promise.all([
    Problem.find(filter)
      .sort({ pid: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Problem.countDocuments(filter),
  ]);
  return {
    items: items.map(toDto),
    page,
    limit,
    total,
  };
}

export async function updateProblem(
  pid: number,
  input: Partial<{
    title: string;
    descriptionMd: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
  }>
) {
  const doc = await Problem.findOneAndUpdate({ pid }, input, { new: true });
  if (!doc) throw new NotFoundError('Problem not found');
  return toDto(doc);
}

export async function deleteProblem(pid: number) {
  const doc = await Problem.findOneAndDelete({ pid });
  if (!doc) throw new NotFoundError('Problem not found');
}

function toDto(doc: any) {
  return {
    pid: doc.pid,
    title: doc.title,
    descriptionMd: doc.descriptionMd,
    difficulty: doc.difficulty,
    tags: doc.tags,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

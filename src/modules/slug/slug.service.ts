import {
  insertSlugRepository,
  findSlugByUserIdRepository,
} from "./slug.repository";

export async function getSlugByUserIdService(userId: string) {
    return await findSlugByUserIdRepository(userId);
}

export async function insertSlugService({
  userId,
  slug,
}: {
  userId: string;
  slug: string;
}) {
  const existingSlug = await findSlugByUserIdRepository(userId);

  if (existingSlug) {
    throw new Error("Este usuario ya tiene un slug configurado");
  }

  return insertSlugRepository({
    userId,
    slug,
  });
}
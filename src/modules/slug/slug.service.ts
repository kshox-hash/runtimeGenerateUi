import {
  insertSlugRepository,
  findSlugByUserIdRepository,
  findSlugByValueRepository,
} from "./slug.repository";

const RESERVED_SLUGS = [
  "admin",
  "api",
  "login",
  "auth",
  "dashboard",
  "calendar",
  "booking",
  "home",
  "support",
  "config",
  "settings",
  "profile",
  "user",
  "users",
  "public",
  "open",
  "menu",
  "v",
];

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
  const cleanSlug = slug.trim().toLowerCase();

  const existingSlug = await findSlugByUserIdRepository(userId);

  if (existingSlug) {
    throw new Error("Este usuario ya tiene un slug configurado");
  }

  if (cleanSlug.length < 5) {
    throw new Error("El nombre debe tener al menos 5 caracteres");
  }

  if (cleanSlug.length > 20) {
    throw new Error("El nombre no puede superar los 20 caracteres");
  }

  if (!/^[a-z0-9_-]+$/.test(cleanSlug)) {
    throw new Error(
      "Solo se permiten letras, números, guiones (-) y guiones bajos (_)"
    );
  }

  if (cleanSlug.startsWith("-") || cleanSlug.startsWith("_")) {
    throw new Error("El nombre no puede comenzar con guion o guion bajo");
  }

  if (cleanSlug.endsWith("-") || cleanSlug.endsWith("_")) {
    throw new Error("El nombre no puede terminar con guion o guion bajo");
  }

  if (cleanSlug.includes("--") || cleanSlug.includes("__")) {
    throw new Error("No se permiten guiones consecutivos");
  }

  if (RESERVED_SLUGS.includes(cleanSlug)) {
    throw new Error("Ese nombre está reservado");
  }

  const slugAlreadyExists = await findSlugByValueRepository(cleanSlug);

  if (slugAlreadyExists) {
    throw new Error("Ese nombre ya se encuentra ocupado");
  }

  return insertSlugRepository({
    userId,
    slug: cleanSlug,
  });
}
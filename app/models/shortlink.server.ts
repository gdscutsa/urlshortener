import type { ShortLink } from "@prisma/client";
import { customAlphabet } from "nanoid";

import { prisma } from "~/db.server";

const keyLength = 6;
const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, keyLength);

export async function getAllLinks(): Promise<ShortLink[]> {
  return prisma.shortLink.findMany();
}

export async function getLinkByAlias(alias: ShortLink["alias"]) {
  return prisma.shortLink.findUnique({ where: { alias } });
}

export async function createLinkWithAlias(
  alias: ShortLink["alias"],
  url: ShortLink["url"]
) {
  prisma.shortLink.create({
    data: {
      alias,
      url,
    },
  });
}

export async function createLink(url: ShortLink["url"]) {
  let alias = nanoid();
  while (await getLinkByAlias(alias)) {
    alias = nanoid();
  }

  await prisma.shortLink.create({
    data: {
      alias,
      url,
    },
  });

  return alias;
}

export async function deleteLinkByAlias(alias: ShortLink["alias"]) {
  return prisma.shortLink.delete({ where: { alias } });
}

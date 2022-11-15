import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getLinkByAlias } from "~/models/shortlink.server";

export const loader: LoaderFunction = async ({ params }) => {
  if (!params["*"] || params["*"] === "") {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  const shortLink = await getLinkByAlias(params["*"]);
  console.log(shortLink);

  if (!shortLink) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  return redirect(shortLink.url, 301);
};

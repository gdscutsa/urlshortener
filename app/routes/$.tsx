import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useCatch } from "@remix-run/react";
import { getLinkByAlias } from "~/models/shortlink.server";

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return (
      <main className="flex h-screen justify-center bg-slate-100">
        <div className="m-auto flex max-w-xl flex-col items-center justify-center space-y-6 bg-white p-10">
          <h1 className="text-xl font-medium">Link does not exist</h1>
          <p className="text-center text-gray-600">
            The short URL you clicked was deleted or never existed. Check that
            you entered or copy-pasted the short link correctly!
          </p>
          <a
            className="bg-gray-800 p-3 text-white duration-200 ease-in-out hover:scale-105"
            href="https://gdscutsa.com"
          >
            Go to https://gdscutsa.com
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen justify-center bg-slate-100">
      <div className="m-auto flex max-w-xl flex-col items-center justify-center space-y-6 bg-white p-10">
        <h1 className="text-xl font-medium">We ran into a problem</h1>
        <p className="text-center text-gray-600">
          We're sorry, but we ran into a problem. Please try again later.
        </p>
        <a
          className="bg-gray-800 p-3 text-white duration-200 ease-in-out hover:scale-105"
          href="https://gdscutsa.com"
        >
          Go to https://gdscutsa.com
        </a>
      </div>
    </main>
  );
}

export const loader: LoaderFunction = async ({ params }) => {
  if (!params["*"] || params["*"] === "") {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  const shortLink = await getLinkByAlias(params["*"]);

  if (!shortLink) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  return redirect(shortLink.url, 301);
};

export default function Index() {
  return (
    <div>
      <h1>Redirecting...</h1>
    </div>
  );
}

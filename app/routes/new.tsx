import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

import {
  createLink,
  createLinkWithAlias,
  deleteLinkByAlias,
  getAllLinks,
  getLinkByAlias,
} from "~/models/shortlink.server";

type ActionData =
  | {
      shortLink?: {
        alias: string;
        url: string;
      };
      errors?: { url: null | string; alias: null | string };
    }
  | undefined;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const intent = formData.get("intent") as string;
  const alias = formData.get("alias") as string;
  const url = formData.get("url") as string;

  if (intent === "delete") {
    await deleteLinkByAlias(alias);
    return json({});
  }

  const aliasExists = (await getLinkByAlias(alias)) || alias === "new";

  const errors = {
    url: url ? null : "URL is required",
    alias: !aliasExists ? null : "Alias already exists",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json<ActionData>({ errors });
  }

  if (!alias) {
    return json({ shortLink: { alias: await createLink(url), url } });
  }

  await createLinkWithAlias(alias, url);
  return json({ shortLink: { alias, url } });
};

export const headers = () => ({
  "WWW-Authenticate": "Basic",
});

const isAuthorized = (request: Request) => {
  const header = request.headers.get("Authorization");

  if (!header) return false;

  const base64 = header.replace("Basic ", "");
  const [username, password] = Buffer.from(base64, "base64")
    .toString()
    .split(":");

  return username === process.env.USERNAME && password === process.env.PASSWORD;
};

export const loader: LoaderFunction = async ({ request }) => {
  if (!isAuthorized(request)) {
    return json({ authorized: false }, { status: 401 });
  }

  const shortLinks = await getAllLinks();

  return json({
    authorized: true,
    shortLinks,
  });
};

export default function Index() {
  const actionData = useActionData<ActionData>();
  const data = useLoaderData();

  if (!data.authorized) {
    return <h1>Not Authorized</h1>;
  }

  return (
    <main className="min-h-full p-32">
      <div className="mx-auto w-full max-w-2xl space-y-10 px-8">
        <Form method="post" className="mx-auto max-w-md space-y-6">
          <h1 className="w-full text-center text-xl">GDSC URL Shortener</h1>

          <div>
            <label
              htmlFor="alias"
              className="block text-sm font-medium text-gray-700"
            >
              Alias (Optional)
            </label>
            <div className="mt-1">
              <input
                id="alias"
                autoFocus={true}
                name="alias"
                type="text"
                aria-describedby="alias-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.alias && (
                <div className="pt-1 text-red-700" id="alias-error">
                  {actionData?.errors.alias}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700"
            >
              URL
            </label>
            <div className="mt-1">
              <input
                id="url"
                required
                name="url"
                type="url"
                aria-describedby="url-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.url && (
                <div className="pt-1 text-red-700" id="url-error">
                  {actionData?.errors.url}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Create
          </button>
          {actionData?.shortLink ? (
            <div className="text-center">
              <a
                className="text-blue-500"
                href={`/${actionData.shortLink.alias}`}
              >
                https://go.gdscutsa.com/{actionData.shortLink.alias}
              </a>
              <br />
              redirects to
              <br />
              <a className="text-blue-500" href={actionData.shortLink.url}>
                {actionData.shortLink.url}
              </a>
            </div>
          ) : null}
        </Form>

        {data.shortLinks.length !== 0 ? (
          <div className="space-y-2">
            <h1 className="text-center text-xl">Your Short Links</h1>
            <ul>
              {data.shortLinks.map(
                ({ alias, url }: { alias: string; url: string }) => (
                  <li key={alias}>
                    <Form
                      method="post"
                      className="grid grid-flow-row grid-cols-3"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `https://go.gdscutsa.com/${alias}`
                          );
                        }}
                        className="inline-flex text-left"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                          className="mx-1 h-5 w-5 fill-gray-500"
                        >
                          <path d="M502.6 70.63l-61.25-61.25C435.4 3.371 427.2 0 418.7 0H255.1c-35.35 0-64 28.66-64 64l.0195 256C192 355.4 220.7 384 256 384h192c35.2 0 64-28.8 64-64V93.25C512 84.77 508.6 76.63 502.6 70.63zM464 320c0 8.836-7.164 16-16 16H255.1c-8.838 0-16-7.164-16-16L239.1 64.13c0-8.836 7.164-16 16-16h128L384 96c0 17.67 14.33 32 32 32h47.1V320zM272 448c0 8.836-7.164 16-16 16H63.1c-8.838 0-16-7.164-16-16L47.98 192.1c0-8.836 7.164-16 16-16H160V128H63.99c-35.35 0-64 28.65-64 64l.0098 256C.002 483.3 28.66 512 64 512h192c35.2 0 64-28.8 64-64v-32h-47.1L272 448z" />
                        </svg>
                        {alias}
                      </button>
                      <p className="text-center">{url}</p>
                      <input type="hidden" name="alias" value={alias} />
                      <input type="hidden" name="intent" value="delete" />
                      <button type="submit" className="text-right text-red-500">
                        delete
                      </button>
                    </Form>
                  </li>
                )
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </main>
  );
}

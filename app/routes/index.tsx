import { Form, useActionData } from "@remix-run/react";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";

import {
  createLink,
  createLinkWithAlias,
  getLinkByAlias,
} from "~/models/shortlink.server";
import { requireUserId } from "~/session.server";

type ActionData =
  | {
      url: null | string;
      alias: null | string;
    }
  | undefined;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const alias = formData.get("alias") as string;
  const url = formData.get("url") as string;

  const aliasExists = alias ? await getLinkByAlias(alias) : undefined;

  const errors: ActionData = {
    url: url ? null : "URL is required",
    alias: !aliasExists ? null : "Alias already exists",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json<ActionData>(errors);
  }

  if (alias) {
    console.log(await createLinkWithAlias(alias, url));
  } else {
    console.log(await createLink(url));
  }

  return null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserId(request);
  return json({});
};

export default function Index() {
  const errors = useActionData<ActionData>();
  console.log(errors);

  return (
    <main className="relative min-h-screen flex-col bg-white p-5 sm:flex sm:items-center sm:justify-center">
      <h1>GDSC URL Shortener</h1>
      <Form method="post" className="space-y-2">
        <div>
          <label htmlFor="alias">Alias (optional)</label>
          <input
            className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
            type="text"
            placeholder="Alias"
            name="alias"
          ></input>
        </div>
        <div>
          <label htmlFor="url">URL</label>
          <input
            id="url"
            className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
            type="url"
            placeholder="URL"
            name="url"
            required
          ></input>
        </div>
        <button
          className="w-full rounded bg-blue-500 px-2 py-1 text-lg text-white"
          type="submit"
        >
          Submit
        </button>
      </Form>
    </main>
  );
}

---
order: 0
layout: "@layouts/DocumentLayout.astro"
title: "Get session in the server"
---

This page is for: Actions, standalone endpoints, and server load functions (ie. for +page.server.ts and +server.ts files). To get the current user in shared load functions, refer to [Get current user in load functions](/sveltekit/basics/get-user-in-shared-load-functions). To get the current user in the client, refer to [Get user in the client](/learn/basics/get-user-in-the-client).

Inside `locals`, Lucia provides [`getSession()`](/sveltekit/api-reference/locals-api#getsession) method which will validate the request and return the current session. This will also attempt to renew the session as well if the original session was invalid.

```ts
const session = await locals.getSession();
```

Alternatively, you can use [`locals.getSessionUser()`](/sveltekit/api-reference/locals-api#getsessionuser) which works similarly to `locals.getSession()` but returns both the user and session without an additional database call.

```ts
const { session, user } = await locals.getSessionUser();
```

## Example

```ts
// +page.server.ts
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const actions: Actions = {
	default: async ({ locals }) => {
		const session = await locals.getSession();
		if (!session) {
			// unauthenticated
		}
	}
};

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session) {
		// unauthenticated
	}
};
```

```ts
// +server.ts
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session) {
		// unauthenticated
	}
};
```

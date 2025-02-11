---
order: 0
layout: "@layouts/DocumentLayout.astro"
title: "Server API"
---

These can be imported from `lucia-auth`. Can only be used inside a server context (.server.ts). The errors list is for Lucia client using official adapters.

```ts
import { generateRandomString } from "lucia-auth";
```

## `generateRandomString()`

Generates a random string of a defined length using [`nanoid`](https://github.com/ai/nanoid). The output is cryptographically random.

```ts
const generateRandomString: (length: number) => string;
```

#### Parameter

| name   | type     | description                     |
| ------ | -------- | ------------------------------- |
| length | `number` | the length of the output string |

#### Returns

| type     | description                 |
| -------- | --------------------------- |
| `string` | a randomly generated string |

#### Example

```ts
const randomString = generateRandomString(8);
```

## `lucia()` (default)

Creates a new `Auth` instance. Methods for `Auth` can throw adapter-specific database errors. The methods for the instance are listed below.

```ts
const lucia: (configs: Configurations) => Auth;
```

#### Parameter

| name    | type             | description                                                                                         |
| ------- | ---------------- | --------------------------------------------------------------------------------------------------- |
| configs | `Configurations` | options for Lucia - refer to [Lucia configurations](/reference/configurations/lucia-configurations) |

#### Example

```ts
const auth = lucia(configs);
```

### `authenticateUser()`

Validates the user's password using the provider id. Will not work with users without a password.

```ts
const authenticateUser: (provider: string, identifier: string, password: string) => Promise<User>;
```

#### Parameter

| name       | type     | description   |
| ---------- | -------- | ------------- |
| provider   | `string` | provider name |
| identifier | `string` | identifier    |
| password   | `string` | password      |

#### Returns

| type                                        | description            |
| ------------------------------------------- | ---------------------- |
| [`User`](/reference/types/lucia-types#user) | the authenticated user |

#### Errors

| name                     | description                                         |
| ------------------------ | --------------------------------------------------- |
| AUTH_INVALID_PROVIDER_ID | the user with the provider does not exist           |
| AUTH_INVALID_PASSWORD    | incorrect password                                  |
| AUTH_OUTDATED_PASSWORD   | the user's password is hashed with an old algorithm |

#### Example

```ts
import { auth } from "$lib/server/lucia";

try {
	await auth.authenticateUser("email", "user@example.com", "123456");
} catch {
	// invalid credentials
}
```

### `createSession()`

Creates a new session of a user.

```ts
const createSession: (userId: string) => Promise<Session>;
```

#### Parameter

| name   | type     | description                          |
| ------ | -------- | ------------------------------------ |
| userId | `string` | the user id of the session to create |

#### Returns

| type                                              | description               |
| ------------------------------------------------- | ------------------------- |
| [`Session`](/reference/types/lucia-types#session) | the newly created session |

#### Errors

| name                 | description     |
| -------------------- | --------------- |
| AUTH_INVALID_USER_ID | invalid user id |

#### Example

```ts
import { auth } from "$lib/server/lucia";
try {
	await auth.createSession(userId);
} catch {
	// invalid user id
}
```

### `createSessionCookies()`

Creates an array of session cookies in the form of [`Cookie`](/reference/types/lucia-types#cookie). Cookie options are based on [`sessionCookieOptions`](/reference/configure/lucia-configurations#sessioncookieoptions). This method will return a blank session cookies that will override the existing cookie and clears them when provided a `null` session.

```ts
const createSessionCookies: (session: Session | null) => Cookie[];
```

#### Parameter

| name    | type                                              | description |
| ------- | ------------------------------------------------- | ----------- |
| session | [`Session`](/reference/types/lucia-types#session) |             |

#### Returns

| type                                                | description                 |
| --------------------------------------------------- | --------------------------- |
| [`Cookie`](/reference/types/lucia-types#cookie)`[]` | an array of session cookies |

#### Example

```ts
import { auth } from "./lucia.js";

const cookies = auth.createSessionCookies(session);
const response = new Response(null, {
	headers: {
		"Set-Cookie": cookies.map((val) => val.serialize()).toString()
	}
});
```

### `createUser()`

Creates a new user.

```ts
const createUser: (
	provider: string,
	identifier: string,
	options?: {
		password?: string;
		attributes?: Lucia.UserAttributes;
	}
) => Promise<User>;
```

#### Parameter

| name               | type                                                                      | description                                             | optional |
| ------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------- | -------- |
| provider           | `string`                                                                  | the provider of the user to create                      |          |
| identifier         | `string`                                                                  | the identifier of the user˝ to create                   |          |
| options.password   | `string`                                                                  | the password of the user - can be undefined to omit it. | true     |
| options.attributes | [`Lucia.UserAttributes`](/reference/types/lucia-namespace#userattributes) | Additional user data to store in `user` table           | true     |

#### Returns

| type                                        | description            |
| ------------------------------------------- | ---------------------- |
| [`User`](/reference/types/lucia-types#user) | the newly created user |

#### Errors

| name                       | description                                      |
| -------------------------- | ------------------------------------------------ |
| AUTH_DUPLICATE_PROVIDER_ID | the user with the provider and identifier exists |

#### Example

```ts
import { auth } from "$lib/server/lucia";

try {
	await auth.createUser("email", "user@example.com", {
		password: "123456",
		attributes: {
			username: "user123",
			isAdmin: true
		}
	});
} catch {
	// error
}
```

### `deleteDeadUserSessions()`

Deletes all sessions that are expired and their idle period has passed (dead sessions). Will succeed regardless of the validity of the user id.

```ts
const deleteDeadUserSessions: (userId: string) => Promise<void>;
```

#### Parameter

| name   | type     | description         |
| ------ | -------- | ------------------- |
| userId | `string` | user id of the user |

#### Example

```ts
import { auth } from "lucia-auth";

try {
	await auth.deleteExpiredUserSession(userId);
} catch {
	// error
}
```

### `deleteUser()`

Deletes a user. Will succeed regardless of the validity of the user id.

```ts
const deleteUser: (userId: string) => Promise<void>;
```

#### Parameter

| name   | type     | description                   |
| ------ | -------- | ----------------------------- |
| userId | `string` | user id of the user to delete |

#### Example

```ts
import { auth } from "$lib/server/lucia";

try {
	await auth.deleteUser(userId);
} catch {
	// error
}
```

### `generateSessionId()`

Generates a new session id (40 chars long), as well as the expiration time (unix).

```ts
const generateSessionId: () => [string, number, number];
```

#### Returns

| name | type     | description                                             |
| ---- | -------- | ------------------------------------------------------- |
| [0]  | `string` | the session id                                          |
| [1]  | `number` | the session's expiration time                           |
| [2]  | `number` | the expiration time (unix) of the session's idle period |

### `getSessionUser()`

Validates an active session id, and gets the session and the user in one database call.

```ts
const getSessionUser: (sessionId: string) => Promise<{ user: User; session: Session }>;
```

#### Parameter

| name      | type     | description               |
| --------- | -------- | ------------------------- |
| sessionId | `string` | a valid active session id |

#### Returns

| name    | type                                              | description                   |
| ------- | ------------------------------------------------- | ----------------------------- |
| session | [`Session`](/reference/types/lucia-types#session) | the session of the session id |
| user    | [`User`](/reference/types/lucia-types#user)       | the user of the session       |

#### Errors

| name                    | description               |
| ----------------------- | ------------------------- |
| AUTH_INVALID_SESSION_ID | a valid active session id |

#### Example

```ts
import { auth } from "$lib/server/lucia";

try {
	await auth.getSessionUser(sessionId);
} catch {
	// invalid session id
}
```

### `getSessionUserFromRequest()`

Similar to [`validateRequest()`](/reference/api/server-api#validaterequest) but returns both the session and user without an additional database call. `setCookie()` will called whenever the method needs to set a session.

```ts
const validateRequest: (
	request: MinimalRequest,
	setSessionCookie: (session: Session | null) => void
) => Promise<{ user: User; session: Session }>;
```

#### Parameter

| name             | type                                                            | description                                                                                       |
| ---------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| request          | [`MinimalRequest`](/reference/types/lucia-types#minimalrequest) | the fetch [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) can be used as is |
| setSessionCookie | `Function`                                                      | stores the provided session as cookies - clear cookies on `null`                                  |

#### Returns

| name    | type                                              | description                   |
| ------- | ------------------------------------------------- | ----------------------------- |
| session | [`Session`](/reference/types/lucia-types#session) | the session of the session id |
| user    | [`User`](/reference/types/lucia-types#user)       | the user of the session       |

#### Errors

| name                    | description                                                        |
| ----------------------- | ------------------------------------------------------------------ |
| AUTH_INVALID_REQUEST    | the request is not from a trusted origin                           |
| AUTH_INVALID_SESSION_ID | the value of `auth_session` cookie is an invalid active session id |

#### Example

```ts
import { auth } from "lucia-auth";

try {
	let stringifiedCookie = "";
	const { session, user } = await auth.getSessionUserFromRequest(request, (session) => {
		stringifiedCookie = auth
			.createSessionCookies(session)
			.map((val) => val.serialize())
			.toString();
	});
	const response = new Response();
	response.headers.append("set-cookie", stringifiedCookie);
} catch {
	// invalid
}
```

### `getUser()`

Gets a user.

```ts
const getUser: (userId: string) => Promise<User>;
```

#### Parameter

| name   | type     | description         |
| ------ | -------- | ------------------- |
| userId | `string` | user id of the user |

#### Returns

| type                                        | description               |
| ------------------------------------------- | ------------------------- |
| [`User`](/reference/types/lucia-types#user) | the user with the user id |

#### Errors

| name                 | description                              |
| -------------------- | ---------------------------------------- |
| AUTH_INVALID_USER_ID | the user with the user id does not exist |

#### Example

```ts
import { auth } from "$lib/server/lucia";

try {
	await auth.getUser(userId);
} catch {
	// invalid user id
}
```

### `getUserByProviderId()`

Get a user by the provider id (provider name, identifier).

```ts
const getUserByProviderId: (provider: string, identifier: string) => Promise<User>;
```

#### Parameter

| name       | type     | description                   |
| ---------- | -------- | ----------------------------- |
| provider   | `string` | the provider name of the user |
| identifier | `string` | the identifier of the user    |

#### Returns

| type                                        | description                   |
| ------------------------------------------- | ----------------------------- |
| [`User`](/reference/types/lucia-types#user) | the user with the provider id |

#### Errors

| name                     | description                                  |
| ------------------------ | -------------------------------------------- |
| AUTH_INVALID_PROVIDER_ID | the user with the provider id does not exist |

#### Example

```ts
import { auth } from "$lib/server/lucia";

try {
	await auth.getUserByProviderId("email", "user@example.com");
} catch {
	// invalid provider id
}
```

### `invalidateAllUserSessions()`

Invalidates all sessions of a user. Will succeed regardless of the validity of the user id.

```ts
const invalidateAllUserSessions: (userId: string) => Promise<void>;
```

#### Parameter

| name   | type     | description         |
| ------ | -------- | ------------------- |
| userId | `string` | user id of the user |

#### Example

```ts
import { auth } from "$lib/server/lucia";

try {
	await auth.invalidateAllUserSession(userId);
} catch {
	// error
}
```

### `invalidateSession()`

Invalidates a session. Will succeed regardless of the validity of the session id.

```ts
const invalidateSession: (sessionId: string) => Promise<void>;
```

#### Parameter

| name      | type     | description  |
| --------- | -------- | ------------ |
| sessionId | `string` | a session id |

#### Example

```ts
import { auth } from "lucia-auth";

try {
	await auth.invalidateSession(sessionId);
} catch {
	// error
}
```

### `parseRequest()`

Checks if the request is from a trusted origin if `configuration.csrfProtection` is true, and gets the session id from the cookie. Returns an empty string if none exists. This does **NOT** check the validity of the session id.

```ts
const parseRequest: (request: MinimalRequest) => string;
```

#### Parameter

| name    | type                                                            | description                  |
| ------- | --------------------------------------------------------------- | ---------------------------- |
| request | [`MinimalRequest`](/reference/types/lucia-types#minimalrequest) | Node's `Request` can be used |

#### Returns

| type     | description                         |
| -------- | ----------------------------------- |
| `string` | the session id read from the cookie |

#### Errors

| name                 | description                              |
| -------------------- | ---------------------------------------- |
| AUTH_INVALID_REQUEST | the request is not from a trusted origin |

#### Example

```ts
try {
	const sessionId = auth.parseRequest(request);
} catch {
	// request from untrusted domain
}
```

### `renewSession()`

Takes and validates an active or idle session id, and renews the session. The used session id (and its session) is invalidated.

```ts
const renewSession: (sessionId: string) => Promise<Session>;
```

#### Parameter

| name      | type     | description                       |
| --------- | -------- | --------------------------------- |
| sessionId | `string` | a valid active or idle session id |

#### Returns

| type                                              | description               |
| ------------------------------------------------- | ------------------------- |
| [`Session`](/reference/types/lucia-types#session) | the newly created session |

#### Errors

| name                    | description        |
| ----------------------- | ------------------ |
| AUTH_INVALID_SESSION_ID | invalid session id |

#### Example

```ts
import { auth } from "lucia-auth";

try {
	const session = await auth.renewSession(refreshToken);
} catch {
	// error
}
```

### `updateUserAttributes()`

Updates one of the custom fields in the `user` table. The keys of `attributes` should include one or more of the additional columns inside `user` table, and the values can be `null` but not `undefined`.

```ts
const updateUserAttributes: (
	userId: string,
	attributes: Partial<Lucia.UserAttributes>
) => Promise<User>;
```

#### Parameter

| name       | type                                                                                   | description                                                             |
| ---------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| userId     | `string`                                                                               | A refresh token                                                         |
| attributes | `Partial<`[`Lucia.UserAttributes`](/reference/types/lucia-namespace#userattributes)`>` | Key-value pairs of some or all of the column in `user` table to update. |

#### Returns

| type                                        | description      |
| ------------------------------------------- | ---------------- |
| [`User`](/reference/types/lucia-types#user) | the updated user |

#### Errors

| name                 | description           |
| -------------------- | --------------------- |
| AUTH_INVALID_USER_ID | invalid refresh token |

#### Example

```ts
import { auth } from "lucia-auth";

try {
	await auth.updateUserAttributes(userId, {
		username: "user123"
	});
} catch {
	// error
}
```

### `updateUserPassword()`

Updates a user's password.

```ts
const updateUserPassword: (userId: string, password: string | null) => Promise<User>;
```

#### Parameter

| name     | type             | description     |
| -------- | ---------------- | --------------- |
| userId   | `string`         | a refresh token |
| password | `string \| null` | a new password  |

#### Returns

| type                                        | description      |
| ------------------------------------------- | ---------------- |
| [`User`](/reference/types/lucia-types#user) | the updated user |

#### Errors

| name                 | description           |
| -------------------- | --------------------- |
| AUTH_INVALID_USER_ID | invalid refresh token |

#### Example

```ts
import { auth } from "lucia-auth";

try {
	await auth.updateUserPassword(userId, "123456");
	await auth.updateUserPassword(userId, null);
} catch {
	// error
}
```

### `updateUserProviderId()`

Updates a user's provider id.

```ts
const updateUserProviderId: (userId: string, provider: string, identifier: string) => Promise<User>;
```

#### Parameter

| name       | type     | description                          |
| ---------- | -------- | ------------------------------------ |
| userId     | `string` | a refresh token                      |
| provider   | `string` | the provider name of the provider id |
| identifier | `string` | the identifier of the provider id    |

#### Returns

| type                                        | description      |
| ------------------------------------------- | ---------------- |
| [`User`](/reference/types/lucia-types#user) | the updated user |

#### Errors

| name                 | description           |
| -------------------- | --------------------- |
| AUTH_INVALID_USER_ID | invalid refresh token |

#### Example

```ts
import { auth } from "lucia-auth";

try {
	await auth.updateUserProviderId(userId, "email", "user@example.com");
} catch {
	// error
}
```

### `validateRequest()`

Checks if the request is from a trusted domain, and if so, validates the session id stored inside `auth_session` cookie. If the session is invalid, it attempts to renew the session. `setCookie()` will called whenever the method needs to set a session.

```ts
const validateRequest: (
	request: MinimalRequest,
	setSessionCookie: (session: Session | null) => void
) => Promise<Session>;
```

#### Parameter

| name      | type                                                            | description                                                                                       |
| --------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| request   | [`MinimalRequest`](/reference/types/lucia-types#minimalrequest) | the fetch [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) can be used as is |
| setCookie | `Function`                                                      | stores the provided session as cookies - clear cookies on `null`                                  |

#### Returns

| type                                              | description                   |
| ------------------------------------------------- | ----------------------------- |
| [`Session`](/reference/types/lucia-types#session) | the session of the session id |

#### Errors

| name                    | description                                                        |
| ----------------------- | ------------------------------------------------------------------ |
| AUTH_INVALID_REQUEST    | the request is not from a trusted origin                           |
| AUTH_INVALID_SESSION_ID | the value of `auth_session` cookie is an invalid active session id |

#### Example

```ts
import { auth } from "lucia-auth";

try {
	let stringifiedCookie = "";
	const session = await auth.validateRequest(request, (session) => {
		stringifiedCookie = auth
			.createSessionCookies(session)
			.map((val) => val.serialize())
			.toString();
	});
	const response = new Response();
	response.headers.append("set-cookie", stringifiedCookie);
} catch {
	// invalid
}
```

### `validateSession()`

Validates an active session id. Idle sessions are considered invalid.

```ts
const validateSession: (sessionId: string) => Promise<Session>;
```

#### Parameter

| name      | type     | description               |
| --------- | -------- | ------------------------- |
| sessionId | `string` | a valid active session id |

#### Returns

| type                                              | description                   |
| ------------------------------------------------- | ----------------------------- |
| [`Session`](/reference/types/lucia-types#session) | the session of the session id |

#### Errors

| name                    | description               |
| ----------------------- | ------------------------- |
| AUTH_INVALID_SESSION_ID | invalid active session id |

#### Example

```ts
import { auth } from "lucia-auth";

try {
	const session = await auth.validateSession(sessionId);
} catch {
	// invalid
}
```

## `LuciaError`

Refer to [Error reference](/reference/types/errors).

```ts
class LuciaError extends Error {}
```

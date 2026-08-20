# Public REST API

The Streaming Tool exposes a REST API so third-party programs (for example an Elgato Stream Deck)
can read and manipulate the broadcast data without going through the Control Panel.

All state changes made through the API are broadcast to every connected overlay and Control Panel
via SignalR, so overlays update **live** — no matter which client triggered the change.

> Base URL (default): `http://localhost:7000`

---

## Authentication

By default the API is **open**: any client may call it without authentication. This is intended for
the common case where the tool only listens on `localhost`.

Because the tool can also be bound to a LAN address or exposed via port-forwarding, authentication
can be **enforced**. This is a "better to have it and not need it" precaution.

| Mode                                | Behaviour                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| `allowUnauthenticatedRequests=true` | (Default) Every request is allowed.                                                   |
| `allowUnauthenticatedRequests=false`| Requests must carry a valid API key via the `X-Api-Key` header.                       |

### Rules while authentication is enforced

- **Control Panel always works.** Requests whose `Origin` is the Control Panel
  (`http://localhost:4200` / `:4201`) bypass API-key authentication, so the panel can never lock
  itself out.
- **API keys are sent via the `X-Api-Key` header.**
- **Read-only keys** (`accessLevel = 0`) may only perform `GET`/`HEAD` requests. Any write request
  is answered with `403 Forbidden`.
- **API management endpoints** (`/api/api-settings`, `/api/api-keys`, `/api/api-log`) are reserved
  for the Control Panel while authentication is enforced. API keys cannot manage other API keys and
  receive `403 Forbidden`.
- Unknown or missing keys are answered with `401 Unauthorized`.

### API keys

- Keys are generated with the prefix `stt_` (streaming tool), e.g. `stt_3250c04c8028…`.
- Only a **SHA-256 hash** of the key is stored. The plaintext key is returned **exactly once**, at
  creation time, and can never be retrieved again.
- Each key stores a display prefix (first 12 characters), a name, an access level, its creation time,
  and its last-used time.

---

## Endpoints

### Broadcast data

See [`backend.md`](./backend.md) for the full `BroadcastStateDto`, `SocialsDto` and
`CommentatorBoxTimeDataDto` shapes.

| Method | Path                                              | Description                          |
| ------ | ------------------------------------------------- | ------------------------------------ |
| `GET`  | `/api/broadcast/state`                            | Get the current broadcast state.     |
| `POST` | `/api/broadcast/state`                            | Overwrite the broadcast state.       |
| `GET`  | `/api/socials/socials`                            | Get the current socials.             |
| `POST` | `/api/socials/socials`                            | Overwrite the socials.               |
| `GET`  | `/api/commentator-box-time-data/commentator-box-time-data` | Get the commentator box timing. |
| `POST` | `/api/commentator-box-time-data/commentator-box-time-data` | Overwrite the commentator box timing. |

### Convenience endpoints (Stream Deck friendly)

These let a single button trigger a change without a full get-modify-post cycle. They broadcast the
updated state via SignalR just like a full `POST /api/broadcast/state`.

| Method | Path                                              | Description                                            |
| ------ | ------------------------------------------------- | ------------------------------------------------------ |
| `POST` | `/api/broadcast/score/increment?team=alpha\|bravo`| Increase a team's score by one.                        |
| `POST` | `/api/broadcast/score/decrement?team=alpha\|bravo`| Decrease a team's score by one (never below 0).        |
| `POST` | `/api/broadcast/visibility/{element}/toggle`      | Toggle an overlay element's visibility.                |

`{element}` is one of `map-screen`, `score-box`, `commentator-box`, `info-box`.
An unknown team or element is answered with `400 Bad Request`.

**Example (Stream Deck / curl):**

```bash
# No auth (default)
curl -X POST "http://localhost:7000/api/broadcast/score/increment?team=alpha"

# With enforced auth
curl -X POST "http://localhost:7000/api/broadcast/score/increment?team=alpha" \
     -H "X-Api-Key: stt_3250c04c8028..."
```

### API management (Control Panel)

| Method   | Path                    | Description                                                             |
| -------- | ----------------------- | ----------------------------------------------------------------------- |
| `GET`    | `/api/api-settings`     | Get the API settings.                                                   |
| `POST`   | `/api/api-settings`     | Update the API settings (`{ "allowUnauthenticatedRequests": bool }`).   |
| `GET`    | `/api/api-keys`         | List issued keys (metadata only — never the key or hash).              |
| `POST`   | `/api/api-keys`         | Create a key (`{ "name": string, "accessLevel": 0\|1 }`). Returns the plaintext key once. |
| `DELETE` | `/api/api-keys/{id}`    | Revoke a key.                                                           |
| `GET`    | `/api/api-log`          | Get the in-memory request log of the current session.                  |
| `DELETE` | `/api/api-log`          | Clear the request log.                                                  |

`accessLevel`: `0` = read-only, `1` = read-write.

---

## Session request log

Every request to an `/api` endpoint is recorded in an **in-memory ring buffer** (the last 200
requests). The log is intentionally **not persisted** and is empty after a backend restart.

Each entry contains:

| Field         | Description                                                             |
| ------------- | ----------------------------------------------------------------------- |
| `timestamp`   | When the request was handled (UTC).                                     |
| `method`      | HTTP method.                                                            |
| `path`        | Request path.                                                           |
| `statusCode`  | Response status code.                                                   |
| `source`      | `"Control Panel"`, the name of the API key used, or `"Anonym"`.        |
| `wasRejected` | `true` if the request was rejected by API authentication (401/403).    |

New entries are pushed to Control Panel clients via SignalR (`apiLogEntryAdded`), so the API log in
the Control Panel updates live.

---

## SignalR events

In addition to the existing overlay events, the `/overlayHub` now emits the following events on the
`IOverlayClient` interface (consumed by the Control Panel's API settings dialog):

| Event               | Triggered by                          | Payload            |
| ------------------- | ------------------------------------- | ------------------ |
| `apiSettingsUpdated`| `POST /api/api-settings`              | `ApiSettingsDto`   |
| `apiKeysUpdated`    | `POST`/`DELETE /api/api-keys`         | `ApiKeyDto[]`      |
| `apiLogEntryAdded`  | Any handled `/api` request            | `ApiLogEntryDto`   |
| `apiLogCleared`     | `DELETE /api/api-log`                 | *(none)*           |

This is what makes the Control Panel's API dialog update live when a change is made from another
client (e.g. issuing a key or toggling authentication elsewhere).

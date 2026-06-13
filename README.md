# r34 Discord User App

A **user-installable** Discord app (not a server bot) exposing a single `/fetch`
command that pulls posts from rule34. Because it's installed to *your account*,
you can use it anywhere — your own servers, other people's servers, DMs, and
group DMs.

## Command

```
/fetch tags:<string> [limit:<1-10>] [score:<number>] [ai:<bool>]
```

| Option  | Type    | Default | Description                                  |
|---------|---------|---------|----------------------------------------------|
| `tags`  | string  | —       | Space separated tags (required)              |
| `limit` | integer | `1`     | Number of posts to return (max 10)           |
| `score` | integer | `100`   | Minimum post score                           |
| `ai`    | boolean | `false` | Include AI generated content                 |

Replies are **ephemeral** (only you see them).

## Folder structure

```
src/
├── index.js              # Gateway client + interaction router
├── deploy-commands.js    # Registers global slash commands
├── loadCommands.js       # Recursively loads commands/<category>/<command>.js
├── commands/
│   └── booru/
│       └── fetch.js      # The /fetch command
└── services/
    └── rule34.js         # rule34 API client
```

## Setup

1. Create an application at <https://discord.com/developers/applications>.
2. Under **Installation**, enable **User Install** and set the install link to
   "Discord Provided Link". Under **Bot**, copy the token.
3. Copy env and fill it in:
   ```sh
   cp .env.example .env
   ```

   - `DISCORD_BOT_TOKEN` — your app's bot token
   - `DISCORD_CLIENT_ID` — your application (client) ID
   - `RULE34_API_KEY` / `RULE34_USER_ID` — from rule34.xxx → Account → Options →
     API access (the API now rejects unauthenticated requests)
4. Install deps and register commands:
   ```sh
   npm install
   npm run deploy
   ```
5. Run it:
   ```sh
   npm start
   ```
6. Open the **Install Link** from the dev portal to add the app to your account.

## Docker

```sh
docker build -t r34-user-app .
docker run --env-file .env r34-user-app
```

> Global command registration can take up to ~1 hour to propagate the first time.

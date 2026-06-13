import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { loadCommands } from './loadCommands.js';

const { DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID } = process.env;
if (!DISCORD_BOT_TOKEN || !DISCORD_CLIENT_ID) {
  console.error('Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID in environment.');
  process.exit(1);
}

const commands = await loadCommands();
const body = [...commands.values()].map((c) => c.data.toJSON());

const rest = new REST().setToken(DISCORD_BOT_TOKEN);

console.log(`Registering ${body.length} global command(s)...`);
const data = await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body });
console.log(`Successfully registered ${data.length} command(s).`);

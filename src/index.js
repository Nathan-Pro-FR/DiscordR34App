import 'dotenv/config';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { loadCommands } from './loadCommands.js';
import express from 'express'; // 👈 Ajout de l'import Express

const { DISCORD_BOT_TOKEN, PORT } = process.env; // 👈 Récupération optionnelle du PORT de Render
if (!DISCORD_BOT_TOKEN) {
  console.error('[❌ ERROR] : Le `DISCORD_BOT_TOKEN` est manquant dans le `.env` !');
  process.exit(1);
}

// ------------------ SERVEUR EXPRESS POUR RENDER ------------------
const app = express();
const serverPort = PORT || 8080; // Render injecte automatiquement une variable PORT

app.get('/', (req, res) => {
  res.send('⚙️ R34 Discord User App is online and healthy!');
});

app.listen(serverPort, () => {
  console.log(`[🌐 SERVER] : Serveur d'écoute actif sur le port ${serverPort}`);
});
// ----------------------------------------------------------------

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands = await loadCommands();
console.log(`[⚙️ SETUP] : ${commands.size} commande(s) chargée(s) : ${[...commands.keys()].join(', ')}`);

client.once(Events.ClientReady, (c) => {
  console.log(`[✅ READY] : Connecté en tant que ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    console.log(`[🚀 START] : L'utilisateur ${interaction.user.tag} a lancé : /${interaction.commandName}`);

    await command.execute(interaction);
  } catch (err) {
    console.error(`[💥 FATAL] : Échec de la commande /${interaction.commandName} :`, err);
    const payload = { content: '⚠️ La commande a échoué de manière inattendue.', flags: 1 << 6 };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

client.login(DISCORD_BOT_TOKEN);

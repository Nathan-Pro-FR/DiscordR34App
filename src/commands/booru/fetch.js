import {
  SlashCommandBuilder,
  ApplicationIntegrationType,
  InteractionContextType,
} from 'discord.js';
import { fetchPosts } from '../../services/rule34.js';

const MAX_LIMIT = 10;

export const data = new SlashCommandBuilder()
  .setName('fetch')
  .setDescription('Fetch posts from rule34.')
  .setIntegrationTypes(
    ApplicationIntegrationType.UserInstall,
    ApplicationIntegrationType.GuildInstall,
  )
  .setContexts(
    InteractionContextType.Guild,
    InteractionContextType.BotDM,
    InteractionContextType.PrivateChannel,
  )
  .addStringOption((opt) =>
    opt
      .setName('tags')
      .setDescription('Space separated tags to search for.')
      .setRequired(true),
  )
  .addIntegerOption((opt) =>
    opt
      .setName('limit')
      .setDescription('How many posts to return (default 1, max 10).')
      .setMinValue(1)
      .setMaxValue(MAX_LIMIT),
  )
  .addIntegerOption((opt) =>
    opt
      .setName('score')
      .setDescription('Minimum post score (default 100).')
      .setMinValue(0),
  )
  .addBooleanOption((opt) =>
    opt
      .setName('ai')
      .setDescription('Include AI generated content (default false).'),
  )
  .addBooleanOption((opt) =>
    opt
      .setName('spoiler')
      .setDescription('Hide media behind a spoiler (default true).'),
  );

export async function execute(interaction) {
  const tags = interaction.options.getString('tags', true);
  const limit = interaction.options.getInteger('limit') ?? 1;
  const score = interaction.options.getInteger('score') ?? 100;
  const ai = interaction.options.getBoolean('ai') ?? false;
  const spoiler = interaction.options.getBoolean('spoiler') ?? true;

  await interaction.deferReply();

  let posts;
  try {
    posts = await fetchPosts({ tags, limit, score, ai });
  } catch (err) {
    console.error('[fetch] rule34 request failed:', err);
    await interaction.editReply('⚠️ Something went wrong talking to rule34. Try again later.');
    return;
  }

  if (posts.length === 0) {
    await interaction.editReply(
      `No results for \`${tags}\` (score ≥ ${score}${ai ? '' : ', no AI'}).`,
    );
    return;
  }
  
  const content = posts
    .map((post) => post.file_url || post.sample_url || post.preview_url)
    .filter(Boolean)
    .map((url) => (spoiler ? `|| ${url} ||` : url))
    .join('\n');
  
  await interaction.editReply({ content: content || 'No media URLs found for these posts.' });

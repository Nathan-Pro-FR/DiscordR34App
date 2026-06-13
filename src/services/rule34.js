import { request } from 'undici';

const API_BASE = 'https://api.rule34.xxx/index.php';

const POOL_SIZE = 1000;

function buildTagQuery({ tags, score, ai }) {
  const parts = tags.trim().split(/\s+/).filter(Boolean);

  if (Number.isFinite(score)) {
    parts.push(`score:>=${score}`);
  }

  if (!ai) {
    parts.push('-ai_generated');
  }

  return parts.join(' ');
}

export async function fetchPosts({ tags, limit, score, ai }) {
  const query = new URLSearchParams({
    page: 'dapi',
    s: 'post',
    q: 'index',
    json: '1',
    limit: String(POOL_SIZE),
    tags: buildTagQuery({ tags, score, ai }),
  });

  const { RULE34_API_KEY, RULE34_USER_ID } = process.env;
  if (RULE34_API_KEY && RULE34_USER_ID) {
    query.set('api_key', RULE34_API_KEY);
    query.set('user_id', RULE34_USER_ID);
  }

  const url = `${API_BASE}?${query.toString()}`;

  const { statusCode, body } = await request(url, {
    headers: {
      'User-Agent': 'r34-discord-user-app/1.0 (+https://discord.com)',
      Accept: 'application/json',
    },
  });

  if (statusCode !== 200) {
    throw new Error(`rule34 API returned HTTP ${statusCode}`);
  }

  const text = await body.text();

  if (!text.trim()) {
    return [];
  }

  if (/missing authentication|invalid/i.test(text) && !text.trim().startsWith('[')) {
    throw new Error('rule34 rejected the request — set RULE34_API_KEY and RULE34_USER_ID.');
  }

  let posts;
  try {
    posts = JSON.parse(text);
  } catch {
    throw new Error('Failed to parse rule34 API response.');
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    return [];
  }

  return sample(posts, limit);
}

function sample(arr, count) {
  const copy = arr.slice();
  const n = Math.min(count, copy.length);
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(Math.random() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

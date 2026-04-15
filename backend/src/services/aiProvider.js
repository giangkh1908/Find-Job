/**
 * AI Provider - OpenRouter reranking (Claude Sonnet)
 */
import { config } from '../config/index.js';

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function buildPrompt(keyword, jobs) {
  const compact = jobs.map((job, index) => ({
    id: index + 1,
    title: job.title,
    company: job.company,
    salary: job.salary,
    experience: job.experience,
    location: job.location,
  }));

  return {
    keyword,
    jobs: compact,
    instruction:
      'Rank jobs from most relevant to least relevant for the keyword. Return ONLY JSON as {"rankedIds":[...]} with unique ids that exist in input.',
  };
}

async function callOpenRouter({ messages, temperature = 0 }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.aiTimeoutMs);

  try {
    const response = await fetch(`${config.openrouterBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.openrouterApiKey}`,
        'HTTP-Referer': config.openrouterReferer,
        'X-Title': config.openrouterAppName,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.openrouterModel,
        temperature,
        messages,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenRouter error ${response.status}: ${body}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    return typeof content === 'string' ? content : '';
  } finally {
    clearTimeout(timer);
  }
}

function normalizeAgentAction(raw) {
  const action = typeof raw?.action === 'string' ? raw.action.toLowerCase() : '';
  const allowed = new Set(['navigate', 'click_link', 'click_button', 'type_input', 'wait', 'extract_jobs', 'done']);

  if (!allowed.has(action)) {
    return { action: 'extract_jobs' };
  }

  const normalized = { action };
  if (typeof raw?.url === 'string') normalized.url = raw.url;
  if (typeof raw?.text === 'string') normalized.text = raw.text;
  if (Number.isFinite(raw?.index)) normalized.index = Number(raw.index);
  if (Number.isFinite(raw?.ms)) normalized.ms = Number(raw.ms);
  return normalized;
}

export const aiProvider = {
  isEnabled() {
    return Boolean(config.openrouterApiKey);
  },

  async decideBrowserAction({ platform, keyword, observation, history }) {
    if (!this.isEnabled()) {
      return { action: 'extract_jobs' };
    }

    try {
      const content = await callOpenRouter({
        temperature: 0,
        messages: [
          {
            role: 'system',
            content:
              'You control browser tools for job search. Output ONLY strict JSON. Available actions: navigate, click_link, click_button, type_input, wait, extract_jobs, done.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              task: `Find relevant jobs for keyword on ${platform}`,
              keyword,
              observation,
              recentHistory: history.slice(-4),
              outputSchema: {
                action: 'one of navigate|click_link|click_button|type_input|wait|extract_jobs|done',
                index: 'number for click/type actions (0-based)',
                text: 'string for type_input',
                url: 'string for navigate',
                ms: 'number for wait',
                rationale: 'short reason',
              },
            }),
          },
        ],
      });

      const parsed = tryParseJson(content);
      return normalizeAgentAction(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown AI action error';
      console.warn(`OpenRouter action skipped: ${message}`);
      return { action: 'extract_jobs' };
    }
  },

  async rerankJobs({ keyword, jobs }) {
    if (!this.isEnabled() || jobs.length <= 1) {
      return jobs;
    }

    try {
      const content = await callOpenRouter({
        temperature: 0,
        messages: [
          {
            role: 'system',
            content:
              'You are a job matching assistant. Output only strict JSON. Do not include markdown.',
          },
          {
            role: 'user',
            content: JSON.stringify(buildPrompt(keyword, jobs)),
          },
        ],
      });

      if (!content || typeof content !== 'string') {
        return jobs;
      }

      const parsed = tryParseJson(content);
      const rankedIds = Array.isArray(parsed?.rankedIds) ? parsed.rankedIds : [];
      if (!rankedIds.length) {
        return jobs;
      }

      const idToJob = new Map(jobs.map((job, idx) => [idx + 1, job]));
      const output = [];

      for (const id of rankedIds) {
        const normalizedId = Number(id);
        const match = idToJob.get(normalizedId);
        if (match) {
          output.push(match);
          idToJob.delete(normalizedId);
        }
      }

      // Keep leftover jobs to avoid dropping candidates.
      for (const remaining of idToJob.values()) {
        output.push(remaining);
      }

      return output;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown AI error';
      console.warn(`OpenRouter rerank skipped: ${message}`);
      return jobs;
    }
  },

  async expandSearchKeywords(query) {
    if (!this.isEnabled()) {
      return query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
    }

    try {
      const content = await callOpenRouter({
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: 'You are an expert in the Vietnamese job market. Convert a user search query into a list of related URL-friendly keywords (slugs) used in job boards like TopCV. Output ONLY JSON: {"keywords": ["slug1", "slug2", ...]}',
          },
          {
            role: 'user',
            content: `User query: "${query}"`,
          },
        ],
      });

      const parsed = tryParseJson(content);
      if (Array.isArray(parsed?.keywords)) {
        return parsed.keywords;
      }
      return query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
    } catch (err) {
      console.warn('AI keyword expansion failed, using fallback:', err.message);
      return query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
    }
  },
};

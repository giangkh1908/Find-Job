/**
 * AI Prompt Analyzer - Extract keywords & filters from user prompt
 */
import { config } from '../config/index.js';

const SITEMAP_CACHE_KEY = 'topcv_sitemap';
const SITEMAP_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

let sitemapCache = null;
let sitemapCacheTime = 0;

async function callOpenRouterAI(messages, maxTokens = 500) {
  const response = await fetch(`${config.openrouterBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.openrouterApiKey}`,
      'HTTP-Referer': config.openrouterReferer,
      'X-Title': config.openrouterAppName,
    },
    body: JSON.stringify({
      model: config.openrouterModel,
      messages,
      temperature: 0.1,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function analyzePrompt(prompt) {
  const systemPrompt = `Bạn là một chuyên gia phân tích yêu cầu tìm việc.

Nhiệm vụ: Phân tích prompt của người dùng để trích xuất:
1. keywords: Các từ khóa tìm việc (viết tắt, tiếng Anh, tiếng Việt)
2. experienceFilter: Yêu cầu kinh nghiệm (null nếu không có)
3. locationFilter: Địa điểm mong muốn (null nếu không có)

Quy tắc:
- Keywords: bao gồm cả từ gốc và biến thể
  - "nodejs" → ["nodejs", "node.js", "node"]
  - "reactjs" → ["reactjs", "react.js", "react"]
  - "frontend" → ["frontend", "front-end", "front end", "fe"]
- Experience filter:
  - "không yêu cầu kinh nghiệm", "không cần kinh nghiệm" → "Không yêu cầu"
  - "dưới 1 năm", "chưa có kinh nghiệm" → "Dưới 1 năm"
  - "1-3 năm", "1 năm" → "1-3 năm"
  - "3-5 năm" → "3-5 năm"
  - "5+ năm", "trên 5 năm" → "5+ năm"
- Location: Các thành phố Việt Nam (Hồ Chí Minh, Hà Nội, Đà Nẵng, etc.)

Trả lời JSON format:
{
  "keywords": ["keyword1", "keyword2"],
  "experienceFilter": "mức kinh nghiệm hoặc null",
  "locationFilter": "thành phố hoặc null"
}`;

  const userPrompt = `Phân tích yêu cầu sau: "${prompt}"

Chỉ trả lời JSON, không giải thích thêm.`;

  try {
    const result = await callOpenRouterAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    // Parse JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate and sanitize
    return {
      keywords: Array.isArray(analysis.keywords) ? analysis.keywords.filter(Boolean) : [],
      experienceFilter: analysis.experienceFilter || null,
      locationFilter: analysis.locationFilter || null,
    };
  } catch (err) {
    console.error('AI prompt analysis error:', err.message);
    // Fallback: use prompt as single keyword
    return {
      keywords: [prompt.trim()],
      experienceFilter: null,
      locationFilter: null,
    };
  }
}

export async function selectRelevantUrls(candidates, prompt, analysis) {
  if (!candidates.length) return [];

  if (candidates.length <= 3) return candidates;

  const systemPrompt = `Bạn là chuyên gia tuyển dụng IT tại Việt Nam.

Nhiệm vụ: Từ danh sách các danh mục việc làm (URL slugs), chọn ra những danh mục phù hợp nhất với yêu cầu tìm việc của người dùng.

Yêu cầu: "${prompt}"
Keywords: ${analysis.keywords.join(', ')}
Kinh nghiệm: ${analysis.experienceFilter || 'Không yêu cầu'}
Địa điểm: ${analysis.locationFilter || 'Bất kỳ'}

Quy tắc:
- Chỉ chọn danh mục THỰC SỰ liên quan đến yêu cầu
- "IT" nghĩa là IT general/tech, KHÔNG phải substring trong từ khác
- "fullstack developer" → chọn fullstack, nodejs, reactjs, vuejs, backend, frontend... KHÔNG chọn digital-marketing, copywriter
- Ưu tiên danh mục có keyword chính xác trong slug
- Trả về TỐI ĐA 10 slugs phù hợp nhất, sắp xếp theo độ liên quan

Danh sách candidates:
${candidates.map((c, i) => `${i}. ${c.slug}`).join('\n')}

Trả lời JSON format:
{
  "selectedIndices": [0, 3, 7],
  "reason": "giải thích ngắn gọn"
}

Chỉ trả lời JSON, không giải thích thêm.`;

  try {
    const result = await callOpenRouterAI([
      { role: 'system', content: 'Bạn là JSON API. Chỉ trả lời JSON hợp lệ.' },
      { role: 'user', content: systemPrompt },
    ]);

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const indices = parsed.selectedIndices || [];

    return indices
      .filter(i => i >= 0 && i < candidates.length)
      .map(i => candidates[i]);
  } catch (err) {
    console.error('AI URL selection error:', err.message);
    return candidates.slice(0, 5);
  }
}

export async function filterAndRankJobs(jobs, analysis, locationPreference) {
  const systemPrompt = `Bạn là chuyên gia tuyển dụng.

Nhiệm vụ: Đánh giá và sắp xếp jobs theo độ phù hợp với yêu cầu.

Yêu cầu của ứng viên:
- Keywords: [${analysis.keywords.join(', ')}]
- Experience: ${analysis.experienceFilter || 'Không yêu cầu'}
- Location: ${locationPreference || 'Bất kỳ'}

Quy tắc scoring:
- Keyword match trong title: +10 điểm
- Keyword match trong company: +3 điểm  
- Experience match đúng mức: +5 điểm
- Location match: +5 điểm
- Experience phù hợp (ít hơn yêu cầu OK): +2 điểm

Trả lời JSON format:
{
  "scoredJobs": [
    {
      "originalIndex": 0,
      "score": 15,
      "reason": "Khớp keyword nodejs trong title, experience phù hợp"
    }
  ],
  "summary": "Tổng quan kết quả"
}`;

  // Prepare jobs for AI analysis (limit to 50 for cost efficiency)
  const jobsToAnalyze = jobs.slice(0, 50);
  const jobsList = jobsToAnalyze.map((job, i) => 
    `${i}. Title: ${job.title}, Company: ${job.company}, Experience: ${job.experience}, Location: ${job.location}`
  ).join('\n');

  const userPrompt = `Đánh giá các jobs sau:
${jobsList}

Trả lời JSON format. Chỉ trả lời JSON, không giải thích.`;

  try {
    const result = await callOpenRouterAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    // Try multiple JSON extraction strategies
    let analysis = null;
    const jsonPatterns = [
      result.match(/\{[\s\S]*\}/)?.[0],
      result.match(/```json\n?([\s\S]*?)\n?```/)?.[1],
    ].filter(Boolean);

    for (const jsonStr of jsonPatterns) {
      try {
        analysis = JSON.parse(jsonStr);
        break;
      } catch {
        // Try next pattern
      }
    }

    if (!analysis) {
      throw new Error('Failed to parse AI response as JSON');
    }
    
    // Apply scoring
    if (analysis.scoredJobs && Array.isArray(analysis.scoredJobs)) {
      const scoredJobs = analysis.scoredJobs.map(s => ({
        ...jobs[s.originalIndex],
        _score: s.score,
        _reason: s.reason,
      }));

      scoredJobs.sort((a, b) => b._score - a._score);

      return {
        jobs: scoredJobs,
        summary: analysis.summary || '',
      };
    }

    return simpleFilterAndRank(jobs, analysis);
  } catch (err) {
    console.error('AI filter/rank error:', err.message);
    return simpleFilterAndRank(jobs, analysis);
  }
}

function simpleFilterAndRank(jobs, analysis) {
  const keywords = analysis.keywords.map(k => k.toLowerCase());
  const expFilter = analysis.experienceFilter?.toLowerCase() || '';
  
  const expLevels = {
    'không yêu cầu': 0,
    'dưới 1 năm': 1,
    '1-3 năm': 2,
    '3-5 năm': 3,
    '5+ năm': 4,
  };

  const targetExpLevel = expLevels[expFilter] ?? -1;

  const scoredJobs = jobs.map(job => {
    let score = 0;
    let reason = [];
    
    const titleLower = (job.title || '').toLowerCase();
    const companyLower = (job.company || '').toLowerCase();
    const expLower = (job.experience || '').toLowerCase();

    // Keyword matching
    for (const kw of keywords) {
      if (titleLower.includes(kw)) {
        score += 10;
        reason.push(`khớp "${kw}" trong title`);
      }
      if (companyLower.includes(kw)) {
        score += 3;
      }
    }

    // Experience matching
    if (targetExpLevel >= 0) {
      let jobExpLevel = -1;
      
      if (expLower.includes('không') || expLower.includes('khong')) {
        jobExpLevel = 0;
      } else if (expLower.includes('dưới') || expLower.includes('duoi')) {
        jobExpLevel = 1;
      } else {
        const match = expLower.match(/\d+/);
        if (match) {
          const years = parseInt(match[0]);
          if (years <= 0) jobExpLevel = 0;
          else if (years <= 1) jobExpLevel = 1;
          else if (years <= 3) jobExpLevel = 2;
          else if (years <= 5) jobExpLevel = 3;
          else jobExpLevel = 4;
        }
      }

      if (jobExpLevel >= 0) {
        if (jobExpLevel === targetExpLevel || jobExpLevel === targetExpLevel - 1) {
          score += 5;
          reason.push(`experience phù hợp (${job.experience})`);
        } else if (jobExpLevel > targetExpLevel) {
          score -= 5;
          reason.push(`experience cao hơn yêu cầu (${job.experience})`);
        }
      }
    }

    return { 
      ...job, 
      _score: score, 
      _reason: reason.length > 0 ? reason.join(', ') : 'Khớp keyword' 
    };
  });

  scoredJobs.sort((a, b) => b._score - a._score);

  return {
    jobs: scoredJobs,
    summary: `Found ${scoredJobs.length} jobs, scored by keyword & experience matching`,
  };
}

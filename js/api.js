// =========================================================================
// js/api.js - ĐỒNG BỘ SUPABASE CLOUD, LOCAL STORAGE & TÍCH HỢP OPENROUTER AI
// =========================================================================

var cards = [];
var customFolders = JSON.parse(localStorage.getItem('user_card_folders') || '["Mặc định"]');

function getAllFolders() {
  const folderSet = new Set([DEFAULT_FOLDER, ...customFolders]);
  cards.forEach(c => {
    if (c.folder && c.folder.trim()) folderSet.add(c.folder.trim());
  });
  return Array.from(folderSet);
}

function saveCustomFolders() {
  localStorage.setItem('user_card_folders', JSON.stringify(getAllFolders()));
}

function getUserLocalStorageKey() {
  if (!window.currentUser || window.currentUser.role === 'owner') {
    return 'user_chinese_cards';
  }
  return `user_chinese_cards_${window.currentUser.username}`;
}

// =========================================================================
// QUẢN LÝ DỮ LIỆU CỤC BỘ (LOCALSTORAGE)
// =========================================================================
function loadFromLocalStorage() {
  const storageKey = getUserLocalStorageKey();
  const savedCards = localStorage.getItem(storageKey) || localStorage.getItem('user_chinese_cards');
  const baseCards = initialData.map((item, idx) => unpackCardFromStorage({
    id: idx + 1,
    ...item,
    folder: item.folder || DEFAULT_FOLDER,
    status: 'new',
    reviews: 0
  }));

  if (savedCards) {
    try {
      const parsed = JSON.parse(savedCards)
        .filter(r => Number(r.id) > 0 && r.status !== '__user__' && r.status !== '__sys__')
        .map(unpackCardFromStorage);
      const existingHz = new Set(parsed.map(c => c.hz));
      const merged = [...parsed];
      baseCards.forEach(bc => {
        if (!existingHz.has(bc.hz)) {
          merged.push(bc);
        }
      });
      cards = merged;
    } catch {
      cards = baseCards;
    }
  } else {
    cards = baseCards;
    localStorage.setItem(storageKey, JSON.stringify(cards));
  }
  window.cards = cards;

  if (typeof refreshAllFolderSelectors === 'function') refreshAllFolderSelectors();
  if (typeof applyFilter === 'function') applyFilter();
}

function saveToLocalStorage() {
  const storageKey = getUserLocalStorageKey();
  localStorage.setItem(storageKey, JSON.stringify(cards));
  saveCustomFolders();
  if (typeof updateStatsSummary === 'function') updateStatsSummary();
}

// =========================================================================
// ĐỒNG BỘ DỮ LIỆU ĐÁM MÂY (SUPABASE CLOUD)
// =========================================================================
async function loadCardsFromCloud() {
  if (!initSupabase()) return;
  setSyncStatus('syncing', t('Đang đồng bộ...', '同步中...'));

  // Supabase mặc định giới hạn tối đa 1000 dòng mỗi lần select().
  // Sử dụng phân trang .range() để tải trọn vẹn tất cả thẻ mà không bị giới hạn.
  const PAGE_SIZE = 1000;
  let allData = [];
  let from = 0;

  while (true) {
    const { data: pageData, error } = await supabaseClient
      .from('flashcards')
      .select('*')
      .gt('id', 0)
      .order('id', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error("Supabase fetch error:", error);
      setSyncStatus('error', t('Lỗi bảng Cloud', '云端表错误'));
      return;
    }

    if (!pageData || pageData.length === 0) break;
    allData = allData.concat(pageData);

    if (pageData.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  const cardRows = allData.filter(r => Number(r.id) > 0 && r.status !== '__user__' && r.status !== '__sys__');

  if (cardRows.length > 0) {
    const localMap = new Map(cards.map(c => [String(c.id), c]));
    cards = cardRows.map(raw => {
      const unpacked = unpackCardFromStorage(raw);
      const localCard = localMap.get(String(unpacked.id));
      if (localCard && unpacked.folder === DEFAULT_FOLDER && localCard.folder && localCard.folder !== DEFAULT_FOLDER) {
        unpacked.folder = localCard.folder;
      }
      return unpacked;
    });
    window.cards = cards;
    saveToLocalStorage();
    if (typeof refreshAllFolderSelectors === 'function') refreshAllFolderSelectors();
    if (typeof applyFilter === 'function') applyFilter();
    setSyncStatus('connected', `Cloud (${cards.length})`);
  } else {
    await pushAllLocalCardsToCloud(false);
    if (typeof refreshAllFolderSelectors === 'function') refreshAllFolderSelectors();
    if (typeof applyFilter === 'function') applyFilter();
  }
}

async function upsertCardToCloud(card) {
  saveToLocalStorage();
  if (!supabaseClient) return;
  setSyncStatus('syncing', t('Đang lưu...', '保存中...'));
  const { error } = await supabaseClient
    .from('flashcards')
    .upsert(packCardForCloud(card));
  if (error) {
    console.error("Supabase upsert error:", error);
    setSyncStatus('error', t('Lỗi lưu Cloud', '云端保存失败'));
  } else {
    setSyncStatus('connected', `Cloud (${cards.length})`);
  }
}

async function upsertMultipleCardsToCloud(cardList) {
  saveToLocalStorage();
  if (!supabaseClient || cardList.length === 0) return;
  setSyncStatus('syncing', t('Đang tải lên...', '上传中...'));
  const payload = cardList.map(packCardForCloud);
  const CHUNK_SIZE = 500;

  for (let i = 0; i < payload.length; i += CHUNK_SIZE) {
    const chunk = payload.slice(i, i + CHUNK_SIZE);
    const { error } = await supabaseClient.from('flashcards').upsert(chunk);
    if (error) {
      console.error("Supabase bulk upsert error:", error);
      setSyncStatus('error', t('Lỗi lưu Cloud', '云端保存失败'));
      alert(t("Lỗi khi lưu lên Cloud: ", "保存至云端失败: ") + error.message);
      return;
    }
  }
  setSyncStatus('connected', `Cloud (${cards.length})`);
}

async function deleteCardFromCloud(id) {
  saveToLocalStorage();
  if (!supabaseClient) return;
  setSyncStatus('syncing', t('Đang xóa...', '删除中...'));
  const { error } = await supabaseClient.from('flashcards').delete().eq('id', id);
  if (error) {
    console.error("Supabase delete error:", error);
    setSyncStatus('error', t('Lỗi xóa Cloud', '云端删除失败'));
  } else {
    setSyncStatus('connected', `Cloud (${cards.length})`);
  }
}

async function pushAllLocalCardsToCloud(showAlert = true) {
  if (!initSupabase()) {
    if (showAlert) alert(t("Chưa kết nối được Cloud!", "尚未连接到云端！"));
    return;
  }
  await upsertMultipleCardsToCloud(cards);
  if (showAlert) alert(t(`Đã đồng bộ ${cards.length} câu lên Cloud thành công!`, `已成功将 ${cards.length} 个句子同步至云端！`));
}

// =========================================================================
// TÍCH HỢP OPENROUTER AI & TỰ ĐỘNG TẠO PINYIN / DỊCH NGHĨA / NGỮ PHÁP
// =========================================================================
function generateLocalPinyin(hzText) {
  if (!hzText) return "";
  if (window.pinyinPro && typeof window.pinyinPro.pinyin === 'function') {
    const rawPy = window.pinyinPro.pinyin(hzText, { toneType: 'symbol', type: 'string' });
    return rawPy.charAt(0).toUpperCase() + rawPy.slice(1);
  }
  return "";
}

function extractJsonFromText(rawText) {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrMatch) {
      try { return JSON.parse(arrMatch[0]); } catch { }
    }
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try { return JSON.parse(objMatch[0]); } catch { }
    }
  }
  return null;
}

async function callOpenRouterJson(prompt, openRouterKey, preferredModel) {
  const candidateModels = [
    preferredModel,
    'deepseek/deepseek-chat',
    'google/gemini-2.0-flash-001',
    'openai/gpt-4o-mini',
    'qwen/qwen-2.5-72b-instruct',
    'openrouter/auto',
    'openrouter/free'
  ].filter(Boolean);

  const tried = new Set();
  let lastErrorMsg = '';

  for (const modelName of candidateModels) {
    const cleanModel = modelName.trim();
    if (!cleanModel || tried.has(cleanModel)) continue;
    tried.add(cleanModel);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin || 'https://flashcard.netlify.app',
          'X-Title': 'HSK Flashcards'
        },
        body: JSON.stringify({
          model: cleanModel,
          messages: [
            {
              role: 'system',
              content: 'Bạn là giáo viên dạy tiếng Trung HSK cho người Việt. Luôn trả về kết quả đúng định dạng JSON hợp lệ (không kèm văn bản giải thích bên ngoài JSON).'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        lastErrorMsg = errData?.error?.message || `HTTP ${response.status}`;
        if (response.status === 401 || response.status === 402) {
          throw new Error(`OpenRouter (${response.status}): ${lastErrorMsg}`);
        }
        continue;
      }

      const result = await response.json();
      const content = result?.choices?.[0]?.message?.content || '';
      const parsed = extractJsonFromText(content);
      if (parsed !== null) {
        return parsed;
      }
      lastErrorMsg = "Model trả về dữ liệu không đúng cấu trúc JSON";
    } catch (err) {
      if (err.message && /^OpenRouter\s*\(\d+\)/.test(err.message)) {
        throw err;
      }
      lastErrorMsg = err.message || "Lỗi kết nối mạng tới OpenRouter";
    }
  }

  throw new Error(lastErrorMsg || "Không gọi được model AI trên OpenRouter");
}

async function analyzeChineseSentencesWithAI(sentences) {
  const { openRouterKey, openRouterModel } = getConfig();

  if (!openRouterKey) {
    throw new Error(t(
      "Bạn chưa nhập OpenRouter API Key! Hãy bấm vào nút ⚙️ ở trên cùng để dán OpenRouter API Key (sk-or-v1-...) trước khi phân tích bằng AI.",
      "尚未配置 OpenRouter API Key！请点击顶部设置按钮输入密钥。"
    ));
  }

  const prompt = `Hãy phân tích danh sách ${sentences.length} câu tiếng Trung dưới đây cho người Việt học tiếng Trung.
Trả về duy nhất một JSON Array có đúng ${sentences.length} phần tử theo thứ tự tương ứng.
Mỗi phần tử trong JSON Array là một object có 4 trường:
- "hz": Câu chữ Hán gốc
- "py": Phiên âm Pinyin chuẩn có dấu thanh điệu, viết hoa chữ cái đầu câu và danh từ riêng (ví dụ: "Wǒ xǐhuan gēn péngyou yìqǐ liáotiān.")
- "vi": Dịch nghĩa tiếng Việt tự nhiên, chính xác
- "grammar": Phân tích chi tiết từng từ vựng quan trọng và cấu trúc ngữ pháp trong câu theo mẫu: "• Từ_1 (pinyin): nghĩa | Từ_2 (pinyin): nghĩa | Cấu trúc: ..."

Danh sách câu tiếng Trung:
${JSON.stringify(sentences)}`;

  const aiResponse = await callOpenRouterJson(prompt, openRouterKey, openRouterModel);
  const aiList = Array.isArray(aiResponse)
    ? aiResponse
    : (Array.isArray(aiResponse?.sentences) ? aiResponse.sentences : (Array.isArray(aiResponse?.data) ? aiResponse.data : (Array.isArray(aiResponse?.results) ? aiResponse.results : [])));

  if (!Array.isArray(aiList) || aiList.length === 0) {
    throw new Error("Model AI không trả về danh sách phân tích hợp lệ. Vui lòng thử lại!");
  }

  return sentences.map((hz, i) => {
    const item = aiList[i] || {};
    const grammarStr = item.grammar ? String(item.grammar).trim() : "• Từ mới tự bổ sung";
    return {
      hz,
      py: item.py ? String(item.py).trim() : generateLocalPinyin(hz),
      vi: item.vi ? String(item.vi).trim() : "",
      grammar: grammarStr.startsWith('•') ? grammarStr : `• ${grammarStr}`
    };
  });
}

// Phân tích và tách đoạn văn bản tiếng Trung phục vụ tính năng Shadowing (Luyện nghe - Đọc đuổi)
async function analyzeShadowingTextWithAI(rawText, title, requestedHsk = 'auto') {
  if (!rawText || !rawText.trim()) {
    throw new Error(t("Vui lòng nhập đoạn văn bản tiếng Trung!", "请输入中文段落文本！"));
  }

  // Tách thô cục bộ để dự phòng nếu không dùng AI
  const fallbackSentences = rawText
    .split(/([。！？\n]+)/)
    .reduce((acc, cur, idx, arr) => {
      if (idx % 2 === 0 && cur.trim()) {
        const punctuation = arr[idx + 1] || '。';
        acc.push(cur.trim() + (punctuation.trim() || '。'));
      }
      return acc;
    }, [])
    .filter(s => s.length > 1);

  const { openRouterKey, openRouterModel } = getConfig();

  // Nếu có cấu hình OpenRouter AI, gọi AI để phân tích chuẩn xác ngữ điệu và cấp độ HSK
  if (openRouterKey) {
    const prompt = `Bạn là chuyên gia giáo dục tiếng Trung (HSK). Hãy phân tích đoạn văn bản dưới đây để phục vụ bài luyện nghe và nói đuổi (Shadowing) cho người Việt.
Yêu cầu:
1. Tách đoạn văn thành các câu ngắn vừa phải (tối ưu cho người học nghe và nhại theo từng câu).
2. Tự động đánh giá và xác định cấp độ HSK phù hợp nhất cho bài này: một trong các giá trị "HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6". ${requestedHsk !== 'auto' ? `(Người dùng yêu cầu phân loại: ${requestedHsk})` : ''}
3. Trả về DUY NHẤT một JSON Object có cấu trúc:
{
  "title": "${title || 'Bài đọc tiếng Trung'}",
  "hskLevel": "${requestedHsk !== 'auto' ? requestedHsk : 'HSK2'}",
  "sentences": [
    {
      "hz": "Câu chữ Hán gốc có dấu chấm câu",
      "py": "Phiên âm Pinyin chuẩn có dấu thanh điệu (viết hoa đầu câu)",
      "vi": "Dịch nghĩa tiếng Việt tự nhiên, chính xác"
    }
  ]
}

Đoạn văn bản tiếng Trung:
"""
${rawText.trim()}
"""`;

    try {
      const aiRes = await callOpenRouterJson(prompt, openRouterKey, openRouterModel);
      if (aiRes && Array.isArray(aiRes.sentences) && aiRes.sentences.length > 0) {
        return {
          title: aiRes.title || title || 'Bài luyện Shadowing',
          hskLevel: requestedHsk !== 'auto' ? requestedHsk : (aiRes.hskLevel || 'HSK2'),
          sentences: aiRes.sentences.map(s => ({
            hz: String(s.hz || '').trim(),
            py: String(s.py || generateLocalPinyin(s.hz)).trim(),
            vi: String(s.vi || '').trim()
          })).filter(s => s.hz.length > 0)
        };
      }
    } catch (e) {
      console.warn("AI Shadowing parsing error, falling back to local parsing:", e);
    }
  }

  // Fallback xử lý cục bộ bằng pinyinPro
  const cleanSentences = (fallbackSentences.length > 0 ? fallbackSentences : [rawText.trim()]).map(hz => ({
    hz,
    py: generateLocalPinyin(hz),
    vi: ""
  }));

  return {
    title: title || 'Bài đọc tiếng Trung',
    hskLevel: requestedHsk !== 'auto' ? requestedHsk : 'HSK2',
    sentences: cleanSentences
  };
}

// Xuất toàn cục cho toàn bộ các module script
window.cards = cards;
window.customFolders = customFolders;
window.getAllFolders = getAllFolders;
window.saveCustomFolders = saveCustomFolders;
window.getUserLocalStorageKey = getUserLocalStorageKey;
window.loadFromLocalStorage = loadFromLocalStorage;
window.saveToLocalStorage = saveToLocalStorage;
window.loadCardsFromCloud = loadCardsFromCloud;
window.upsertCardToCloud = upsertCardToCloud;
window.upsertMultipleCardsToCloud = upsertMultipleCardsToCloud;
window.deleteCardFromCloud = deleteCardFromCloud;
window.pushAllLocalCardsToCloud = pushAllLocalCardsToCloud;
window.generateLocalPinyin = generateLocalPinyin;
window.extractJsonFromText = extractJsonFromText;
window.callOpenRouterJson = callOpenRouterJson;
window.analyzeChineseSentencesWithAI = analyzeChineseSentencesWithAI;
window.analyzeShadowingTextWithAI = analyzeShadowingTextWithAI;

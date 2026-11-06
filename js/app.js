// =========================================================================
// js/app.js - ĐIỀU KHIỂN FLASHCARD, BỘ THẺ, MODAL, QUIZ ENGINE & KHỞI CHẠY ỨNG DỤNG
// =========================================================================

// =========================================================================
// TRẠNG THÁI GIAO DIỆN HỌC & FLASHCARD
// =========================================================================
var currentIndex = 0;
var isFlipped = false;
var currentFilteredCards = [];
var autoSpeakFront = localStorage.getItem('cfg_auto_speak') !== 'false'; // Mặc định BẬT
var cardDirection = localStorage.getItem('cfg_card_direction') || 'zh_to_vi'; // 'zh_to_vi' | 'vi_to_zh'
var blurPinyin = localStorage.getItem('cfg_blur_pinyin') === 'true'; // Làm mờ Pinyin để thử thách trí nhớ
var selectedQuizFolders = new Set(['all']); // 'all' hoặc danh sách tên các thư mục được chọn

// DOM Elements - Flashcard & Study
var studyFolderSelect = document.getElementById('studyFolderSelect');
var filterSelect = document.getElementById('filterSelect');
var cardContainer = document.getElementById('cardContainer');
var cardInner = document.getElementById('cardInner');
var cardHanzi = document.getElementById('cardHanzi');
var cardPinyin = document.getElementById('cardPinyin');
var cardMeaning = document.getElementById('cardMeaning');
var cardBackPinyin = document.getElementById('cardBackPinyin');
var cardGrammar = document.getElementById('cardGrammar');
var cardFrontSideBadge = document.getElementById('cardFrontSideBadge');
var cardBackSideBadge = document.getElementById('cardBackSideBadge');
var cardFrontHintText = document.getElementById('cardFrontHintText');
var cardFolderBadge = document.getElementById('cardFolderBadge');
var srsNextReviewBadge = document.getElementById('srsNextReviewBadge');
var cardProgressText = document.getElementById('cardProgressText');
var levelBadge = document.getElementById('levelBadge');
var statsSummaryText = document.getElementById('statsSummaryText');
var srsDueCountText = document.getElementById('srsDueCountText');

var btnToggleDirection = document.getElementById('btnToggleDirection');
var directionLabel = document.getElementById('directionLabel');
var btnToggleBlurPinyin = document.getElementById('btnToggleBlurPinyin');
var blurPinyinIcon = document.getElementById('blurPinyinIcon');
var blurPinyinLabel = document.getElementById('blurPinyinLabel');
var btnToggleAutoSpeak = document.getElementById('btnToggleAutoSpeak');
var autoSpeakLabel = document.getElementById('autoSpeakLabel');

// DOM Elements - Folders & Decks
var listFolderSelect = document.getElementById('listFolderSelect');
var inputCardFolderSelect = document.getElementById('inputCardFolderSelect');
var bulkFolderSelect = document.getElementById('bulkFolderSelect');
var quizFolderChips = document.getElementById('quizFolderChips');
var decksOverviewGrid = document.getElementById('decksOverviewGrid');

// DOM Elements - Tabs
var viewFlashcards = document.getElementById('viewFlashcards');
var viewQuiz = document.getElementById('viewQuiz');
var viewList = document.getElementById('viewList');
var viewShadowing = document.getElementById('viewShadowing');
var btnStudyMode = document.getElementById('btnStudyMode');
var btnQuizMode = document.getElementById('btnQuizMode');
var btnListMode = document.getElementById('btnListMode');
var btnShadowingMode = document.getElementById('btnShadowingMode');

// =========================================================================
// CÁC HÀM ĐIỀU KHIỂN GIAO DIỆN THẺ (DIRECTION, PINYIN BLUR, AUTO SPEAK)
// =========================================================================
function updateDirectionButtonUI() {
  const iconEl = btnToggleDirection ? btnToggleDirection.querySelector('i') : null;
  if (cardDirection === 'vi_to_zh') {
    if (btnToggleDirection) btnToggleDirection.className = "text-xs px-3 py-1.5 rounded-full bg-[#34C759]/12 text-[#1D8338] border border-[#34C759]/25 font-semibold apple-btn flex items-center gap-1";
    if (iconEl) iconEl.className = "fa-solid fa-arrow-left-long text-xs";
    if (directionLabel) directionLabel.textContent = t("Chiều: Việt ➔ Trung", "方向: 越 ➔ 中");
  } else {
    if (btnToggleDirection) btnToggleDirection.className = "text-xs px-3 py-1.5 rounded-full bg-black/[0.04] text-[#1D1D1F] border border-black/[0.06] font-semibold apple-btn flex items-center gap-1";
    if (iconEl) iconEl.className = "fa-solid fa-arrow-right-long text-xs";
    if (directionLabel) directionLabel.textContent = t("Chiều: Trung ➔ Việt", "方向: 中 ➔ 越");
  }
}

function applyPinyinBlurStyle() {
  if (blurPinyin) {
    btnToggleBlurPinyin.className = "text-xs px-3 py-1.5 rounded-full bg-[#5856D6]/12 text-[#5856D6] border border-[#5856D6]/25 font-semibold apple-btn flex items-center gap-1";
    blurPinyinIcon.className = "fa-solid fa-eye-slash";
    blurPinyinLabel.textContent = t("Pinyin: Mờ", "拼音: 模糊");
    cardPinyin.classList.add('blur-sm', 'opacity-50', 'hover:blur-none', 'hover:opacity-100');
    cardBackPinyin.classList.add('blur-sm', 'opacity-50', 'hover:blur-none', 'hover:opacity-100');
  } else {
    btnToggleBlurPinyin.className = "text-xs px-3 py-1.5 rounded-full bg-black/[0.04] text-[#1D1D1F] border border-black/[0.06] font-semibold apple-btn flex items-center gap-1";
    blurPinyinIcon.className = "fa-solid fa-eye";
    blurPinyinLabel.textContent = t("Pinyin: Rõ", "拼音: 清晰");
    cardPinyin.classList.remove('blur-sm', 'opacity-50', 'hover:blur-none', 'hover:opacity-100');
    cardBackPinyin.classList.remove('blur-sm', 'opacity-50', 'hover:blur-none', 'hover:opacity-100');
  }
}

function updateAutoSpeakButtonUI() {
  if (autoSpeakFront) {
    btnToggleAutoSpeak.className = "text-xs px-3 py-1.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20 font-semibold apple-btn flex items-center gap-1";
    autoSpeakLabel.textContent = t("Tự đọc: BẬT", "自动朗读: 开");
  } else {
    btnToggleAutoSpeak.className = "text-xs px-3 py-1.5 rounded-full bg-black/[0.04] text-[#86868B] border border-black/[0.06] font-medium apple-btn flex items-center gap-1";
    autoSpeakLabel.textContent = t("Tự đọc: TẮT", "自动朗读: 关");
  }
}

btnToggleDirection.addEventListener('click', () => {
  cardDirection = cardDirection === 'zh_to_vi' ? 'vi_to_zh' : 'zh_to_vi';
  localStorage.setItem('cfg_card_direction', cardDirection);
  updateDirectionButtonUI();
  updateCardUI(true);
});

btnToggleBlurPinyin.addEventListener('click', () => {
  blurPinyin = !blurPinyin;
  localStorage.setItem('cfg_blur_pinyin', String(blurPinyin));
  applyPinyinBlurStyle();
});

btnToggleAutoSpeak.addEventListener('click', () => {
  autoSpeakFront = !autoSpeakFront;
  localStorage.setItem('cfg_auto_speak', String(autoSpeakFront));
  updateAutoSpeakButtonUI();
  const isChineseVisibleNow = (cardDirection === 'zh_to_vi' && !isFlipped) || (cardDirection === 'vi_to_zh' && isFlipped);
  if (autoSpeakFront && isChineseVisibleNow && currentFilteredCards[currentIndex]) {
    speakChinese(currentFilteredCards[currentIndex].hz, 0.85);
  }
});

function updateStatsSummary() {
  const folderVal = studyFolderSelect.value || 'all';
  const scopedCards = folderVal === 'all'
    ? cards
    : cards.filter(c => (c.folder || DEFAULT_FOLDER) === folderVal);

  const masteredCount = scopedCards.filter(c => c.status === 'mastered').length;
  const dueCount = scopedCards.filter(isCardDueForSRS).length;
  const totalDueAllFolders = cards.filter(isCardDueForSRS).length;

  if (statsSummaryText) {
    statsSummaryText.textContent = uiLang === 'zh'
      ? `(已掌握: ${masteredCount} | 待复习: ${dueCount} | 总计: ${scopedCards.length})`
      : `(Đã thuộc: ${masteredCount} | Cần ôn SRS: ${dueCount} | Tổng: ${scopedCards.length})`;
  }
  if (srsDueCountText) {
    srsDueCountText.textContent = t(`${totalDueAllFolders} câu`, `${totalDueAllFolders} 句`);
  }
}

function applyFilter(shouldAutoSpeak = true) {
  const folderVal = studyFolderSelect.value || 'all';
  const statusVal = filterSelect.value || 'all';

  let list = folderVal === 'all'
    ? [...cards]
    : cards.filter(c => (c.folder || DEFAULT_FOLDER) === folderVal);

  if (statusVal === 'srs_due') {
    list = list.filter(isCardDueForSRS).sort((a, b) => getSrsPriorityScore(b) - getSrsPriorityScore(a));
  } else if (statusVal === 'hard') {
    list = list.filter(c => c.status === 'hard' || (c.wrongCount || 0) > 0);
  } else if (statusVal === 'learning') {
    list = list.filter(c => c.status === 'learning');
  } else if (statusVal === 'mastered') {
    list = list.filter(c => c.status === 'mastered');
  } else if (statusVal === 'new') {
    list = list.filter(c => !c.status || c.status === 'new');
  }

  currentFilteredCards = list;
  if (currentIndex >= currentFilteredCards.length) currentIndex = 0;
  updateStatsSummary();
  updateCardUI(shouldAutoSpeak);
}

function updateCardUI(shouldAutoSpeak = true) {
  if (currentFilteredCards.length === 0) {
    cardHanzi.textContent = t("Chưa có thẻ nào ở mục này", "此分类暂无卡片");
    cardPinyin.textContent = "";
    cardMeaning.textContent = t("Hãy thêm câu mới hoặc đổi bộ lọc / bộ thẻ", "请添加新句子或切换筛选条件/牌组");
    cardBackPinyin.textContent = "";
    cardBackPinyin.classList.add('hidden');
    cardGrammar.innerHTML = "";
    cardProgressText.textContent = "0 / 0";
    cardFolderBadge.innerHTML = `<i class="fa-solid fa-folder text-[#FF9500] mr-1"></i>${t("Trống", "空")}`;
    srsNextReviewBadge.textContent = "";
    return;
  }

  if (currentIndex >= currentFilteredCards.length) currentIndex = 0;
  if (currentIndex < 0) currentIndex = currentFilteredCards.length - 1;

  const card = currentFilteredCards[currentIndex];
  const grammarHtml = card.grammar ? card.grammar.replace(/\n/g, '<br>') : t("Chưa có ghi chú.", "暂无备注。");

  if (cardDirection === 'vi_to_zh') {
    // Mặt Trước: Tiếng Việt | Mặt Sau: Chữ Hán + Pinyin + Ngữ pháp
    cardFrontSideBadge.textContent = t("Mặt Trước (Tiếng Việt)", "正面 (越南语)");
    cardFrontSideBadge.className = "text-[11px] font-semibold uppercase tracking-wider text-[#1D8338] bg-[#34C759]/12 px-3 py-1 rounded-full";
    cardHanzi.textContent = card.vi;
    cardHanzi.className = "text-xl sm:text-2xl font-bold text-[#1D1D1F] leading-snug";
    cardPinyin.textContent = "";
    cardPinyin.classList.add('hidden');
    cardFrontHintText.innerHTML = `<i class="fa-solid fa-hand-pointer mr-1 text-[#0071E3]"></i> ${t("Bấm để lật xem Chữ Hán, Pinyin & Ngữ pháp", "点击翻转查看汉字、拼音与语法")}`;

    cardBackSideBadge.textContent = t("Mặt Sau (Tiếng Trung & Pinyin)", "背面 (中文与拼音)");
    cardMeaning.textContent = card.hz;
    cardMeaning.className = "text-2xl sm:text-3xl font-bold text-[#30D158] tracking-wide";
    cardBackPinyin.textContent = card.py || "";
    cardBackPinyin.classList.remove('hidden');
    cardGrammar.innerHTML = grammarHtml;
  } else {
    // Mặc định: Mặt Trước: Tiếng Trung + Pinyin | Mặt Sau: Tiếng Việt + Ngữ pháp
    cardFrontSideBadge.textContent = t("Mặt Trước (Tiếng Trung)", "正面 (中文)");
    cardFrontSideBadge.className = "text-[11px] font-semibold uppercase tracking-wider text-[#0071E3] bg-[#0071E3]/10 px-3 py-1 rounded-full";
    cardHanzi.textContent = card.hz;
    cardHanzi.className = "text-2xl sm:text-4xl font-bold text-[#1D1D1F] leading-snug tracking-tight";
    cardPinyin.textContent = card.py || "";
    cardPinyin.classList.remove('hidden');
    cardFrontHintText.innerHTML = `<i class="fa-solid fa-hand-pointer mr-1 text-[#0071E3]"></i> ${t("Bấm để lật xem nghĩa & cấu trúc ngữ pháp", "点击翻转查看释义与语法结构")}`;

    cardBackSideBadge.textContent = t("Mặt Sau (Nghĩa & Giải thích)", "背面 (释义与解析)");
    cardMeaning.textContent = card.vi;
    cardMeaning.className = "text-xl sm:text-2xl font-bold text-[#30D158]";
    cardBackPinyin.textContent = "";
    cardBackPinyin.classList.add('hidden');
    cardGrammar.innerHTML = grammarHtml;
  }

  applyPinyinBlurStyle();

  cardFolderBadge.innerHTML = `<i class="fa-solid fa-folder text-[#FF9500] mr-1"></i>${card.folder || DEFAULT_FOLDER}`;
  srsNextReviewBadge.textContent = formatNextReviewText(card);

  cardProgressText.textContent = `${currentIndex + 1} / ${currentFilteredCards.length}`;
  const mobileProgressIndicator = document.getElementById('mobileProgressIndicator');
  if (mobileProgressIndicator) {
    mobileProgressIndicator.textContent = `${currentIndex + 1} / ${currentFilteredCards.length}`;
  }

  if (card.status === 'mastered') {
    levelBadge.textContent = t("Đã thuộc", "已掌握");
    levelBadge.className = "text-xs px-2.5 py-1 rounded-full font-semibold bg-[#34C759]/12 text-[#1D8338]";
  } else if (card.status === 'hard') {
    levelBadge.textContent = t("Chưa nhớ", "未记住");
    levelBadge.className = "text-xs px-2.5 py-1 rounded-full font-semibold bg-[#FF3B30]/12 text-[#FF3B30]";
  } else if (card.status === 'learning') {
    levelBadge.textContent = t("Đang ôn", "学习中");
    levelBadge.className = "text-xs px-2.5 py-1 rounded-full font-semibold bg-[#FF9500]/15 text-[#C93400]";
  } else {
    levelBadge.textContent = t("Mới học", "新卡片");
    levelBadge.className = "text-xs px-2.5 py-1 rounded-full font-semibold bg-black/[0.05] text-[#1D1D1F]";
  }

  const prevIv = card.intervalDays || 0;
  const nextGoodIv = prevIv < 1 ? 1 : Math.min(30, Math.round(prevIv * 2));
  const nextEasyIv = prevIv < 3 ? 3 : Math.min(90, Math.round(prevIv * 2.2));
  document.getElementById('btnGoodSubtext').textContent = t(`Ôn sau ${nextGoodIv} ngày`, `${nextGoodIv} 天后复习`);
  document.getElementById('btnEasySubtext').textContent = t(`Ôn sau ${nextEasyIv} ngày`, `${nextEasyIv} 天后复习`);

  if (isFlipped) {
    cardInner.classList.remove('rotate-y-180');
    isFlipped = false;
  }

  const isStudyTabVisible = !document.getElementById('viewFlashcards').classList.contains('hidden');
  if (shouldAutoSpeak && autoSpeakFront && cardDirection === 'zh_to_vi' && !isFlipped && isStudyTabVisible) {
    speakChinese(card.hz, 0.85);
  }
}

cardContainer.addEventListener('click', () => {
  isFlipped = !isFlipped;
  cardInner.classList.toggle('rotate-y-180', isFlipped);
  if (!currentFilteredCards[currentIndex]) return;

  const isNowOnChineseSide = (cardDirection === 'zh_to_vi' && !isFlipped) || (cardDirection === 'vi_to_zh' && isFlipped);
  if (autoSpeakFront && isNowOnChineseSide) {
    speakChinese(currentFilteredCards[currentIndex].hz, 0.85);
  }
});

document.getElementById('btnNext').addEventListener('click', (e) => {
  e.stopPropagation();
  if (!currentFilteredCards.length) return;
  currentIndex = (currentIndex + 1) % currentFilteredCards.length;
  updateCardUI(true);
});

document.getElementById('btnPrev').addEventListener('click', (e) => {
  e.stopPropagation();
  if (!currentFilteredCards.length) return;
  currentIndex = (currentIndex - 1 + currentFilteredCards.length) % currentFilteredCards.length;
  updateCardUI(true);
});

async function markCurrentCardSRS(rating) {
  const card = currentFilteredCards[currentIndex];
  if (!card) return;
  applySrsReviewResult(card, rating);
  await upsertCardToCloud(card);
  currentIndex = (currentIndex + 1) % Math.max(1, currentFilteredCards.length);
  applyFilter(true);
}

document.getElementById('btnHard').addEventListener('click', () => markCurrentCardSRS('hard'));
document.getElementById('btnGood').addEventListener('click', () => markCurrentCardSRS('good'));
document.getElementById('btnEasy').addEventListener('click', () => markCurrentCardSRS('easy'));

document.getElementById('btnSpeak').addEventListener('click', () => {
  const card = currentFilteredCards[currentIndex];
  if (!card) return;
  speakChinese(card.hz, 0.85);
});

document.getElementById('btnReloadCloud').addEventListener('click', () => {
  loadCardsFromCloud();
});

studyFolderSelect.addEventListener('change', () => {
  currentIndex = 0;
  applyFilter(true);
});

filterSelect.addEventListener('change', () => {
  currentIndex = 0;
  applyFilter(true);
});

// Nút hành động trên banner SRS
document.getElementById('btnStudySrsNow').addEventListener('click', () => {
  const dueCount = cards.filter(isCardDueForSRS).length;
  if (dueCount === 0) {
    alert(t("Tuyệt vời! Hiện tại bạn chưa có câu nào quá hạn hoặc cần ôn gấp. Hệ thống sẽ hiển thị tất cả các câu.", "太棒了！目前没有到期或急需复习的句子，将显示全部卡片。"));
    filterSelect.value = 'all';
  } else {
    studyFolderSelect.value = 'all';
    filterSelect.value = 'srs_due';
  }
  currentIndex = 0;
  applyFilter(true);
});

document.getElementById('btnQuizSrsNow').addEventListener('click', () => {
  document.getElementById('quizSourceFilter').value = 'srs_priority';
  switchTab(btnQuizMode, viewQuiz);
  initDailyQuiz();
});

// =========================================================================
// CHUYỂN ĐỔI TAB (APPLE SEGMENTED CONTROL)
// =========================================================================
function switchTab(activeBtn, activeView) {
  const allNavBtns = [btnStudyMode, btnQuizMode, btnListMode, btnShadowingMode].filter(Boolean);
  const allViews = [viewFlashcards, viewQuiz, viewList, viewShadowing].filter(Boolean);

  allNavBtns.forEach(b => {
    b.className = "flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] font-semibold text-xs sm:text-sm apple-btn whitespace-nowrap";
  });
  if (activeBtn) {
    activeBtn.className = "flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 rounded-full bg-white text-[#1D1D1F] font-semibold text-xs sm:text-sm shadow-sm apple-btn whitespace-nowrap";
  }

  allViews.forEach(v => v.classList.add('hidden'));
  if (activeView) activeView.classList.remove('hidden');
}

btnStudyMode.addEventListener('click', () => {
  switchTab(btnStudyMode, viewFlashcards);
  updateCardUI(true);
});
btnQuizMode.addEventListener('click', () => {
  switchTab(btnQuizMode, viewQuiz);
  refreshAllFolderSelectors();
  initDailyQuiz();
});
btnListMode.addEventListener('click', () => {
  switchTab(btnListMode, viewList);
  refreshAllFolderSelectors();
  renderList();
});
if (btnShadowingMode) {
  btnShadowingMode.addEventListener('click', () => {
    switchTab(btnShadowingMode, viewShadowing);
    initShadowingModule();
  });
}

// =========================================================================
// QUẢN LÝ BỘ THẺ (THƯ MỤC) & DROPDOWN SELECTORS
// =========================================================================
function createNewFolderInteractive(targetSelectEl) {
  const name = prompt("Nhập tên thư mục bộ thẻ mới (Ví dụ: HSK 1, Giao tiếp, Chủ đề Du lịch...):");
  if (!name || !name.trim()) return null;
  const cleanName = name.trim();
  if (!customFolders.includes(cleanName)) {
    customFolders.push(cleanName);
    saveCustomFolders();
  }
  refreshAllFolderSelectors();
  if (targetSelectEl) {
    targetSelectEl.value = cleanName;
  }
  return cleanName;
}

async function renameFolderDeckInteractive(oldFolderName) {
  if (currentUser && currentUser.role !== 'owner') {
    alert(t("Chỉ tài khoản Chủ sở hữu (Owner) mới có quyền đổi tên bộ thẻ chung!", "仅所有者 (Owner) 账户有权修改公共牌组名称！"));
    return;
  }
  const targetOld = (oldFolderName && oldFolderName !== 'all') ? oldFolderName : '';
  if (!targetOld) {
    alert(t("Vui lòng chọn một bộ thẻ cụ thể để đổi tên (hoặc bấm vào tab 'Bộ thẻ' để sửa từng bộ thẻ)!", "请先选择一个具体牌组进行重命名（或前往“牌组”标签页管理）！"));
    return;
  }
  const newNameRaw = prompt(
    t(`Nhập tên mới cho bộ thẻ "${targetOld}":`, `请输入牌组 "${targetOld}" 的新名称:`),
    targetOld
  );
  if (!newNameRaw || !newNameRaw.trim()) return;
  const newName = newNameRaw.trim();
  if (newName === targetOld) return;

  customFolders = customFolders.map(f => f === targetOld ? newName : f);
  if (!customFolders.includes(newName)) customFolders.push(newName);

  const affectedCards = [];
  cards.forEach(c => {
    if ((c.folder || DEFAULT_FOLDER) === targetOld) {
      c.folder = newName;
      affectedCards.push(c);
    }
  });

  if (studyFolderSelect.value === targetOld) studyFolderSelect.value = newName;
  if (listFolderSelect.value === targetOld) listFolderSelect.value = newName;

  saveToLocalStorage();
  refreshAllFolderSelectors();
  applyFilter(false);
  renderList();

  if (affectedCards.length > 0) {
    await upsertMultipleCardsToCloud(affectedCards);
  }
}

async function deleteFolderDeckInteractive(folderName) {
  if (currentUser && currentUser.role !== 'owner') {
    alert(t("Chỉ tài khoản Chủ sở hữu (Owner) mới có quyền xóa bộ thẻ!", "仅所有者 (Owner) 账户有权删除牌组！"));
    return;
  }
  if (!folderName || folderName === DEFAULT_FOLDER) {
    alert(t(`Không thể xóa bộ thẻ "${DEFAULT_FOLDER}"! Bạn có thể đổi tên hoặc sửa từng thẻ bên trong.`, `无法删除默认牌组 "${DEFAULT_FOLDER}"！您可以重命名或编辑其中的卡片。`));
    return;
  }
  const cardsInDeck = cards.filter(c => (c.folder || DEFAULT_FOLDER) === folderName);
  const confirmMove = confirm(t(
    `Bạn muốn xóa bộ thẻ "${folderName}" (${cardsInDeck.length} câu)?\n\nCác câu trong bộ thẻ này sẽ được chuyển về bộ thẻ "${DEFAULT_FOLDER}" để không bị mất dữ liệu học.`,
    `确定要删除牌组 "${folderName}"（共 ${cardsInDeck.length} 句）吗？\n\n该牌组内的句子将自动移至 "${DEFAULT_FOLDER}"，以免丢失学习数据。`
  ));
  if (!confirmMove) return;

  customFolders = customFolders.filter(f => f !== folderName);
  cardsInDeck.forEach(c => { c.folder = DEFAULT_FOLDER; });

  if (studyFolderSelect.value === folderName) studyFolderSelect.value = 'all';
  if (listFolderSelect.value === folderName) listFolderSelect.value = 'all';

  saveToLocalStorage();
  refreshAllFolderSelectors();
  applyFilter(false);
  renderList();

  if (cardsInDeck.length > 0) {
    await upsertMultipleCardsToCloud(cardsInDeck);
  }
}

function renderDecksOverview() {
  if (!decksOverviewGrid) return;
  const folders = getAllFolders();
  const activeListFolder = listFolderSelect.value || 'all';

  decksOverviewGrid.innerHTML = folders.map(f => {
    const deckCards = cards.filter(c => (c.folder || DEFAULT_FOLDER) === f);
    const total = deckCards.length;
    const mastered = deckCards.filter(c => c.status === 'mastered').length;
    const due = deckCards.filter(isCardDueForSRS).length;
    const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
    const isSelected = activeListFolder === f;

    return `
      <div class="p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2.5 ${isSelected ? 'bg-[#0071E3]/[0.06] border-[#0071E3] shadow-sm' : 'bg-[#F5F5F7]/80 hover:bg-white border-black/[0.06]'}"
           data-deck-card="${f}">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-8 h-8 rounded-xl ${isSelected ? 'bg-[#0071E3] text-white' : 'bg-white text-[#FF9500]'} shadow-sm flex items-center justify-center text-xs shrink-0">
              <i class="fa-solid fa-folder"></i>
            </span>
            <div class="min-w-0">
              <div class="font-bold text-sm text-[#1D1D1F] truncate" title="${f}">${f}</div>
              <div class="text-[11px] text-[#86868B]">${total} ${t('câu', '句')} • ${t('Đã thuộc', '已掌握')} ${pct}%${due > 0 ? ` • <span class="text-[#FF3B30] font-semibold">SRS ${due}</span>` : ''}</div>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button type="button" data-deck-action="add-card" data-deck-name="${f}"
              class="w-7 h-7 rounded-full bg-white hover:bg-[#0071E3] text-[#0071E3] hover:text-white border border-black/[0.06] flex items-center justify-center text-[11px] transition"
              title="${t('Thêm câu mới vào bộ thẻ này', '向此牌组添加新句')}">
              <i class="fa-solid fa-plus"></i>
            </button>
            <button type="button" data-deck-action="rename" data-deck-name="${f}"
              class="w-7 h-7 rounded-full bg-white hover:bg-[#0071E3] text-[#1D1D1F] hover:text-white border border-black/[0.06] flex items-center justify-center text-[11px] transition"
              title="${t('Đổi tên bộ thẻ', '重命名牌组')}">
              <i class="fa-solid fa-pen"></i>
            </button>
            ${f !== DEFAULT_FOLDER ? `
            <button type="button" data-deck-action="delete" data-deck-name="${f}"
              class="w-7 h-7 rounded-full bg-white hover:bg-[#FF3B30] text-[#86868B] hover:text-white border border-black/[0.06] flex items-center justify-center text-[11px] transition"
              title="${t('Xóa / Gộp bộ thẻ', '删除/合并牌组')}">
              <i class="fa-solid fa-trash-can"></i>
            </button>
            ` : ''}
          </div>
        </div>
        <div class="w-full h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
          <div class="h-full bg-[#34C759] rounded-full transition-all duration-300" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function refreshAllFolderSelectors() {
  const folders = getAllFolders();
  const folderCounts = {};
  folders.forEach(f => { folderCounts[f] = 0; });
  cards.forEach(c => {
    const f = c.folder || DEFAULT_FOLDER;
    folderCounts[f] = (folderCounts[f] || 0) + 1;
  });

  const prevStudyVal = studyFolderSelect.value || 'all';
  const prevListVal = listFolderSelect.value || 'all';
  const prevSingleVal = inputCardFolderSelect.value || DEFAULT_FOLDER;
  const prevBulkVal = bulkFolderSelect.value || DEFAULT_FOLDER;

  const allFolderLabel = t(`📁 Tất cả bộ thẻ (${cards.length})`, `📁 全部牌组 (${cards.length})`);
  const filterOptionsHtml = `<option value="all">${allFolderLabel}</option>` +
    folders.map(f => `<option value="${f}">📁 ${f} (${folderCounts[f] || 0})</option>`).join('');
  studyFolderSelect.innerHTML = filterOptionsHtml;
  listFolderSelect.innerHTML = filterOptionsHtml;

  if (folders.includes(prevStudyVal) || prevStudyVal === 'all') studyFolderSelect.value = prevStudyVal;
  if (folders.includes(prevListVal) || prevListVal === 'all') listFolderSelect.value = prevListVal;

  const unitLabel = t('câu', '句');
  const assignOptionsHtml = folders.map(f => `<option value="${f}">📁 ${f} (${folderCounts[f] || 0} ${unitLabel})</option>`).join('');
  inputCardFolderSelect.innerHTML = assignOptionsHtml;
  bulkFolderSelect.innerHTML = assignOptionsHtml;

  if (folders.includes(prevSingleVal)) inputCardFolderSelect.value = prevSingleVal;
  if (folders.includes(prevBulkVal)) bulkFolderSelect.value = prevBulkVal;

  renderQuizFolderChips(folders, folderCounts);
  renderDecksOverview();
}

function renderQuizFolderChips(folders, folderCounts) {
  if (!quizFolderChips) return;
  const isAll = selectedQuizFolders.has('all') || selectedQuizFolders.size === 0;
  let html = `
    <button type="button" data-qfolder="all" class="qfolder-chip px-3 py-1 rounded-full text-xs font-semibold border transition ${isAll ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-sm' : 'bg-white text-[#1D1D1F] border-black/[0.08] hover:bg-black/[0.04]'}">
      ${t(`Tất cả (${cards.length})`, `全部 (${cards.length})`)}
    </button>
  `;
  folders.forEach(f => {
    const active = !isAll && selectedQuizFolders.has(f);
    html += `
      <button type="button" data-qfolder="${f}" class="qfolder-chip px-3 py-1 rounded-full text-xs font-semibold border transition ${active ? 'bg-[#FF9500] text-white border-[#FF9500] shadow-sm' : 'bg-white text-[#1D1D1F] border-black/[0.08] hover:bg-black/[0.04]'}">
        📁 ${f} (${folderCounts[f] || 0})
      </button>
    `;
  });
  quizFolderChips.innerHTML = html;

  quizFolderChips.querySelectorAll('.qfolder-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const folderName = btn.getAttribute('data-qfolder');
      if (folderName === 'all') {
        selectedQuizFolders = new Set(['all']);
      } else {
        selectedQuizFolders.delete('all');
        if (selectedQuizFolders.has(folderName)) {
          selectedQuizFolders.delete(folderName);
          if (selectedQuizFolders.size === 0) selectedQuizFolders.add('all');
        } else {
          selectedQuizFolders.add(folderName);
        }
      }
      refreshAllFolderSelectors();
      initDailyQuiz();
    });
  });
}

document.getElementById('btnQuizSelectAllFolders').addEventListener('click', () => {
  selectedQuizFolders = new Set(['all']);
  refreshAllFolderSelectors();
  initDailyQuiz();
});

document.getElementById('btnNewFolderQuick').addEventListener('click', () => {
  const created = createNewFolderInteractive(studyFolderSelect);
  if (created) {
    currentIndex = 0;
    applyFilter();
  }
});

document.getElementById('btnEditFolderQuick').addEventListener('click', () => {
  const curFolder = studyFolderSelect.value;
  if (curFolder && curFolder !== 'all') {
    renameFolderDeckInteractive(curFolder);
  } else {
    switchTab(btnListMode, viewList);
    refreshAllFolderSelectors();
    renderList();
  }
});

document.getElementById('btnCreateDeckInList').addEventListener('click', () => {
  const created = createNewFolderInteractive(listFolderSelect);
  if (created) {
    renderList();
  }
});

decksOverviewGrid.addEventListener('click', (e) => {
  const actionBtn = e.target.closest('[data-deck-action]');
  if (actionBtn) {
    e.stopPropagation();
    const action = actionBtn.getAttribute('data-deck-action');
    const deckName = actionBtn.getAttribute('data-deck-name');
    if (action === 'rename') {
      renameFolderDeckInteractive(deckName);
    } else if (action === 'delete') {
      deleteFolderDeckInteractive(deckName);
    } else if (action === 'add-card') {
      openAddCardModal(deckName);
    }
    return;
  }
  const deckCard = e.target.closest('[data-deck-card]');
  if (deckCard) {
    const deckName = deckCard.getAttribute('data-deck-card');
    listFolderSelect.value = (listFolderSelect.value === deckName) ? 'all' : deckName;
    renderDecksOverview();
    renderList();
  }
});

document.getElementById('btnCreateFolderInSingle').addEventListener('click', () => {
  createNewFolderInteractive(inputCardFolderSelect);
});

document.getElementById('btnCreateFolderInBulk').addEventListener('click', () => {
  createNewFolderInteractive(bulkFolderSelect);
});

// =========================================================================
// MODAL 1: THÊM MỚI HOẶC CHỈNH SỬA THẺ
// =========================================================================
var modalAddCard = document.getElementById('modalAddCard');
var modalCardHeaderIcon = document.getElementById('modalCardHeaderIcon');
var inputHz = document.getElementById('inputHz');
var inputPy = document.getElementById('inputPy');
var inputVi = document.getElementById('inputVi');
var inputGrammar = document.getElementById('inputGrammar');
var btnAutoFillSingle = document.getElementById('btnAutoFillSingle');
var editingCardId = null;

function openAddCardModal(preferredFolder) {
  editingCardId = null;
  refreshAllFolderSelectors();
  if (preferredFolder && preferredFolder !== 'all') {
    inputCardFolderSelect.value = preferredFolder;
  } else if (studyFolderSelect.value && studyFolderSelect.value !== 'all') {
    inputCardFolderSelect.value = studyFolderSelect.value;
  }
  if (modalCardHeaderIcon) modalCardHeaderIcon.className = "fa-solid fa-plus-circle text-[#0071E3]";
  document.getElementById('i18nModalAddTitle').textContent = t('Thêm câu học mới', '添加新句子');
  document.getElementById('btnSaveCard').textContent = t('Lưu thẻ mới', '保存新卡');
  inputHz.value = '';
  inputPy.value = '';
  inputVi.value = '';
  inputGrammar.value = '';
  modalAddCard.classList.remove('hidden');
  inputHz.focus();
}

function openEditCardModal(cardId) {
  const card = cards.find(c => Number(c.id) === Number(cardId));
  if (!card) return;
  editingCardId = card.id;
  refreshAllFolderSelectors();
  inputCardFolderSelect.value = card.folder || DEFAULT_FOLDER;
  inputHz.value = card.hz || '';
  inputPy.value = card.py || '';
  inputVi.value = card.vi || '';
  inputGrammar.value = card.grammar || '';
  if (modalCardHeaderIcon) modalCardHeaderIcon.className = "fa-solid fa-pen-to-square text-[#0071E3]";
  document.getElementById('i18nModalAddTitle').textContent = t('Chỉnh sửa thẻ câu', '编辑句子卡片');
  document.getElementById('btnSaveCard').textContent = t('Lưu thay đổi', '保存修改');
  modalAddCard.classList.remove('hidden');
  inputHz.focus();
}

document.getElementById('btnOpenAddModal').addEventListener('click', () => {
  openAddCardModal();
});

document.getElementById('btnEditCurrentCard').addEventListener('click', () => {
  const cur = currentFilteredCards[currentIndex];
  if (!cur) {
    alert(t("Hiện không có thẻ nào để chỉnh sửa!", "当前没有可编辑的卡片！"));
    return;
  }
  openEditCardModal(cur.id);
});

function closeModal() {
  modalAddCard.classList.add('hidden');
  editingCardId = null;
  inputHz.value = '';
  inputPy.value = '';
  inputVi.value = '';
  inputGrammar.value = '';
}

document.getElementById('btnCloseModal').addEventListener('click', closeModal);
document.getElementById('btnCancelAdd').addEventListener('click', closeModal);

inputHz.addEventListener('input', () => {
  const hz = inputHz.value.trim();
  inputPy.value = hz ? generateLocalPinyin(hz) : '';
});

btnAutoFillSingle.addEventListener('click', async () => {
  const hz = inputHz.value.trim();
  if (!hz) {
    alert(t("Vui lòng nhập câu chữ Hán trước!", "请先输入汉字句子！"));
    inputHz.focus();
    return;
  }
  const origHtml = btnAutoFillSingle.innerHTML;
  btnAutoFillSingle.disabled = true;
  btnAutoFillSingle.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${t('Đang phân tích...', 'AI解析中...')}`;
  try {
    const [analyzed] = await analyzeChineseSentencesWithAI([hz]);
    if (analyzed) {
      inputPy.value = analyzed.py || generateLocalPinyin(hz);
      inputVi.value = analyzed.vi || '';
      inputGrammar.value = analyzed.grammar || '';
    }
  } catch (err) {
    alert(t("Lỗi khi phân tích câu: ", "解析句子出错: ") + err.message);
  } finally {
    btnAutoFillSingle.disabled = false;
    btnAutoFillSingle.innerHTML = origHtml;
  }
});

document.getElementById('btnSaveCard').addEventListener('click', async () => {
  const hz = inputHz.value.trim();
  let py = inputPy.value.trim();
  let vi = inputVi.value.trim();
  let grammar = inputGrammar.value.trim();
  const folder = inputCardFolderSelect.value || DEFAULT_FOLDER;

  if (!hz) {
    alert(t("Vui lòng nhập câu Chữ Hán!", "请输入汉字句子！"));
    return;
  }

  const btnSave = document.getElementById('btnSaveCard');
  const origText = btnSave.textContent;
  if (!vi || !py) {
    btnSave.disabled = true;
    btnSave.textContent = t("Đang tự điền nghĩa...", "正在自动生成释义...");
    try {
      const [analyzed] = await analyzeChineseSentencesWithAI([hz]);
      if (analyzed) {
        py = py || analyzed.py || generateLocalPinyin(hz);
        vi = vi || analyzed.vi || "Chưa có nghĩa";
        grammar = grammar || analyzed.grammar || "• Từ mới tự bổ sung";
      }
    } catch {
      py = py || generateLocalPinyin(hz);
      vi = vi || "Chưa có nghĩa";
    } finally {
      btnSave.disabled = false;
      btnSave.textContent = origText;
    }
  }

  const formattedGrammar = grammar ? (grammar.startsWith('•') ? grammar : `• ${grammar}`) : "• Từ mới tự bổ sung";

  if (editingCardId !== null) {
    const targetCard = cards.find(c => Number(c.id) === Number(editingCardId));
    if (targetCard) {
      targetCard.hz = hz;
      targetCard.py = py;
      targetCard.vi = vi;
      targetCard.grammar = formattedGrammar;
      targetCard.folder = folder;
      if (!customFolders.includes(folder)) customFolders.push(folder);

      refreshAllFolderSelectors();
      applyFilter(false);
      if (!viewList.classList.contains('hidden')) renderList();
      closeModal();
      await upsertCardToCloud(targetCard);
      return;
    }
  }

  const newCard = {
    id: Date.now(),
    hz,
    py,
    vi,
    grammar: formattedGrammar,
    folder,
    status: 'new',
    reviews: 0,
    nextReview: 0,
    intervalDays: 0,
    wrongCount: 0,
    lastReviewed: 0
  };

  cards.unshift(newCard);
  refreshAllFolderSelectors();
  studyFolderSelect.value = folder;
  filterSelect.value = 'all';
  currentIndex = 0;
  applyFilter(true);
  closeModal();
  switchTab(btnStudyMode, viewFlashcards);
  await upsertCardToCloud(newCard);
});

// =========================================================================
// MODAL 2: IMPORT NHIỀU CÂU BẰNG AI
// =========================================================================
var modalBulkImport = document.getElementById('modalBulkImport');
var bulkInputHz = document.getElementById('bulkInputHz');
var btnAnalyzeBulk = document.getElementById('btnAnalyzeBulk');
var bulkPreviewContainer = document.getElementById('bulkPreviewContainer');
var bulkPreviewList = document.getElementById('bulkPreviewList');
var bulkPreviewCount = document.getElementById('bulkPreviewCount');
var btnSaveBulk = document.getElementById('btnSaveBulk');
var bulkStatusText = document.getElementById('bulkStatusText');
var generatedBulkCards = [];

document.getElementById('btnOpenBulkModal').addEventListener('click', () => {
  refreshAllFolderSelectors();
  if (studyFolderSelect.value && studyFolderSelect.value !== 'all') {
    bulkFolderSelect.value = studyFolderSelect.value;
  }
  modalBulkImport.classList.remove('hidden');
  bulkInputHz.focus();
});

function closeBulkModal() {
  modalBulkImport.classList.add('hidden');
  bulkInputHz.value = '';
  generatedBulkCards = [];
  bulkPreviewContainer.classList.add('hidden');
  btnSaveBulk.disabled = true;
}

document.getElementById('btnCloseBulkModal').addEventListener('click', closeBulkModal);
document.getElementById('btnCancelBulk').addEventListener('click', closeBulkModal);

function renderBulkPreviewEditableList() {
  const selectedFolder = bulkFolderSelect.value || DEFAULT_FOLDER;
  bulkPreviewCount.textContent = generatedBulkCards.length;
  btnSaveBulk.disabled = generatedBulkCards.length === 0;
  if (generatedBulkCards.length === 0) {
    bulkPreviewContainer.classList.add('hidden');
    return;
  }
  bulkPreviewContainer.classList.remove('hidden');
  bulkPreviewList.innerHTML = generatedBulkCards.map((c, i) => `
    <div class="p-3.5 text-xs space-y-2 bg-white">
      <div class="flex items-center justify-between gap-2">
        <span class="font-bold text-[#86868B]">#${i + 1}</span>
        <div class="flex items-center gap-2">
          <span class="text-[11px] bg-[#FF9500]/12 text-[#C93400] px-2.5 py-0.5 rounded-full font-semibold">📁 ${selectedFolder}</span>
          <button type="button" data-bulk-remove="${i}" class="text-[#86868B] hover:text-[#FF3B30] px-1.5 py-0.5 rounded" title="${t('Xóa câu này khỏi danh sách import', '从导入列表中移除此句')}">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input type="text" data-bulk-idx="${i}" data-bulk-field="hz" value="${(c.hz || '').replace(/"/g, '&quot;')}"
          placeholder="Chữ Hán / 汉字" class="apple-input rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#1D1D1F]">
        <input type="text" data-bulk-idx="${i}" data-bulk-field="py" value="${(c.py || '').replace(/"/g, '&quot;')}"
          placeholder="Pinyin / 拼音" class="apple-input rounded-xl px-2.5 py-1.5 text-xs text-[#0071E3] font-medium">
      </div>
      <input type="text" data-bulk-idx="${i}" data-bulk-field="vi" value="${(c.vi || '').replace(/"/g, '&quot;')}"
        placeholder="Nghĩa tiếng Việt / 越南语释义" class="w-full apple-input rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#1D8338]">
      <input type="text" data-bulk-idx="${i}" data-bulk-field="grammar" value="${(c.grammar || '').replace(/"/g, '&quot;')}"
        placeholder="Giải thích từ vựng & ngữ pháp / 词汇与语法解析" class="w-full apple-input rounded-xl px-2.5 py-1.5 text-xs text-[#86868B]">
    </div>
  `).join('');
}

bulkPreviewList.addEventListener('input', (e) => {
  const inputEl = e.target.closest('[data-bulk-idx]');
  if (!inputEl) return;
  const idx = Number(inputEl.getAttribute('data-bulk-idx'));
  const field = inputEl.getAttribute('data-bulk-field');
  if (generatedBulkCards[idx] && field) {
    generatedBulkCards[idx][field] = inputEl.value;
  }
});

bulkPreviewList.addEventListener('click', (e) => {
  const rmBtn = e.target.closest('[data-bulk-remove]');
  if (!rmBtn) return;
  const idx = Number(rmBtn.getAttribute('data-bulk-remove'));
  generatedBulkCards.splice(idx, 1);
  renderBulkPreviewEditableList();
});

btnAnalyzeBulk.addEventListener('click', async () => {
  const lines = bulkInputHz.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    alert(t("Vui lòng nhập ít nhất 1 câu tiếng Trung!", "请至少输入 1 个中文句子！"));
    return;
  }

  btnAnalyzeBulk.disabled = true;
  const origHtml = btnAnalyzeBulk.innerHTML;
  btnAnalyzeBulk.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${t(`Đang phân tích ${lines.length} câu...`, `正在解析 ${lines.length} 个句子...`)}`;
  bulkStatusText.textContent = t("Đang tạo Pinyin, dịch nghĩa tiếng Việt và phân tích ngữ pháp...", "正在生成拼音、越南语释义与语法解析...");

  try {
    const analyzedList = await analyzeChineseSentencesWithAI(lines);
    const now = Date.now();
    const selectedFolder = bulkFolderSelect.value || DEFAULT_FOLDER;
    generatedBulkCards = analyzedList.map((item, idx) => ({
      id: now + idx,
      hz: item.hz || lines[idx],
      py: item.py || generateLocalPinyin(item.hz || lines[idx]),
      vi: item.vi || "",
      grammar: item.grammar || "• Từ mới tự bổ sung",
      folder: selectedFolder,
      status: 'new',
      reviews: 0,
      nextReview: 0,
      intervalDays: 0,
      wrongCount: 0,
      lastReviewed: 0
    }));

    renderBulkPreviewEditableList();
    bulkStatusText.textContent = t(
      `Đã phân tích xong ${generatedBulkCards.length} câu! Bạn có thể sửa trực tiếp các ô bên dưới trước khi bấm Lưu.`,
      `已解析 ${generatedBulkCards.length} 个句子！您可直接在下方修改后点击保存。`
    );
  } catch (err) {
    alert(t("Lỗi khi phân tích: ", "解析出错: ") + err.message);
    bulkStatusText.textContent = t("Có lỗi xảy ra: ", "发生错误: ") + err.message;
  } finally {
    btnAnalyzeBulk.disabled = false;
    btnAnalyzeBulk.innerHTML = origHtml;
  }
});

btnSaveBulk.addEventListener('click', async () => {
  if (generatedBulkCards.length === 0) return;
  const targetFolder = bulkFolderSelect.value || DEFAULT_FOLDER;
  generatedBulkCards.forEach(c => { c.folder = targetFolder; });

  btnSaveBulk.disabled = true;
  btnSaveBulk.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> ${t('Đang lưu...', '保存中...')}`;

  cards = [...generatedBulkCards, ...cards];
  refreshAllFolderSelectors();
  studyFolderSelect.value = targetFolder;
  filterSelect.value = 'all';
  currentIndex = 0;
  applyFilter(true);
  await upsertMultipleCardsToCloud(generatedBulkCards);

  const count = generatedBulkCards.length;
  btnSaveBulk.innerHTML = `<i class="fa-solid fa-cloud-arrow-up mr-1"></i> ${t('Lưu tất cả vào bộ thẻ', '保存全部')}`;
  closeBulkModal();
  switchTab(btnStudyMode, viewFlashcards);
  alert(t(`Đã thêm thành công ${count} câu mới vào bộ thẻ "${targetFolder}"!`, `已成功将 ${count} 个新句子添加至牌组 "${targetFolder}"！`));
});

// =========================================================================
// MODAL 3: CẤU HÌNH AI & ĐỒNG BỘ CLOUD (CHỈ OWNER / ADMIN)
// =========================================================================
var modalSettings = document.getElementById('modalSettings');
var cfgOpenRouterKey = document.getElementById('cfgOpenRouterKey');
var cfgOpenRouterModel = document.getElementById('cfgOpenRouterModel');

function isCurrentUserAdminOrOwner() {
  return Boolean(currentUser && (currentUser.role === 'owner' || currentUser.role === 'admin'));
}

document.getElementById('btnOpenSettings').addEventListener('click', () => {
  if (!isCurrentUserAdminOrOwner()) {
    alert(t(
      "Chỉ tài khoản Chủ sở hữu (Owner / Admin) mới có quyền xem và chỉnh sửa cấu hình!",
      "仅所有者 (Owner / Admin) 账户有权查看和修改配置！"
    ));
    return;
  }
  const cfg = getConfig();
  cfgOpenRouterKey.value = '';
  cfgOpenRouterKey.placeholder = cfg.openRouterKey
    ? t("Đã lưu Key bảo mật (Chỉ nhập vào đây nếu muốn đổi Key mới)", "已保存安全密钥（仅在需要更换新密钥时输入）")
    : t("Nhập OpenRouter API Key mới (sk-or-v1-...)", "输入新的 OpenRouter API Key (sk-or-v1-...)");
  cfgOpenRouterModel.value = cfg.openRouterModel;
  modalSettings.classList.remove('hidden');
});

function closeSettings() {
  modalSettings.classList.add('hidden');
}

document.getElementById('btnCloseSettings').addEventListener('click', closeSettings);
document.getElementById('btnCancelSettings').addEventListener('click', closeSettings);

document.getElementById('btnSaveSettings').addEventListener('click', async () => {
  if (!isCurrentUserAdminOrOwner()) {
    alert(t("Chỉ tài khoản Chủ sở hữu (Owner / Admin) mới có quyền lưu cấu hình!", "仅所有者账户有权保存设置！"));
    return;
  }
  const newKey = cfgOpenRouterKey.value.trim();
  const newModel = cfgOpenRouterModel.value.trim() || 'deepseek/deepseek-chat';
  localStorage.setItem('cfg_openrouter_model', newModel);

  if (newKey) {
    runtimeOpenRouterKey = newKey;
    localStorage.setItem('cfg_openrouter_key', newKey);
    if (currentUser && currentUser.passwordHash && supabaseClient) {
      const encOrKey = xorCipherHex(newKey, currentUser.passwordHash);
      currentUser.encOrKey = encOrKey;
      const newMeta = {
        role: currentUser.role || 'owner',
        allowPublicRegister: allowPublicRegistration,
        createdAt: currentUser.createdAt || Date.now(),
        encOrKey,
        orModel: newModel
      };
      await supabaseClient
        .from('flashcards')
        .update({ grammar: JSON.stringify(newMeta), updated_at: new Date().toISOString() })
        .eq('id', currentUser.id);
    }
  }
  cfgOpenRouterKey.value = '';
  closeSettings();
  await loadCardsFromCloud();
});

document.getElementById('btnPushLocalToCloud').addEventListener('click', async () => {
  if (!isCurrentUserAdminOrOwner()) {
    alert(t("Chỉ tài khoản Chủ sở hữu (Owner / Admin) mới có quyền đẩy dữ liệu lên Cloud!", "仅所有者账户有权推送数据至云端！"));
    return;
  }
  await pushAllLocalCardsToCloud(true);
});

// =========================================================================
// DANH SÁCH THẺ & PHÂN TRANG (PAGINATION) & XUẤT / NHẬP JSON
// =========================================================================
var searchListInput = document.getElementById('searchListInput');
var allCardsTable = document.getElementById('allCardsTable');
var listPageSizeSelect = document.getElementById('listPageSizeSelect');
var listPaginationContainer = document.getElementById('listPaginationContainer');
var listPaginationInfo = document.getElementById('listPaginationInfo');
var btnListPrevPage = document.getElementById('btnListPrevPage');
var btnListNextPage = document.getElementById('btnListNextPage');
var listPageNumbers = document.getElementById('listPageNumbers');

var listCurrentPage = 1;
var listPageSize = 20;

searchListInput.addEventListener('input', () => {
  listCurrentPage = 1;
  renderList();
});

listFolderSelect.addEventListener('change', () => {
  listCurrentPage = 1;
  renderDecksOverview();
  renderList();
});

if (listPageSizeSelect) {
  listPageSizeSelect.addEventListener('change', () => {
    listPageSize = parseInt(listPageSizeSelect.value, 10) || 20;
    listCurrentPage = 1;
    renderList();
  });
}

if (btnListPrevPage) {
  btnListPrevPage.addEventListener('click', () => {
    if (listCurrentPage > 1) {
      listCurrentPage--;
      renderList();
      allCardsTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

if (btnListNextPage) {
  btnListNextPage.addEventListener('click', () => {
    const keyword = (searchListInput.value || '').trim().toLowerCase();
    const folderFilter = listFolderSelect.value || 'all';
    const filtered = cards.filter(c => {
      const matchFolder = folderFilter === 'all' || (c.folder || DEFAULT_FOLDER) === folderFilter;
      const matchKeyword = !keyword ||
        (c.hz && c.hz.toLowerCase().includes(keyword)) ||
        (c.py && c.py.toLowerCase().includes(keyword)) ||
        (c.vi && c.vi.toLowerCase().includes(keyword));
      return matchFolder && matchKeyword;
    });
    const totalPages = Math.ceil(filtered.length / listPageSize) || 1;
    if (listCurrentPage < totalPages) {
      listCurrentPage++;
      renderList();
      allCardsTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function renderList() {
  const keyword = (searchListInput.value || '').trim().toLowerCase();
  const folderFilter = listFolderSelect.value || 'all';

  const filtered = cards.filter(c => {
    const matchFolder = folderFilter === 'all' || (c.folder || DEFAULT_FOLDER) === folderFilter;
    const matchKeyword = !keyword ||
      (c.hz && c.hz.toLowerCase().includes(keyword)) ||
      (c.py && c.py.toLowerCase().includes(keyword)) ||
      (c.vi && c.vi.toLowerCase().includes(keyword));
    return matchFolder && matchKeyword;
  });

  const totalPages = Math.ceil(filtered.length / listPageSize) || 1;
  if (listCurrentPage > totalPages) listCurrentPage = totalPages;
  if (listCurrentPage < 1) listCurrentPage = 1;

  const startIndex = (listCurrentPage - 1) * listPageSize;
  const pageItems = filtered.slice(startIndex, startIndex + listPageSize);

  document.getElementById('totalCardCount').textContent = t(
    `Hiển thị: ${filtered.length} / ${cards.length} câu`,
    `显示: ${filtered.length} / ${cards.length} 句`
  );

  if (listPaginationInfo) {
    listPaginationInfo.textContent = t(
      `Trang ${listCurrentPage} / ${totalPages} (Tổng ${filtered.length} câu)`,
      `第 ${listCurrentPage} / ${totalPages} 页（共 ${filtered.length} 句）`
    );
  }

  if (btnListPrevPage) btnListPrevPage.disabled = (listCurrentPage <= 1);
  if (btnListNextPage) btnListNextPage.disabled = (listCurrentPage >= totalPages);

  // Render các nút số trang
  if (listPageNumbers) {
    listPageNumbers.innerHTML = '';
    const maxButtons = 5;
    let startPage = Math.max(1, listCurrentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let p = startPage; p <= endPage; p++) {
      const pageBtn = document.createElement('button');
      pageBtn.type = 'button';
      pageBtn.className = `w-7 h-7 rounded-full text-xs font-semibold transition ${p === listCurrentPage ? 'bg-[#0071E3] text-white shadow-sm' : 'bg-black/[0.04] text-[#1D1D1F] hover:bg-black/[0.08]'}`;
      pageBtn.textContent = p;
      pageBtn.onclick = () => {
        listCurrentPage = p;
        renderList();
        allCardsTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      listPageNumbers.appendChild(pageBtn);
    }
  }

  if (filtered.length === 0) {
    allCardsTable.innerHTML = `
      <div class="p-8 text-center text-[#86868B] text-sm font-medium">
        ${t("Không tìm thấy câu học nào phù hợp với bộ lọc hiện tại.", "未找到符合当前筛选条件的句子。")}
      </div>
    `;
    return;
  }

  allCardsTable.innerHTML = pageItems.map((c, i) => `
    <div class="p-4 sm:px-5 hover:bg-black/[0.02] transition flex items-start justify-between gap-4">
      <div class="space-y-1 flex-1 cursor-pointer" data-card-action="select" data-card-id="${c.id}">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-bold text-[#86868B]">#${startIndex + i + 1}</span>
          <span class="text-base font-bold text-[#1D1D1F]">${c.hz}</span>
          <span class="text-xs font-medium text-[#0071E3]">${c.py || ''}</span>
          <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-black/[0.04] text-[#1D1D1F] border border-black/[0.06] font-medium">
            <i class="fa-solid fa-folder text-[#FF9500] mr-1"></i>${c.folder || DEFAULT_FOLDER}
          </span>
        </div>
        <p class="text-sm text-[#1D1D1F]/80 font-medium">${c.vi}</p>
        <p class="text-xs text-[#86868B]">${c.grammar || ''}</p>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        <span class="text-[11px] text-[#86868B] hidden sm:inline mr-1">${formatNextReviewText(c)}</span>
        <span class="text-xs px-2.5 py-1 rounded-full font-semibold ${c.status === 'mastered' ? 'bg-[#34C759]/12 text-[#1D8338]' : (c.status === 'hard' ? 'bg-[#FF3B30]/12 text-[#FF3B30]' : (c.status === 'learning' ? 'bg-[#FF9500]/15 text-[#C93400]' : 'bg-black/[0.05] text-[#86868B]'))}">
          ${c.status === 'mastered' ? t('Đã thuộc', '已掌握') : (c.status === 'hard' ? t('Cần ôn', '需复习') : (c.status === 'learning' ? t('Đang ôn', '学习中') : t('Mới', '新卡')))}
        </span>
        <button type="button" data-card-action="edit" data-card-id="${c.id}" class="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-[#0071E3] text-[#0071E3] hover:text-white flex items-center justify-center text-xs transition" title="${t('Chỉnh sửa thẻ (Chữ Hán, Pinyin, Nghĩa, Ngữ pháp, Bộ thẻ)', '编辑卡片内容')}">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button type="button" data-card-action="move" data-card-id="${c.id}" class="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-[#FF9500] text-[#86868B] hover:text-white flex items-center justify-center text-xs transition" title="${t('Chuyển sang bộ thẻ khác', '移动至其他牌组')}">
          <i class="fa-solid fa-folder-open"></i>
        </button>
        <button type="button" data-card-action="delete" data-card-id="${c.id}" class="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-[#FF3B30] text-[#86868B] hover:text-white flex items-center justify-center text-xs transition" title="${t('Xóa thẻ', '删除卡片')}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

async function moveCardFolderById(id) {
  if (currentUser && currentUser.role !== 'owner') {
    alert(t("Chỉ tài khoản Chủ sở hữu (Owner) mới có quyền chuyển bộ thẻ của thẻ chung!", "仅所有者 (Owner) 账户有权移动公共卡片的牌组！"));
    return;
  }
  const card = cards.find(c => Number(c.id) === Number(id));
  if (!card) return;
  const allF = getAllFolders();
  const chosen = prompt(
    t(
      `Nhập tên bộ thẻ muốn chuyển câu "${card.hz}" tới:\n(Các bộ thẻ hiện có: ${allF.join(', ')})`,
      `输入要将 "${card.hz}" 移动到的牌组名称:\n(现有牌组: ${allF.join(', ')})`
    ),
    card.folder || DEFAULT_FOLDER
  );
  if (!chosen || !chosen.trim()) return;
  card.folder = chosen.trim();
  if (!customFolders.includes(card.folder)) customFolders.push(card.folder);
  refreshAllFolderSelectors();
  renderList();
  await upsertCardToCloud(card);
}

async function deleteCardById(id) {
  if (currentUser && currentUser.role !== 'owner') {
    alert(t("Chỉ tài khoản Chủ sở hữu (Owner) mới có quyền xóa thẻ khỏi Database!", "仅所有者 (Owner) 账户有权从数据库删除卡片！"));
    return;
  }
  if (confirm(t("Bạn có chắc chắn muốn xóa câu này?", "您确定要删除此句子吗？"))) {
    cards = cards.filter(c => Number(c.id) !== Number(id));
    refreshAllFolderSelectors();
    applyFilter(false);
    renderList();
    await deleteCardFromCloud(id);
  }
}

function selectCardById(id) {
  studyFolderSelect.value = 'all';
  filterSelect.value = 'all';
  currentFilteredCards = [...cards];
  const idx = currentFilteredCards.findIndex(c => Number(c.id) === Number(id));
  currentIndex = idx >= 0 ? idx : 0;
  switchTab(btnStudyMode, viewFlashcards);
  updateCardUI(true);
}

allCardsTable.addEventListener('click', (e) => {
  const actionEl = e.target.closest('[data-card-action]');
  if (!actionEl) return;
  const action = actionEl.getAttribute('data-card-action');
  const cardId = Number(actionEl.getAttribute('data-card-id'));
  if (!cardId) return;
  if (action === 'edit') {
    e.stopPropagation();
    openEditCardModal(cardId);
  } else if (action === 'move') {
    e.stopPropagation();
    moveCardFolderById(cardId);
  } else if (action === 'delete') {
    e.stopPropagation();
    deleteCardById(cardId);
  } else if (action === 'select') {
    selectCardById(cardId);
  }
});

document.getElementById('btnExportJson').addEventListener('click', () => {
  const cleanCards = cards.map(({ _ownerRoot, _userProgressMap, ...rest }) => rest);
  const userSuffix = currentUser ? `-${currentUser.username}` : '';
  const blob = new Blob([JSON.stringify(cleanCards, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flashcards-backup${userSuffix}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

var inputImportJson = document.getElementById('inputImportJson');
document.getElementById('btnImportJson').addEventListener('click', () => {
  inputImportJson.value = '';
  inputImportJson.click();
});

inputImportJson.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const rawList = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.cards) ? parsed.cards : []);

    if (rawList.length === 0) {
      alert(t("File JSON không hợp lệ hoặc không chứa danh sách thẻ nào!", "JSON 文件无效或不包含任何卡片！"));
      return;
    }

    const now = Date.now();
    const importedCards = rawList
      .filter(item => item && item.hz && item.vi)
      .map((item, idx) => unpackCardFromStorage({
        id: item.id || (now + idx),
        hz: String(item.hz).trim(),
        py: item.py ? String(item.py).trim() : generateLocalPinyin(String(item.hz).trim()),
        vi: String(item.vi).trim(),
        grammar: item.grammar || "• Từ mới tự bổ sung",
        folder: item.folder || DEFAULT_FOLDER,
        status: item.status || 'new',
        reviews: Number(item.reviews) || 0,
        nextReview: Number(item.nextReview) || 0,
        intervalDays: Number(item.intervalDays) || 0,
        wrongCount: Number(item.wrongCount) || 0,
        lastReviewed: Number(item.lastReviewed) || 0
      }));

    if (importedCards.length === 0) {
      alert(t("Không tìm thấy thẻ hợp lệ (cần có trường 'hz' và 'vi') trong file JSON!", "在 JSON 文件中未找到有效卡片（需包含 'hz' 和 'vi' 字段）！"));
      return;
    }

    const mapById = new Map(cards.map(c => [String(c.id), c]));
    const mapByHz = new Map(cards.map(c => [c.hz, c]));
    const updatedOrAdded = [];

    importedCards.forEach(ic => {
      if (ic.folder && !customFolders.includes(ic.folder)) {
        customFolders.push(ic.folder);
      }
      const existing = mapById.get(String(ic.id)) || mapByHz.get(ic.hz);
      if (existing) {
        Object.assign(existing, ic, { id: existing.id });
        updatedOrAdded.push(existing);
      } else {
        cards.unshift(ic);
        mapById.set(String(ic.id), ic);
        mapByHz.set(ic.hz, ic);
        updatedOrAdded.push(ic);
      }
    });

    saveToLocalStorage();
    refreshAllFolderSelectors();
    applyFilter(false);
    renderList();
    await upsertMultipleCardsToCloud(updatedOrAdded);

    alert(t(
      `Đã nhập thành công ${importedCards.length} thẻ từ file JSON và đồng bộ lên Cloud!`,
      `已成功从 JSON 导入 ${importedCards.length} 张卡片并同步至云端！`
    ));
  } catch (err) {
    alert(t("Lỗi khi đọc file JSON: ", "读取 JSON 文件出错: ") + err.message);
  }
});

// =========================================================================
// HỆ THỐNG QUIZ (KIỂM TRA & LUYỆN TẬP ĐA CHẾ ĐỘ)
// =========================================================================
var quizQuestions = [];
var currentQuizIndex = 0;
var quizScore = 0;
var selectedQuizModes = new Set(['zh_to_vi']); // Hỗ trợ chọn 1, nhiều hoặc cả 4 loại kiểm tra

var quizCountSelect = document.getElementById('quizCountSelect');
var quizSourceFilter = document.getElementById('quizSourceFilter');
var quizModeBtns = document.querySelectorAll('.quiz-mode-btn');
var quizTextPrompt = document.getElementById('quizTextPrompt');
var quizAudioPrompt = document.getElementById('quizAudioPrompt');
var quizListeningReveal = document.getElementById('quizListeningReveal');
var quizRevealHanzi = document.getElementById('quizRevealHanzi');
var quizRevealPinyin = document.getElementById('quizRevealPinyin');
var quizListenHint = document.getElementById('quizListenHint');
var quizTypingBox = document.getElementById('quizTypingBox');
var quizTypingInput = document.getElementById('quizTypingInput');
var btnSubmitTyping = document.getElementById('btnSubmitTyping');
var btnQuizPlayNormal = document.getElementById('btnQuizPlayNormal');
var btnQuizPlaySlow = document.getElementById('btnQuizPlaySlow');

function updateQuizModeButtonsUI() {
  const allCoreModes = ['zh_to_vi', 'vi_to_zh', 'listen_choice', 'listen_type'];
  const isAllSelected = allCoreModes.every(m => selectedQuizModes.has(m));

  quizModeBtns.forEach(b => {
    const mode = b.getAttribute('data-quiz-mode');
    if (mode === 'mixed') {
      if (isAllSelected) {
        b.className = "quiz-mode-btn col-span-2 sm:col-span-1 py-2 px-2 rounded-xl bg-white text-[#0071E3] shadow-sm font-semibold transition text-center border border-[#0071E3]/25";
      } else {
        b.className = "quiz-mode-btn col-span-2 sm:col-span-1 py-2 px-2 rounded-xl text-[#86868B] hover:bg-white/60 transition text-center";
      }
    } else {
      if (selectedQuizModes.has(mode)) {
        b.className = "quiz-mode-btn py-2 px-2 rounded-xl bg-white text-[#0071E3] shadow-sm font-semibold transition text-center border border-[#0071E3]/25";
      } else {
        b.className = "quiz-mode-btn py-2 px-2 rounded-xl text-[#86868B] hover:bg-white/60 transition text-center";
      }
    }
  });
}

quizModeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const clickedMode = btn.getAttribute('data-quiz-mode');
    const allCoreModes = ['zh_to_vi', 'vi_to_zh', 'listen_choice', 'listen_type'];

    if (clickedMode === 'mixed') {
      const isAllSelected = allCoreModes.every(m => selectedQuizModes.has(m));
      if (isAllSelected) {
        selectedQuizModes = new Set(['zh_to_vi']);
      } else {
        selectedQuizModes = new Set(allCoreModes);
      }
    } else {
      if (selectedQuizModes.has(clickedMode)) {
        if (selectedQuizModes.size > 1) {
          selectedQuizModes.delete(clickedMode);
        } else {
          return; // Giữ ít nhất 1 loại
        }
      } else {
        selectedQuizModes.add(clickedMode);
      }
    }

    updateQuizModeButtonsUI();
    initDailyQuiz();
  });
});

quizCountSelect.addEventListener('change', initDailyQuiz);
quizSourceFilter.addEventListener('change', initDailyQuiz);

function getQuizPoolBySelectedFoldersAndSRS() {
  const isAll = selectedQuizFolders.has('all') || selectedQuizFolders.size === 0;
  let pool = isAll
    ? [...cards]
    : cards.filter(c => selectedQuizFolders.has(c.folder || DEFAULT_FOLDER));

  const sourceMode = quizSourceFilter.value;
  if (sourceMode === 'srs_only') {
    pool = pool.filter(isCardDueForSRS);
    pool.sort((a, b) => getSrsPriorityScore(b) - getSrsPriorityScore(a));
  } else if (sourceMode === 'srs_priority') {
    pool.sort((a, b) => (getSrsPriorityScore(b) - getSrsPriorityScore(a)) || (0.5 - Math.random()));
  } else {
    pool.sort(() => 0.5 - Math.random());
  }
  return pool;
}

function initDailyQuiz() {
  const pool = getQuizPoolBySelectedFoldersAndSRS();
  const totalCount = Math.min(parseInt(quizCountSelect.value, 10) || 5, pool.length);
  const activeModes = Array.from(selectedQuizModes);
  if (activeModes.length === 0) activeModes.push('zh_to_vi');

  quizQuestions = pool.slice(0, totalCount).map(item => {
    const mode = activeModes[Math.floor(Math.random() * activeModes.length)];
    const wrongs = cards.filter(c => c.id !== item.id).sort(() => 0.5 - Math.random()).slice(0, 3);

    if (mode === 'vi_to_zh') {
      const optionCards = [...wrongs, item].sort(() => 0.5 - Math.random());
      return { mode, item, correctId: item.id, optionCards };
    } else {
      const options = [...wrongs.map(w => w.vi), item.vi].sort(() => 0.5 - Math.random());
      return { mode, item, correct: item.vi, options };
    }
  });

  currentQuizIndex = 0;
  quizScore = 0;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const fBack = document.getElementById('quizFeedback');
  fBack.className = "hidden";
  document.getElementById('btnNextQuiz').classList.add('hidden');
  document.getElementById('btnRestartQuiz').classList.add('hidden');
  const totalQ = quizQuestions.length;

  if (totalQ === 0) {
    document.getElementById('quizScoreBadge').textContent = `0 / 0`;
    document.getElementById('quizQuestion').textContent = t(`Không có câu hỏi nào trong thư mục đã chọn!`, `所选文件夹中没有题目！`);
    document.getElementById('quizPromptBox').classList.add('hidden');
    quizTypingBox.classList.add('hidden');
    document.getElementById('quizOptions').innerHTML = '';
    return;
  }

  if (currentQuizIndex >= totalQ) {
    document.getElementById('quizScoreBadge').textContent = t(`Hoàn thành!`, `已完成！`);
    document.getElementById('quizQuestion').textContent = t(
      `Kết quả của bạn: ${quizScore} / ${totalQ} câu chính xác! 🎉`,
      `您的测验成绩: ${quizScore} / ${totalQ} 题正确！🎉`
    );
    document.getElementById('quizPromptBox').classList.add('hidden');
    quizTypingBox.classList.add('hidden');
    document.getElementById('quizOptions').innerHTML = `
      <div class="text-center py-6">
        <p class="text-slate-600 text-sm mb-2">${t(`Bạn đã hoàn thành lượt luyện tập ${totalQ} câu hỏi!`, `您已完成 ${totalQ} 道题目的练习！`)}</p>
        <p class="text-xs text-slate-400">${t(`Những câu trả lời sai đã được hệ thống tự động đưa vào danh sách Cần ôn hôm nay (SRS).`, `答错的题目已自动加入“今日待复习 (SRS)”列表。`)}</p>
      </div>
    `;
    document.getElementById('btnRestartQuiz').classList.remove('hidden');
    updateStatsSummary();
    return;
  }

  const q = quizQuestions[currentQuizIndex];
  document.getElementById('quizScoreBadge').textContent = `${t('Câu', '第')} ${currentQuizIndex + 1} / ${totalQ} • 📁 ${q.item.folder || DEFAULT_FOLDER}`;
  document.getElementById('quizPromptBox').classList.remove('hidden');

  const optsContainer = document.getElementById('quizOptions');
  optsContainer.innerHTML = '';
  quizTypingBox.classList.add('hidden');
  quizListeningReveal.classList.add('hidden');
  quizListenHint.classList.remove('hidden');

  if (q.mode === 'zh_to_vi') {
    document.getElementById('quizQuestion').textContent = t(
      "🇨🇳 ➔ 🇻🇳 Chọn nghĩa tiếng Việt đúng của câu sau:",
      "🇨🇳 ➔ 🇻🇳 请选择下列中文句子的正确越南语意思:"
    );
    quizTextPrompt.classList.remove('hidden');
    quizAudioPrompt.classList.add('hidden');
    document.getElementById('quizTargetHanzi').textContent = q.item.hz;
    document.getElementById('quizTargetHanzi').className = "text-2xl font-bold text-indigo-700";
    document.getElementById('quizTargetPinyin').textContent = q.item.py || '';

    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = "text-left p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition font-medium text-sm text-slate-700";
      btn.textContent = opt;
      btn.onclick = () => handleChoiceAnswer(opt === q.correct, btn, q);
      optsContainer.appendChild(btn);
    });

  } else if (q.mode === 'vi_to_zh') {
    document.getElementById('quizQuestion').textContent = t(
      "🇻🇳 ➔ 🇨🇳 Chọn câu tiếng Trung (kèm Pinyin) tương ứng với nghĩa sau:",
      "🇻🇳 ➔ 🇨🇳 请选择与下列越南语意思对应的中文句子（含拼音）:"
    );
    quizTextPrompt.classList.remove('hidden');
    quizAudioPrompt.classList.add('hidden');
    document.getElementById('quizTargetHanzi').textContent = q.item.vi;
    document.getElementById('quizTargetHanzi').className = "text-xl sm:text-2xl font-bold text-emerald-700";
    document.getElementById('quizTargetPinyin').textContent = t("Hãy chọn đáp án chữ Hán + Pinyin đúng bên dưới", "请在下方选择正确的汉字+拼音答案");

    q.optionCards.forEach(optCard => {
      const btn = document.createElement('button');
      btn.dataset.cardId = optCard.id;
      btn.className = "text-left p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition text-slate-800 space-y-0.5";
      btn.innerHTML = `
        <div class="font-bold text-base sm:text-lg text-slate-800">${optCard.hz}</div>
        <div class="text-xs font-mono text-indigo-600">${optCard.py || ''}</div>
      `;
      btn.onclick = () => {
        speakChinese(optCard.hz, 0.85);
        handleChoiceAnswer(optCard.id === q.correctId, btn, q);
      };
      optsContainer.appendChild(btn);
    });

  } else if (q.mode === 'listen_choice') {
    document.getElementById('quizQuestion').textContent = t(
      "🎧 Nghe câu tiếng Trung và chọn nghĩa tiếng Việt đúng:",
      "🎧 听中文句子并选择正确的越南语意思:"
    );
    quizTextPrompt.classList.add('hidden');
    quizAudioPrompt.classList.remove('hidden');
    quizRevealHanzi.textContent = q.item.hz;
    quizRevealPinyin.textContent = q.item.py || '';

    btnQuizPlayNormal.onclick = () => speakChinese(q.item.hz, 0.85);
    btnQuizPlaySlow.onclick = () => speakChinese(q.item.hz, 0.55);
    setTimeout(() => speakChinese(q.item.hz, 0.85), 150);

    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = "text-left p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition font-medium text-sm text-slate-700";
      btn.textContent = opt;
      btn.onclick = () => handleChoiceAnswer(opt === q.correct, btn, q);
      optsContainer.appendChild(btn);
    });

  } else if (q.mode === 'listen_type') {
    document.getElementById('quizQuestion').textContent = t(
      "✍️ Nghe câu tiếng Trung và gõ lại nghĩa tiếng Việt:",
      "✍️ 听中文句子并输入越南语意思:"
    );
    quizTextPrompt.classList.add('hidden');
    quizAudioPrompt.classList.remove('hidden');
    quizTypingBox.classList.remove('hidden');
    quizRevealHanzi.textContent = q.item.hz;
    quizRevealPinyin.textContent = q.item.py || '';

    quizTypingInput.value = '';
    quizTypingInput.disabled = false;
    btnSubmitTyping.disabled = false;
    btnSubmitTyping.innerHTML = `<i class="fa-solid fa-check"></i> <span>${t('Kiểm tra', '提交')}</span>`;

    btnQuizPlayNormal.onclick = () => speakChinese(q.item.hz, 0.85);
    btnQuizPlaySlow.onclick = () => speakChinese(q.item.hz, 0.55);
    setTimeout(() => {
      speakChinese(q.item.hz, 0.85);
      quizTypingInput.focus();
    }, 150);
  }
}

async function handleChoiceAnswer(isCorrect, selectedBtn, q) {
  const allButtons = document.querySelectorAll('#quizOptions button');
  allButtons.forEach(b => b.disabled = true);
  const fBack = document.getElementById('quizFeedback');
  fBack.classList.remove('hidden');

  if (q.mode === 'listen_choice') {
    quizListenHint.classList.add('hidden');
    quizListeningReveal.classList.remove('hidden');
  }

  applySrsReviewResult(q.item, isCorrect ? 'easy' : 'hard');
  upsertCardToCloud(q.item);

  if (isCorrect) {
    quizScore++;
    selectedBtn.classList.add('bg-emerald-100', 'border-emerald-500', 'text-emerald-800');
    fBack.className = "p-3.5 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-800 border border-emerald-200";
    fBack.innerHTML = `<i class="fa-solid fa-circle-check mr-1"></i> <b>${t('Chính xác!', '回答正确！')}</b> (${formatNextReviewText(q.item)})<br><span class="text-xs text-emerald-700">${q.item.hz} (${q.item.py || ''}) — ${q.item.vi}</span><br><span class="text-xs text-slate-600">${q.item.grammar || ''}</span>`;
  } else {
    selectedBtn.classList.add('bg-rose-100', 'border-rose-500', 'text-rose-800');
    allButtons.forEach(b => {
      if (q.mode === 'vi_to_zh') {
        if (String(b.dataset.cardId) === String(q.correctId)) {
          b.classList.add('bg-emerald-50', 'border-emerald-400', 'text-emerald-800');
        }
      } else if (b.textContent === q.correct) {
        b.classList.add('bg-emerald-50', 'border-emerald-400', 'text-emerald-800');
      }
    });
    const correctDisplay = q.mode === 'vi_to_zh'
      ? `${q.item.hz} (${q.item.py || ''})`
      : q.item.vi;
    fBack.className = "p-3.5 rounded-xl text-sm font-medium bg-rose-50 text-rose-800 border border-rose-200";
    fBack.innerHTML = `<i class="fa-solid fa-circle-xmark mr-1"></i> <b>${t('Chưa đúng!', '回答错误！')}</b> ${t('Đã đưa vào danh sách Cần ôn lại (SRS).', '已加入待复习 (SRS) 列表。')}<br>${t('Đáp án đúng', '正确答案')}: <b>"${correctDisplay}"</b>.<br><span class="text-xs text-rose-600">${q.item.grammar || ''}</span>`;
  }
  document.getElementById('btnNextQuiz').classList.remove('hidden');
}

function normalizeViText(str) {
  if (!str) return "";
  let s = str.toLowerCase().trim();
  s = s.replace(/[.,?!;:"'()[\]…\-–—/\\]/g, ' ');
  const synonymGroups = [
    [/\b(bình thường|thông thường|thường ngày)\b/g, 'thường'],
    [/\b(thường xuyên|hay)\b/g, 'thường'],
    [/\b(rảnh rỗi|có thời gian rảnh|có thời gian)\b/g, 'rảnh'],
    [/\b(chẳng hạn như|ví dụ như là|ví dụ như|chẳng hạn|ví dụ)\b/g, 'vídụ'],
    [/\b(này nọ|các thứ|các kiểu|vân vân)\b/g, 'nàynọ'],
    [/\b(mình|tớ|anh|em)\b/g, 'tôi'],
    [/\b(cậu|anh ấy|cô ấy)\b/g, 'bạn'],
    [/\b(cảm thấy|thấy rằng)\b/g, 'thấy'],
    [/\b(vô cùng|cực kỳ|rất là)\b/g, 'rất'],
    [/\b(khi nào|lúc nào|bao giờ)\b/g, 'khinào'],
    [/\b(khi|lúc)\b/g, 'lúc'],
    [/\b(đi dạo bộ|dạo bộ|đi bộ dạo)\b/g, 'đidạo'],
    [/\b(khiêu vũ|nhảy múa)\b/g, 'nhảy'],
    [/\b(bơi lội)\b/g, 'bơi'],
    [/\b(thể thao vận động|vận động|tập thể thao)\b/g, 'thểthao'],
    [/\b(phim truyền hình|phim bộ)\b/g, 'phimtruyềnhình'],
    [/\b(phim điện ảnh|phim chiếu rạp)\b/g, 'phimđiệnảnh'],
    [/\b(thú cưng|động vật)\b/g, 'độngvật'],
    [/\b(quyển|cuốn)\b/g, 'cuốn'],
    [/\b(hơi khó một chút|hơi khó chút|hơi khó)\b/g, 'hơikhó'],
    [/\b(thoải mái dễ chịu|dễ chịu)\b/g, 'thoảimái'],
    [/\b(thế|vậy|nhỉ|à|nhé|không)\b/g, '']
  ];
  synonymGroups.forEach(([regex, replacement]) => {
    s = s.replace(regex, replacement);
  });
  return s.replace(/\s+/g, ' ').trim();
}

function checkLocalSynonymMatch(userVi, targetVi) {
  const normUser = normalizeViText(userVi);
  const normTarget = normalizeViText(targetVi);
  if (!normUser) return false;
  if (normUser === normTarget) return true;
  if (normTarget.includes(normUser) && normUser.length >= normTarget.length * 0.7) return true;

  const userWords = normUser.split(' ').filter(Boolean);
  const targetWords = normTarget.split(' ').filter(Boolean);
  if (targetWords.length === 0) return false;

  const matched = targetWords.filter(w => userWords.includes(w)).length;
  const recall = matched / targetWords.length;
  const precision = matched / Math.max(1, userWords.length);
  const f1 = (recall + precision) > 0 ? (2 * recall * precision) / (recall + precision) : 0;
  return f1 >= 0.75;
}

async function evaluateVietnameseAnswer(userVi, cardItem) {
  if (checkLocalSynonymMatch(userVi, cardItem.vi)) {
    return { isCorrect: true, note: t("Khớp ý nghĩa với đáp án gốc!", "与原答案意思一致！") };
  }

  const { openRouterKey, openRouterModel } = getConfig();
  if (openRouterKey) {
    try {
      const prompt = `Bạn là giáo viên chấm bài dịch tiếng Trung sang tiếng Việt.
Câu gốc tiếng Trung: "${cardItem.hz}"
Nghĩa tiếng Việt chuẩn: "${cardItem.vi}"
Câu học viên dịch: "${userVi}"

Yêu cầu: Chấp nhận từ đồng nghĩa, đại từ xưng hô tương đương (tôi/mình/tớ, bạn/cậu...), hoặc cách diễn đạt khác nhưng ĐÚNG Ý NGHĨA chính của câu gốc.
Chỉ trả về JSON hợp lệ (không giải thích ngoài JSON):
{
  "isCorrect": true,
  "note": "Giải thích ngắn gọn 1 câu vì sao đúng (nhận diện từ đồng nghĩa) hoặc chỉ ra chỗ dịch sai"
}`;
      const parsed = await callOpenRouterJson(prompt, openRouterKey, openRouterModel);
      if (parsed && typeof parsed.isCorrect === 'boolean') {
        return parsed;
      }
    } catch (err) {
      console.warn("OpenRouter grading fallback:", err);
    }
  }

  return { isCorrect: false, note: t("Chưa khớp nghĩa với câu gốc.", "与原句意思尚不匹配。") };
}

async function handleTypingSubmit() {
  const q = quizQuestions[currentQuizIndex];
  if (!q || q.mode !== 'listen_type') return;
  const userAnswer = quizTypingInput.value.trim();
  if (!userAnswer) {
    alert(t("Vui lòng nhập nghĩa tiếng Việt bạn nghe được!", "请输入您听到的越南语意思！"));
    quizTypingInput.focus();
    return;
  }

  quizTypingInput.disabled = true;
  btnSubmitTyping.disabled = true;
  btnSubmitTyping.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${t('Đang chấm...', '评判中...')}`;

  const evalResult = await evaluateVietnameseAnswer(userAnswer, q.item);

  applySrsReviewResult(q.item, evalResult.isCorrect ? 'easy' : 'hard');
  upsertCardToCloud(q.item);

  quizListenHint.classList.add('hidden');
  quizListeningReveal.classList.remove('hidden');

  const fBack = document.getElementById('quizFeedback');
  fBack.classList.remove('hidden');

  if (evalResult.isCorrect) {
    quizScore++;
    fBack.className = "p-3.5 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 space-y-1";
    fBack.innerHTML = `
      <div><i class="fa-solid fa-circle-check mr-1"></i> <b>${t('Chính xác!', '回答正确！')}</b> ${evalResult.note || ''} (${formatNextReviewText(q.item)})</div>
      <div class="text-xs text-emerald-700"><b>${t('Đáp án gốc:', '原答案:')}</b> "${q.item.vi}"</div>
      <div class="text-xs text-slate-600">${q.item.grammar || ''}</div>
    `;
  } else {
    fBack.className = "p-3.5 rounded-xl text-sm font-medium bg-rose-50 text-rose-800 border border-rose-200 space-y-1";
    fBack.innerHTML = `
      <div><i class="fa-solid fa-circle-xmark mr-1"></i> <b>${t('Chưa chính xác!', '回答错误！')}</b> ${evalResult.note || ''} (${t('Đã đưa vào danh sách Cần ôn SRS', '已加入 SRS 待复习列表')})</div>
      <div class="text-xs text-rose-700"><b>${t('Đáp án chuẩn:', '标准答案:')}</b> "${q.item.vi}"</div>
      <div class="text-xs text-slate-600">${q.item.grammar || ''}</div>
    `;
  }

  btnSubmitTyping.innerHTML = `<i class="fa-solid fa-check"></i> ${t('Đã kiểm tra', '已评判')}`;
  document.getElementById('btnNextQuiz').classList.remove('hidden');
  document.getElementById('btnNextQuiz').focus();
}

btnSubmitTyping.addEventListener('click', handleTypingSubmit);
quizTypingInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.isComposing) {
    e.preventDefault();
    handleTypingSubmit();
  }
});

document.getElementById('btnNextQuiz').addEventListener('click', () => {
  currentQuizIndex++;
  renderQuizQuestion();
});

document.getElementById('btnRestartQuiz').addEventListener('click', initDailyQuiz);

// =========================================================================
// HỆ THỐNG SHADOWING (LUYỆN NGHE & NÓI ĐUỔI THEO CÂU BẰNG AI)
// =========================================================================
var DEFAULT_SHADOWING_LESSONS = [
  {
    id: 'lesson_hsk1_intro',
    title: 'Giới thiệu bản thân • 自我介绍',
    hskLevel: 'HSK1',
    sentences: [
      { hz: "你好！我叫李明。", py: "Nǐ hǎo! Wǒ jiào Lǐ Míng.", vi: "Xin chào! Tôi tên là Lý Minh." },
      { hz: "我是越南人，我正在学习汉语。", py: "Wǒ shì Yuènán rén, wǒ zhèngzài xuéxí Hànyǔ.", vi: "Tôi là người Việt Nam, tôi đang học tiếng Trung." },
      { hz: "很高兴认识大家。", py: "Hěn gāoxìng rènshí dàjiā.", vi: "Rất vui được làm quen với mọi người." },
      { hz: "我家有四口人：爸爸、妈妈、姐姐和我。", py: "Wǒ jiā yǒu sì kǒu rén: bàba, māmā, jiějiě hé wǒ.", vi: "Nhà tôi có 4 người: bố, mẹ, chị gái và tôi." },
      { hz: "谢谢！祝大家今天开心！", py: "Xièxie! Zhù dàjiā jīntiān kāixīn!", vi: "Cảm ơn! Chúc mọi người hôm nay vui vẻ!" }
    ]
  },
  {
    id: 'lesson_hsk2_restaurant',
    title: 'Đi ăn tại nhà hàng • 在餐馆吃饭',
    hskLevel: 'HSK2',
    sentences: [
      { hz: "服务员，请给我们一份菜单。", py: "Fúwùyuán, qǐng gěi wǒmen yí fèn càidān.", vi: "Phục vụ ơi, vui lòng cho chúng tôi một cuốn thực đơn." },
      { hz: "你们想吃点儿什么？", py: "Nǐmen xiǎng chī diǎnr shénme?", vi: "Các bạn muốn dùng món gì?" },
      { hz: "我想吃北京烤鸭和炒饭。", py: "Wǒ xiǎng chī Běijīng kǎoyā hé chǎofàn.", vi: "Tôi muốn ăn vịt quay Bắc Kinh và cơm chiên." },
      { hz: "这里的菜味道怎么样？", py: "Zhèlǐ de cài wèidào zěnmeyàng?", vi: "Món ăn ở đây hương vị thế nào?" },
      { hz: "很好吃，但是有点儿辣。", py: "Hěn hǎochī, dànshì yǒudiǎnr là.", vi: "Rất ngon, nhưng có chút hơi cay." },
      { hz: "服务员，我们买单！", py: "Fúwùyuán, wǒmen mǎidān!", vi: "Phục vụ ơi, chúng tôi thanh toán!" }
    ]
  },
  {
    id: 'lesson_hsk3_travel',
    title: 'Kế hoạch du lịch • 旅行计划',
    hskLevel: 'HSK3',
    sentences: [
      { hz: "下个月放假，你打算去哪儿旅游？", py: "Xià gè yuè fàngjià, nǐ dǎsuàn qù nǎr lǚyóu?", vi: "Tháng sau được nghỉ, bạn dự định đi đâu du lịch?" },
      { hz: "我打算和朋友一起去上海和杭州。", py: "Wǒ dǎsuàn hé péngyou yìqǐ qù Shànghǎi hé Hángzhōu.", vi: "Tôi dự định cùng bạn bè đi Thượng Hải và Hàng Châu." },
      { hz: "你已经买好高铁票了吗？", py: "Nǐ yǐjīng mǎihǎo gāotiě piào le ma?", vi: "Bạn đã mua xong vé tàu cao tốc chưa?" },
      { hz: "我已经买好了，酒店也预订了。", py: "Wǒ yǐjīng mǎihǎole, jiǔdiàn yě yùdìngle.", vi: "Tôi đã mua xong rồi, khách sạn cũng đã đặt trước." },
      { hz: "听说秋天的西湖风景非常美丽。", py: "Tīngshuō qiūtiān de Xīhú fēngjǐng fēicháng měilì.", vi: "Nghe nói phong cảnh Tây Hồ vào mùa thu vô cùng xinh đẹp." },
      { hz: "祝你旅途愉快，一路平安！", py: "Zhù nǐ lǚtú yúkuài, yílù píng'ān!", vi: "Chúc bạn chuyến đi vui vẻ, thượng lộ bình an!" }
    ]
  }
];

var shadowingLessons = [];
var currentShadowingLesson = null;
var currentShadowingIndex = 0;
var isShadowingLoop = false;
var isShadowingAutoNext = false;
var shadowingRate = 0.85; // 0.85 bình thường, 0.65 chậm
var showShadowingPinyin = true;
var showShadowingMeaning = true;
var shadowingSpeechTimer = null;
var isShadowingSpeaking = false;

// DOM Elements cho Shadowing
var shadowingHskFilter = document.getElementById('shadowingHskFilter');
var shadowingLessonSelect = document.getElementById('shadowingLessonSelect');
var btnOpenImportShadowingModal = document.getElementById('btnOpenImportShadowingModal');
var shadowingLessonBadge = document.getElementById('shadowingLessonBadge');
var shadowingProgressBadge = document.getElementById('shadowingProgressBadge');
var btnToggleShadowingPinyin = document.getElementById('btnToggleShadowingPinyin');
var shadowingPinyinToggleLabel = document.getElementById('shadowingPinyinToggleLabel');
var btnToggleShadowingMeaning = document.getElementById('btnToggleShadowingMeaning');
var shadowingMeaningToggleLabel = document.getElementById('shadowingMeaningToggleLabel');
var shadowingCardHanzi = document.getElementById('shadowingCardHanzi');
var shadowingCardPinyin = document.getElementById('shadowingCardPinyin');
var shadowingCardMeaning = document.getElementById('shadowingCardMeaning');
var btnShadowingPrev = document.getElementById('btnShadowingPrev');
var btnShadowingNext = document.getElementById('btnShadowingNext');
var btnShadowingSlow = document.getElementById('btnShadowingSlow');
var btnShadowingPlay = document.getElementById('btnShadowingPlay');
var btnShadowingLoop = document.getElementById('btnShadowingLoop');
var btnShadowingAutoNext = document.getElementById('btnShadowingAutoNext');
var shadowingAutoNextLabel = document.getElementById('shadowingAutoNextLabel');
var btnShadowingAddToFlashcard = document.getElementById('btnShadowingAddToFlashcard');
var shadowingLessonSentenceCount = document.getElementById('shadowingLessonSentenceCount');
var shadowingSentencesList = document.getElementById('shadowingSentencesList');

// Modal Elements cho Import Shadowing
var modalImportShadowing = document.getElementById('modalImportShadowing');
var btnCloseImportShadowingModal = document.getElementById('btnCloseImportShadowingModal');
var inputShadowingTitle = document.getElementById('inputShadowingTitle');
var inputShadowingHsk = document.getElementById('inputShadowingHsk');
var inputShadowingText = document.getElementById('inputShadowingText');
var shadowingImportStatus = document.getElementById('shadowingImportStatus');
var btnSubmitImportShadowing = document.getElementById('btnSubmitImportShadowing');

function loadShadowingLessonsFromStorage() {
  const raw = localStorage.getItem('hsk_shadowing_lessons');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        shadowingLessons = parsed;
        return;
      }
    } catch (e) {
      console.warn("Lỗi đọc bài Shadowing:", e);
    }
  }
  shadowingLessons = [...DEFAULT_SHADOWING_LESSONS];
  saveShadowingLessonsToStorage();
}

function saveShadowingLessonsToStorage() {
  try {
    localStorage.setItem('hsk_shadowing_lessons', JSON.stringify(shadowingLessons));
  } catch (e) {
    console.warn("Lỗi lưu bài Shadowing:", e);
  }
}

function renderShadowingLessonsDropdown() {
  if (!shadowingLessonSelect) return;
  const filter = shadowingHskFilter ? shadowingHskFilter.value : 'all';

  const filtered = filter === 'all'
    ? shadowingLessons
    : shadowingLessons.filter(l => (l.hskLevel || 'HSK2') === filter);

  shadowingLessonSelect.innerHTML = '';
  if (filtered.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = t("Chưa có bài ở cấp độ này", "此等级暂无课文");
    shadowingLessonSelect.appendChild(opt);
    return;
  }

  filtered.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.id;
    opt.textContent = `[${l.hskLevel || 'HSK'}] ${l.title}`;
    shadowingLessonSelect.appendChild(opt);
  });

  if (currentShadowingLesson && filtered.some(l => l.id === currentShadowingLesson.id)) {
    shadowingLessonSelect.value = currentShadowingLesson.id;
  } else {
    shadowingLessonSelect.value = filtered[0].id;
    selectShadowingLesson(filtered[0].id);
  }
}

function selectShadowingLesson(lessonId) {
  stopShadowingSpeech();
  const lesson = shadowingLessons.find(l => l.id === lessonId);
  if (!lesson) return;
  currentShadowingLesson = lesson;
  currentShadowingIndex = 0;
  renderShadowingActiveSentence();
  renderShadowingSentencesList();
}

function renderShadowingActiveSentence() {
  if (!currentShadowingLesson || !currentShadowingLesson.sentences.length) {
    if (shadowingCardHanzi) shadowingCardHanzi.textContent = t("Chưa có câu nào trong bài", "课文中暂无句子");
    if (shadowingCardPinyin) shadowingCardPinyin.textContent = "";
    if (shadowingCardMeaning) shadowingCardMeaning.textContent = "";
    return;
  }

  const s = currentShadowingLesson.sentences[currentShadowingIndex];
  if (!s) return;

  if (shadowingCardHanzi) shadowingCardHanzi.textContent = s.hz;
  if (shadowingCardPinyin) {
    shadowingCardPinyin.textContent = s.py || generateLocalPinyin(s.hz);
    shadowingCardPinyin.style.display = showShadowingPinyin ? 'block' : 'none';
  }
  if (shadowingCardMeaning) {
    shadowingCardMeaning.textContent = s.vi || "";
    shadowingCardMeaning.style.display = showShadowingMeaning ? 'block' : 'none';
  }

  if (shadowingLessonBadge) {
    shadowingLessonBadge.textContent = currentShadowingLesson.hskLevel || 'HSK';
  }
  if (shadowingProgressBadge) {
    shadowingProgressBadge.textContent = t(
      `Câu ${currentShadowingIndex + 1} / ${currentShadowingLesson.sentences.length}`,
      `第 ${currentShadowingIndex + 1} / ${currentShadowingLesson.sentences.length} 句`
    );
  }

  highlightActiveSentenceInList();
}

function renderShadowingSentencesList() {
  if (!shadowingSentencesList || !currentShadowingLesson) return;
  const sentences = currentShadowingLesson.sentences || [];

  if (shadowingLessonSentenceCount) {
    shadowingLessonSentenceCount.textContent = t(`${sentences.length} câu`, `${sentences.length} 句`);
  }

  shadowingSentencesList.innerHTML = sentences.map((s, idx) => `
    <div data-shadowing-idx="${idx}"
      class="p-3 sm:px-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${idx === currentShadowingIndex ? 'bg-[#0071E3]/10 border-[#0071E3]/35 shadow-sm' : 'bg-[#F5F5F7] border-black/[0.04] hover:bg-black/[0.03]'}">
      <div class="space-y-0.5 flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-[11px] font-bold ${idx === currentShadowingIndex ? 'text-[#0071E3]' : 'text-[#86868B]'}">#${idx + 1}</span>
          <span class="text-sm sm:text-base font-bold text-[#1D1D1F] truncate">${s.hz}</span>
        </div>
        <p class="text-xs text-[#0071E3] font-medium truncate">${s.py || ''}</p>
        <p class="text-xs text-[#86868B] font-medium truncate">${s.vi || ''}</p>
      </div>
      <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 transition ${idx === currentShadowingIndex ? 'bg-[#0071E3] text-white shadow-sm' : 'bg-black/[0.05] text-[#1D1D1F] hover:bg-black/[0.1]'}">
        <i class="fa-solid fa-play ml-0.5"></i>
      </button>
    </div>
  `).join('');

  shadowingSentencesList.querySelectorAll('[data-shadowing-idx]').forEach(row => {
    row.addEventListener('click', () => {
      const idx = parseInt(row.getAttribute('data-shadowing-idx'), 10);
      if (!isNaN(idx)) {
        currentShadowingIndex = idx;
        renderShadowingActiveSentence();
        playShadowingSentence(currentShadowingIndex);
      }
    });
  });
}

function highlightActiveSentenceInList() {
  if (!shadowingSentencesList) return;
  shadowingSentencesList.querySelectorAll('[data-shadowing-idx]').forEach(row => {
    const idx = parseInt(row.getAttribute('data-shadowing-idx'), 10);
    const isActive = idx === currentShadowingIndex;
    row.className = `p-3 sm:px-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${isActive ? 'bg-[#0071E3]/10 border-[#0071E3]/35 shadow-sm' : 'bg-[#F5F5F7] border-black/[0.04] hover:bg-black/[0.03]'}`;
    const btn = row.querySelector('button');
    if (btn) {
      btn.className = `w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 transition ${isActive ? 'bg-[#0071E3] text-white shadow-sm' : 'bg-black/[0.05] text-[#1D1D1F] hover:bg-black/[0.1]'}`;
    }
  });
}

function stopShadowingSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (shadowingSpeechTimer) {
    clearTimeout(shadowingSpeechTimer);
    shadowingSpeechTimer = null;
  }
  isShadowingSpeaking = false;
  if (btnShadowingPlay) {
    btnShadowingPlay.innerHTML = '<i class="fa-solid fa-play ml-0.5"></i>';
    btnShadowingPlay.classList.remove('bg-[#34C759]');
    btnShadowingPlay.classList.add('bg-[#0071E3]');
  }
}

function playShadowingSentence(index) {
  if (!currentShadowingLesson || !currentShadowingLesson.sentences.length) return;
  const s = currentShadowingLesson.sentences[index];
  if (!s || !s.hz || !('speechSynthesis' in window)) return;

  stopShadowingSpeech();
  isShadowingSpeaking = true;

  if (btnShadowingPlay) {
    btnShadowingPlay.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    btnShadowingPlay.classList.remove('bg-[#0071E3]');
    btnShadowingPlay.classList.add('bg-[#34C759]');
  }

  const utterance = new SpeechSynthesisUtterance(s.hz);
  utterance.lang = 'zh-CN';
  utterance.rate = shadowingRate;

  utterance.onend = () => {
    isShadowingSpeaking = false;
    if (btnShadowingPlay) {
      btnShadowingPlay.innerHTML = '<i class="fa-solid fa-play ml-0.5"></i>';
      btnShadowingPlay.classList.remove('bg-[#34C759]');
      btnShadowingPlay.classList.add('bg-[#0071E3]');
    }

    if (isShadowingLoop) {
      shadowingSpeechTimer = setTimeout(() => {
        playShadowingSentence(currentShadowingIndex);
      }, 800);
    } else if (isShadowingAutoNext) {
      // Chờ 2.5s để người học đọc đuổi (Shadowing) theo, sau đó tự chuyển sang câu tiếp theo
      shadowingSpeechTimer = setTimeout(() => {
        if (currentShadowingIndex < currentShadowingLesson.sentences.length - 1) {
          currentShadowingIndex++;
          renderShadowingActiveSentence();
          playShadowingSentence(currentShadowingIndex);
        } else {
          isShadowingSpeaking = false;
        }
      }, 2500);
    }
  };

  utterance.onerror = () => {
    isShadowingSpeaking = false;
    if (btnShadowingPlay) {
      btnShadowingPlay.innerHTML = '<i class="fa-solid fa-play ml-0.5"></i>';
      btnShadowingPlay.classList.remove('bg-[#34C759]');
      btnShadowingPlay.classList.add('bg-[#0071E3]');
    }
  };

  window.speechSynthesis.speak(utterance);
}

// Gắn sự kiện các nút điều khiển Shadowing
if (btnShadowingPlay) {
  btnShadowingPlay.addEventListener('click', () => {
    if (isShadowingSpeaking) {
      stopShadowingSpeech();
    } else {
      playShadowingSentence(currentShadowingIndex);
    }
  });
}

if (btnShadowingPrev) {
  btnShadowingPrev.addEventListener('click', () => {
    if (!currentShadowingLesson) return;
    if (currentShadowingIndex > 0) {
      currentShadowingIndex--;
      renderShadowingActiveSentence();
      playShadowingSentence(currentShadowingIndex);
    }
  });
}

if (btnShadowingNext) {
  btnShadowingNext.addEventListener('click', () => {
    if (!currentShadowingLesson) return;
    if (currentShadowingIndex < currentShadowingLesson.sentences.length - 1) {
      currentShadowingIndex++;
      renderShadowingActiveSentence();
      playShadowingSentence(currentShadowingIndex);
    }
  });
}

if (btnShadowingSlow) {
  btnShadowingSlow.addEventListener('click', () => {
    shadowingRate = shadowingRate === 0.85 ? 0.60 : 0.85;
    if (shadowingRate === 0.60) {
      btnShadowingSlow.className = "w-10 h-10 rounded-full bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/30 flex items-center justify-center apple-btn text-xs shadow-sm";
    } else {
      btnShadowingSlow.className = "w-10 h-10 rounded-full bg-white hover:bg-black/[0.04] text-[#1D1D1F] border border-black/[0.08] flex items-center justify-center apple-btn text-xs shadow-sm";
    }
    playShadowingSentence(currentShadowingIndex);
  });
}

if (btnShadowingLoop) {
  btnShadowingLoop.addEventListener('click', () => {
    isShadowingLoop = !isShadowingLoop;
    if (isShadowingLoop) {
      isShadowingAutoNext = false;
      if (btnShadowingAutoNext) {
        btnShadowingAutoNext.className = "text-xs px-3 py-2 rounded-full bg-black/[0.04] text-[#86868B] border border-black/[0.06] font-medium apple-btn flex items-center gap-1.5";
        if (shadowingAutoNextLabel) shadowingAutoNextLabel.textContent = t("Tự chuyển: TẮT", "自动换句: 关");
      }
      btnShadowingLoop.className = "w-10 h-10 rounded-full bg-[#FF9500]/15 text-[#FF9500] border border-[#FF9500]/30 flex items-center justify-center apple-btn text-xs shadow-sm";
    } else {
      btnShadowingLoop.className = "w-10 h-10 rounded-full bg-white hover:bg-black/[0.04] text-[#86868B] border border-black/[0.08] flex items-center justify-center apple-btn text-xs shadow-sm";
      stopShadowingSpeech();
    }
  });
}

if (btnShadowingAutoNext) {
  btnShadowingAutoNext.addEventListener('click', () => {
    isShadowingAutoNext = !isShadowingAutoNext;
    if (isShadowingAutoNext) {
      isShadowingLoop = false;
      if (btnShadowingLoop) {
        btnShadowingLoop.className = "w-10 h-10 rounded-full bg-white hover:bg-black/[0.04] text-[#86868B] border border-black/[0.08] flex items-center justify-center apple-btn text-xs shadow-sm";
      }
      btnShadowingAutoNext.className = "text-xs px-3 py-2 rounded-full bg-[#34C759]/15 text-[#1D8338] border border-[#34C759]/30 font-semibold apple-btn flex items-center gap-1.5";
      if (shadowingAutoNextLabel) shadowingAutoNextLabel.textContent = t("Tự chuyển: BẬT", "自动换句: 开");
      playShadowingSentence(currentShadowingIndex);
    } else {
      btnShadowingAutoNext.className = "text-xs px-3 py-2 rounded-full bg-black/[0.04] text-[#86868B] border border-black/[0.06] font-medium apple-btn flex items-center gap-1.5";
      if (shadowingAutoNextLabel) shadowingAutoNextLabel.textContent = t("Tự chuyển: TẮT", "自动换句: 关");
      stopShadowingSpeech();
    }
  });
}

if (btnToggleShadowingPinyin) {
  btnToggleShadowingPinyin.addEventListener('click', () => {
    showShadowingPinyin = !showShadowingPinyin;
    if (shadowingPinyinToggleLabel) {
      shadowingPinyinToggleLabel.textContent = showShadowingPinyin
        ? t("Pinyin: BẬT", "拼音: 开")
        : t("Pinyin: TẮT", "拼音: 关");
    }
    btnToggleShadowingPinyin.className = showShadowingPinyin
      ? "text-xs px-2.5 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/25 font-semibold apple-btn flex items-center gap-1"
      : "text-xs px-2.5 py-1 rounded-full bg-black/[0.04] text-[#86868B] border border-black/[0.06] font-medium apple-btn flex items-center gap-1";
    renderShadowingActiveSentence();
  });
}

if (btnToggleShadowingMeaning) {
  btnToggleShadowingMeaning.addEventListener('click', () => {
    showShadowingMeaning = !showShadowingMeaning;
    if (shadowingMeaningToggleLabel) {
      shadowingMeaningToggleLabel.textContent = showShadowingMeaning
        ? t("Nghĩa: BẬT", "释义: 开")
        : t("Nghĩa: TẮT", "释义: 关");
    }
    btnToggleShadowingMeaning.className = showShadowingMeaning
      ? "text-xs px-2.5 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/25 font-semibold apple-btn flex items-center gap-1"
      : "text-xs px-2.5 py-1 rounded-full bg-black/[0.04] text-[#86868B] border border-black/[0.06] font-medium apple-btn flex items-center gap-1";
    renderShadowingActiveSentence();
  });
}

if (btnShadowingAddToFlashcard) {
  btnShadowingAddToFlashcard.addEventListener('click', async () => {
    if (!currentShadowingLesson || !currentShadowingLesson.sentences.length) return;
    const s = currentShadowingLesson.sentences[currentShadowingIndex];
    if (!s) return;

    const targetFolder = currentShadowingLesson.title || "Shadowing";
    if (!customFolders.includes(targetFolder)) {
      customFolders.push(targetFolder);
      saveCustomFolders(customFolders);
    }

    const newCard = {
      id: Date.now(),
      hz: s.hz,
      py: s.py || generateLocalPinyin(s.hz),
      vi: s.vi || "",
      grammar: `• Trích từ bài Shadowing: ${currentShadowingLesson.title} (${currentShadowingLesson.hskLevel || 'HSK'})`,
      folder: targetFolder,
      status: 'new',
      reviews: 0,
      nextReview: 0,
      intervalDays: 0,
      wrongCount: 0,
      lastReviewed: 0
    };

    cards.push(newCard);
    saveToLocalStorage();
    refreshAllFolderSelectors();
    updateStatsSummary();
    await upsertCardToCloud(newCard);

    alert(t(
      `Đã lưu câu "${s.hz}" vào bộ thẻ Flashcards "${targetFolder}"!`,
      `已成功将句子 "${s.hz}" 存入牌组 "${targetFolder}"！`
    ));
  });
}

if (shadowingLessonSelect) {
  shadowingLessonSelect.addEventListener('change', () => {
    selectShadowingLesson(shadowingLessonSelect.value);
  });
}

if (shadowingHskFilter) {
  shadowingHskFilter.addEventListener('change', () => {
    renderShadowingLessonsDropdown();
  });
}

// Modal Import Shadowing
if (btnOpenImportShadowingModal) {
  btnOpenImportShadowingModal.addEventListener('click', () => {
    if (modalImportShadowing) {
      if (inputShadowingTitle) inputShadowingTitle.value = '';
      if (inputShadowingText) inputShadowingText.value = '';
      if (shadowingImportStatus) {
        shadowingImportStatus.className = 'hidden';
        shadowingImportStatus.textContent = '';
      }
      modalImportShadowing.classList.remove('hidden');
    }
  });
}

if (btnCloseImportShadowingModal) {
  btnCloseImportShadowingModal.addEventListener('click', () => {
    if (modalImportShadowing) modalImportShadowing.classList.add('hidden');
  });
}

if (btnSubmitImportShadowing) {
  btnSubmitImportShadowing.addEventListener('click', async () => {
    const rawText = inputShadowingText ? inputShadowingText.value.trim() : '';
    const title = inputShadowingTitle ? inputShadowingTitle.value.trim() : '';
    const hskLevel = inputShadowingHsk ? inputShadowingHsk.value : 'auto';

    if (!rawText) {
      alert(t("Vui lòng nhập đoạn văn bản tiếng Trung!", "请输入中文段落文本！"));
      if (inputShadowingText) inputShadowingText.focus();
      return;
    }

    btnSubmitImportShadowing.disabled = true;
    btnSubmitImportShadowing.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${t('Đang phân tích và tách câu bằng AI...', 'AI正在解析与分句...')}`;

    if (shadowingImportStatus) {
      shadowingImportStatus.className = 'p-3 rounded-2xl text-xs font-medium bg-[#0071E3]/10 text-[#0071E3]';
      shadowingImportStatus.textContent = t("Đang gọi AI phân tích ngữ nghĩa, pinyin và đánh giá HSK...", "正在调用 AI 分析语义、拼音与评估 HSK 等级...");
    }

    try {
      const result = await analyzeShadowingTextWithAI(rawText, title, hskLevel);
      if (!result || !result.sentences || result.sentences.length === 0) {
        throw new Error(t("Không tách được câu nào từ văn bản đã nhập!", "未能从文本中提取出有效句子！"));
      }

      const newLesson = {
        id: `shadowing_${Date.now()}`,
        title: result.title || title || t('Bài đọc Shadowing mới', '新跟读课文'),
        hskLevel: result.hskLevel || 'HSK2',
        sentences: result.sentences
      };

      shadowingLessons.unshift(newLesson);
      saveShadowingLessonsToStorage();

      if (shadowingHskFilter) shadowingHskFilter.value = 'all';
      renderShadowingLessonsDropdown();
      selectShadowingLesson(newLesson.id);

      if (modalImportShadowing) modalImportShadowing.classList.add('hidden');
      alert(t(
        `Đã tạo thành công bài đọc "${newLesson.title}" (${newLesson.hskLevel}) với ${newLesson.sentences.length} câu!`,
        `成功创建课文 "${newLesson.title}" (${newLesson.hskLevel})，共 ${newLesson.sentences.length} 句！`
      ));
    } catch (err) {
      if (shadowingImportStatus) {
        shadowingImportStatus.className = 'p-3 rounded-2xl text-xs font-medium bg-[#FF3B30]/10 text-[#FF3B30]';
        shadowingImportStatus.textContent = err.message || t("Lỗi khi phân tích bằng AI!", "AI解析出错！");
      }
    } finally {
      btnSubmitImportShadowing.disabled = false;
      btnSubmitImportShadowing.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>${t('Phân tích & Tách câu bằng AI', 'AI解析课文')}</span>`;
    }
  });
}

function initShadowingModule() {
  loadShadowingLessonsFromStorage();
  renderShadowingLessonsDropdown();
  if (shadowingLessons.length > 0 && !currentShadowingLesson) {
    selectShadowingLesson(shadowingLessons[0].id);
  }
}

// =========================================================================
// KHỞI ĐỘNG ỨNG DỤNG & PHỤC HỒI PHIÊN ĐĂNG NHẬP
// =========================================================================
window.refreshAllFolderSelectors = refreshAllFolderSelectors;
window.applyFilter = applyFilter;
window.updateCardUI = updateCardUI;
window.renderDecksOverview = renderDecksOverview;
window.renderList = renderList;
window.initDailyQuiz = initDailyQuiz;
window.switchTab = switchTab;
window.initShadowingModule = initShadowingModule;
window.updateQuizModeButtonsUI = updateQuizModeButtonsUI;

async function initAuthAndStartApp() {
  initThemeUI();
  updateDirectionButtonUI();
  applyPinyinBlurStyle();
  updateAutoSpeakButtonUI();
  updateQuizModeButtonsUI();
  applyLanguageUI(uiLang);
  initSupabase();

  const rawSession = localStorage.getItem('hsk_auth_session') || sessionStorage.getItem('hsk_auth_session');
  if (rawSession && supabaseClient) {
    try {
      const parsed = JSON.parse(rawSession);
      if (parsed && parsed.username && parsed.passwordHash) {
        const dbUser = await fetchUserByUsernameFromDB(parsed.username);
        if (dbUser && dbUser.passwordHash === parsed.passwordHash) {
          await completeLoginSession(dbUser, Boolean(localStorage.getItem('hsk_auth_session')));
          return;
        }
      }
    } catch (err) {
      console.warn("Session restore failed:", err);
    }
  }

  await checkDatabaseAuthSetup();
}

window.initAuthAndStartApp = initAuthAndStartApp;

// Khởi chạy khi tài liệu tải xong hoặc ngay lập tức nếu DOM đã sẵn sàng
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthAndStartApp);
} else {
  initAuthAndStartApp();
}

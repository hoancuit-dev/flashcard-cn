// =========================================================================
// js/srs.js - THUẬT TOÁN SRS, DỮ LIỆU MẪU & XỬ LÝ METADATA THƯ MỤC
// =========================================================================

// Dữ liệu 39 câu tiếng Trung mặc định ban đầu
var initialData = [
  { hz: "你平常什么时候有空呢？", py: "Nǐ píngcháng shénme shíhou yǒukòng ne?", vi: "Bình thường khi nào bạn rảnh rỗi thế?", grammar: "• 平常 (píngcháng): bình thường | 什么时候: khi nào | 有空: rảnh rỗi." },
  { hz: "在家的时候，我喜欢听播客什么的。", py: "Zài jiā de shíhou, wǒ xǐhuan tīng bōkè shénme de.", vi: "Lúc ở nhà, tôi thích nghe podcast này nọ/chẳng hạn.", grammar: "• ...的时候: khi/lúc... | 什么的: vân vân, các thứ tương tự." },
  { hz: "你看电影、电视剧什么的吗？", py: "Nǐ kàn diànyǐng, diànshìjù shénme de ma?", vi: "Bạn có xem phim điện ảnh, phim truyền hình này nọ không?", grammar: "• 电影: phim chiếu rạp | 电视剧: phim bộ truyền hình." },
  { hz: "我喜欢运动，我经常跑步。", py: "Wǒ xǐhuan yùndòng, wǒ jīngcháng pǎobù.", vi: "Tôi thích vận động, tôi thường xuyên chạy bộ.", grammar: "• 运动: vận động | 经常: thường xuyên." },
  { hz: "他可能不喜欢看电视剧什么的。", py: "Tā kěnéng bù xǐhuan kàn diànshìjù shénme de.", vi: "Anh ấy có thể không thích xem phim truyền hình này nọ.", grammar: "• 可能: có thể, có lẽ." },
  { hz: "我觉得游泳比跑步好。", py: "Wǒ juéde yóuyǒng bǐ pǎobù hǎo.", vi: "Tôi cảm thấy bơi lội tốt hơn chạy bộ.", grammar: "• 觉得: cảm thấy | A 比 B + Tính từ (so sánh hơn)." },
  { hz: "我平常喜欢吃米饭、面条儿什么的。", py: "Wǒ píngcháng xǐhuan chī mǐfàn, miàntiáor shénme de.", vi: "Bình thường tôi thích ăn cơm, mì sợi này nọ.", grammar: "• 米饭: cơm | 面条儿: mì sợi." },
  { hz: "有空儿的时候，我经常和朋友跳舞。", py: "Yǒukòngr de shíhou, wǒ jīngcháng hé péngyou tiàowǔ.", vi: "Lúc có thời gian rảnh, tôi thường nhảy múa cùng bạn bè.", grammar: "• 和...一起: cùng với | 跳舞: nhảy múa." },
  { hz: "我的习惯是起床后先去跑步。", py: "Wǒ de xíguàn shì qǐchuáng hòu xiān qù pǎobù.", vi: "Thói quen của tôi là thức dậy xong thì đi chạy bộ trước.", grammar: "• 习惯: thói quen | 起床后: sau khi thức dậy." },
  { hz: "画画儿的时候，他非常安静。", py: "Huà huàr de shíhou, tā fēicháng ānjìng.", vi: "Lúc vẽ tranh, anh ấy vô cùng yên tĩnh.", grammar: "• 画画儿: vẽ tranh | 安静: yên tĩnh." },
  { hz: "画树的时候，我的习惯是先画树叶。", py: "Huà shù de shíhou, wǒ de xíguàn shì xiān huà shùyè.", vi: "Khi vẽ cây, thói quen của tôi là vẽ lá cây trước.", grammar: "• 树: cây | 树叶: lá cây." },
  { hz: "我经常读书，比如小说。", py: "Wǒ jīngcháng dúshū, bǐrú xiǎoshuō.", vi: "Tôi thường đọc sách, ví dụ như tiểu thuyết.", grammar: "• 读书: đọc sách | 比如: ví dụ như | 小说: tiểu thuyết." },
  { hz: "我喜欢读书，比如小说。", py: "Wǒ xǐhuan dúshū, bǐrú xiǎoshuō.", vi: "Tôi thích đọc sách, ví dụ như tiểu thuyết.", grammar: "• Dùng 比如 để đưa ví dụ cụ thể." },
  { hz: "你想不想和我一起去散步？", py: "Nǐ xiǎng bu xiǎng hé wǒ yìqǐ qù sànbù?", vi: "Bạn có muốn cùng tôi đi dạo bộ không?", grammar: "• 想不想: câu hỏi chính phản | 散步: đi dạo." },
  { hz: "休息的时候，你听播客什么的吗？", py: "Xiūxi de shíhou, nǐ tīng bōkè shénme de ma?", vi: "Khi nghỉ ngơi, bạn có nghe podcast này nọ không?", grammar: "• 休息: nghỉ ngơi." },
  { hz: "她老是看电视剧什么的。", py: "Tā lǎoshì kàn diànshìjù shénme de.", vi: "Cô ấy suốt ngày/luôn luôn xem phim truyền hình các kiểu.", grammar: "• 老是: cứ luôn, suốt ngày." },
  { hz: "我喜欢干净的动物，比如说猫。", py: "Wǒ xǐhuan gānjìng de dòngwù, bǐrú shuō māo.", vi: "Tôi thích động vật sạch sẽ, chẳng hạn như mèo.", grammar: "• 干净: sạch sẽ | 比如说: ví dụ như là." },
  { hz: "下次我们一起去跳舞吧！", py: "Xià cì wǒmen yìqǐ qù tiàowǔ ba!", vi: "Lần sau chúng ta cùng nhau đi khiêu vũ nhé!", grammar: "• 下次: lần sau | ...吧: lời đề nghị." },
  { hz: "你最喜欢去哪里散步？", py: "Nǐ zuì xǐhuan qù nǎlǐ sànbù?", vi: "Bạn thích đi dạo ở đâu nhất?", grammar: "• 最: nhất | 哪里: ở đâu." },
  { hz: "我经常读小说，例如美国小说和中国小说。", py: "Wǒ jīngcháng dú xiǎoshuō, lìrú Měiguó xiǎoshuō hé Zhōngguó xiǎoshuō.", vi: "Tôi thường đọc tiểu thuyết, ví dụ tiểu thuyết Mỹ và Trung Quốc.", grammar: "• 例如: ví dụ như." },
  { hz: "跳舞难不难？", py: "Tiàowǔ nán bu nán?", vi: "Nhảy múa có khó không/khiêu vũ rất khó không?", grammar: "• 难: khó." },
  { hz: "跳舞有点儿难。", py: "Tiàowǔ yǒudiǎnr nán.", vi: "Nhảy múa/khiêu vũ hơi khó một chút.", grammar: "• 有点儿 + Tính từ: hơi..." },
  { hz: "我平常吃饭的时候，喜欢喝奶茶、可乐什么的。", py: "Wǒ píngcháng chīfàn de shíhou, xǐhuan hē nǎichá, kělè shénme de.", vi: "Lúc ăn cơm, tôi thích uống trà sữa, coca này nọ.", grammar: "• 奶茶: trà sữa | 可乐: coca." },
  { hz: "我的习惯是晚饭后去散步。", py: "Wǒ de xíguàn shì wǎnfàn hòu qù sànbù.", vi: "Thói quen của tôi là đi dạo sau bữa tối.", grammar: "• 晚饭后: sau bữa tối." },
  { hz: "我经常去跳舞。", py: "Wǒ jīngcháng qù tiàowǔ.", vi: "Tôi thường xuyên đi nhảy/khiêu vũ.", grammar: "• Thói quen thường xuyên." },
  { hz: "我觉得你不喜欢听播客什么的。", py: "Wǒ juéde nǐ bù xǐhuan tīng bōkè shénme de.", vi: "Tôi thấy bạn dường như không thích nghe podcast này nọ.", grammar: "• Phán đoán cá nhân." },
  { hz: "我喜欢运动，比如说跑步。", py: "Wǒ xǐhuan yùndòng, bǐrú shuō pǎobù.", vi: "Tôi thích thể thao vận động, ví dụ như là chạy bộ.", grammar: "• 比如说: ví dụ như là." },
  { hz: "去哪里滑雪最好？", py: "Qù nǎlǐ huáxuě zuì hǎo?", vi: "Đi đâu trượt tuyết là tốt nhất?", grammar: "• 滑雪: trượt tuyết | 最好: tốt nhất." },
  { hz: "我家里有很多动物，例如猫和狗。", py: "Wǒ jiā lǐ yǒu hěn duō dòngwù, lìrú māo hé gǒu.", vi: "Nhà tôi có rất nhiều thú cưng, chẳng hạn như mèo và chó.", grammar: "• 很多: nhiều | 狗: chó." },
  { hz: "我的爱好是画画儿。", py: "Wǒ de àihào shì huà huàr.", vi: "Sở thích của tôi là vẽ tranh.", grammar: "• 爱好: sở thích." },
  { hz: "我一般不和别人一起跳舞。", py: "Wǒ yìbān bù hé biérén yìqǐ tiàowǔ.", vi: "Tôi thường không nhảy cùng người khác.", grammar: "• 一般: thông thường." },
  { hz: "今天晚上你有空儿吗？", py: "Jīntiān wǎnshang nǐ yǒu kòngr ma?", vi: "Tối hôm nay bạn có rảnh không?", grammar: "• 有空儿: rảnh rỗi." },
  { hz: "有空儿的时候，我一般去公园散步。", py: "Yǒukòngr de shíhou, wǒ yìbān qù gōngyuán sànbù.", vi: "Lúc rảnh rỗi, tôi thường đến công viên đi dạo.", grammar: "• 公园: công viên." },
  { hz: "我喜欢爬山什么的。", py: "Wǒ xǐhuan páshān shénme de.", vi: "Tôi thích leo núi này nọ.", grammar: "• 爬山: leo núi." },
  { hz: "我一般下午有空儿。", py: "Wǒ yìbān xiàwǔ yǒu kòngr.", vi: "Tôi thường rảnh vào buổi chiều.", grammar: "• 下午: buổi chiều." },
  { hz: "滑雪也是你的爱好吗？", py: "Huáxuě yě shì nǐ de àihào ma?", vi: "Trượt tuyết cũng là sở thích của bạn à?", grammar: "• 也: cũng." },
  { hz: "我觉得滑雪很酷。", py: "Wǒ juéde huáxuě hěn kù.", vi: "Tôi thấy trượt tuyết rất ngầu.", grammar: "• 酷: ngầu, phong cách." },
  { hz: "跑步是我的爱好。", py: "Pǎobù shì wǒ de àihào.", vi: "Chạy bộ là sở thích của tôi.", grammar: "• Động từ làm chủ ngữ." },
  { hz: "我觉得游泳很舒服。", py: "Wǒ juéde yóuyǒng hěn shūfu.", vi: "Tôi cảm thấy bơi lội rất thoải mái, dễ chịu.", grammar: "• 舒服: thoải mái." },
  { hz: "我喜欢动物，比如说猫和狗。", py: "Wǒ xǐhuan dòngwù, bǐrú shuō māo hé gǒu.", vi: "Tôi thích động vật, ví dụ như chó và mèo.", grammar: "• 比如说: ví dụ như." }
];

var DEFAULT_FOLDER = "Mặc định";
var META_REGEX = new RegExp('\\n?(?:\\[\\[META:(.*?)\\]\\]|\\x3c!--meta:(.*?)--\\x3e|< !--meta:(.*?)- ->)\\s*$', 's');
var DAY_MS = 24 * 60 * 60 * 1000;

// Phát âm giọng đọc tiếng Trung
function speakChinese(text, rate = 0.85) {
  if (!text || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}

// Đóng gói metadata bộ thẻ và tiến trình SRS theo từng User vào grammar
function packCardForCloud(card) {
  const cleanGrammar = (card.grammar || '').replace(META_REGEX, '').trim();
  const userMap = { ...(card._userProgressMap || {}) };

  if (window.currentUser && window.currentUser.username) {
    userMap[window.currentUser.username] = {
      s: card.status || 'new',
      r: card.reviews || 0,
      nr: card.nextReview || 0,
      iv: card.intervalDays || 0,
      wc: card.wrongCount || 0,
      lr: card.lastReviewed || 0
    };
    card._userProgressMap = userMap;
  }

  const isOwner = !window.currentUser || window.currentUser.role === 'owner';
  const ownerRoot = isOwner
    ? {
      status: card.status || 'new',
      reviews: card.reviews || 0,
      nr: card.nextReview || 0,
      iv: card.intervalDays || 0,
      wc: card.wrongCount || 0,
      lr: card.lastReviewed || 0
    }
    : (card._ownerRoot || {
      status: 'new',
      reviews: 0,
      nr: 0,
      iv: 0,
      wc: 0,
      lr: 0
    });

  card._ownerRoot = ownerRoot;

  const meta = {
    f: card.folder || DEFAULT_FOLDER,
    nr: ownerRoot.nr || 0,
    iv: ownerRoot.iv || 0,
    wc: ownerRoot.wc || 0,
    lr: ownerRoot.lr || 0,
    u: userMap
  };
  return {
    id: card.id,
    hz: card.hz,
    py: card.py || '',
    vi: card.vi,
    grammar: `${cleanGrammar}\n[[META:${JSON.stringify(meta)}]]`,
    status: ownerRoot.status || 'new',
    reviews: ownerRoot.reviews || 0,
    updated_at: new Date().toISOString()
  };
}

// Trích xuất metadata bộ thẻ & tiến trình riêng của user hiện tại
function unpackCardFromStorage(rawCard) {
  const rawGrammar = rawCard.grammar || '';
  const match = rawGrammar.match(META_REGEX);
  let meta = {};
  if (match) {
    const jsonStr = match[1] || match[2] || match[3];
    if (jsonStr) {
      try { meta = JSON.parse(jsonStr); } catch { }
    }
  }
  const cleanGrammar = rawGrammar.replace(META_REGEX, '').trim();
  const folder = (rawCard.folder && rawCard.folder !== DEFAULT_FOLDER)
    ? rawCard.folder
    : (meta.f || rawCard.folder || DEFAULT_FOLDER);

  const ownerRoot = rawCard._ownerRoot || {
    status: (rawCard.status && rawCard.status !== '__user__' && rawCard.status !== '__sys__') ? rawCard.status : 'new',
    reviews: rawCard.reviews || 0,
    nr: (meta.nr !== undefined ? meta.nr : rawCard.nextReview) || 0,
    iv: (meta.iv !== undefined ? meta.iv : rawCard.intervalDays) || 0,
    wc: (meta.wc !== undefined ? meta.wc : rawCard.wrongCount) || 0,
    lr: (meta.lr !== undefined ? meta.lr : rawCard.lastReviewed) || 0
  };

  const userMap = { ...(rawCard._userProgressMap || {}), ...(meta.u || {}) };
  const uname = window.currentUser ? window.currentUser.username : null;
  const isOwner = !window.currentUser || window.currentUser.role === 'owner';

  let userStatus = 'new';
  let userReviews = 0;
  let userNr = 0;
  let userIv = 0;
  let userWc = 0;
  let userLr = 0;

  if (uname && userMap[uname]) {
    const up = userMap[uname];
    userStatus = up.s || 'new';
    userReviews = up.r || 0;
    userNr = up.nr || 0;
    userIv = up.iv || 0;
    userWc = up.wc || 0;
    userLr = up.lr || 0;
  } else if (isOwner) {
    userStatus = ownerRoot.status || 'new';
    userReviews = ownerRoot.reviews || 0;
    userNr = ownerRoot.nr || 0;
    userIv = ownerRoot.iv || 0;
    userWc = ownerRoot.wc || 0;
    userLr = ownerRoot.lr || 0;
  }

  return {
    ...rawCard,
    grammar: cleanGrammar,
    folder,
    nextReview: userNr,
    intervalDays: userIv,
    wrongCount: userWc,
    lastReviewed: userLr,
    status: userStatus,
    reviews: userReviews,
    _ownerRoot: ownerRoot,
    _userProgressMap: userMap
  };
}

// Kiểm tra xem thẻ có đến hạn ôn tập SRS hôm nay không
function isCardDueForSRS(card) {
  const now = Date.now();
  // 1. Thẻ đang ở trạng thái Chưa nhớ / Khó
  if (card.status === 'hard') return true;
  // 2. Thẻ trả lời sai nhiều lần mà chưa thuộc vững
  if ((card.wrongCount || 0) > 0 && card.status !== 'mastered') return true;
  // 3. Thẻ đã từng học và đã đến / quá hạn ôn tập tiếp theo
  if (card.nextReview && card.nextReview <= now) return true;
  // 4. Thẻ đã học lâu ngày (> 3 ngày) nhưng chưa có lịch hẹn
  if (card.lastReviewed && !card.nextReview && (now - card.lastReviewed > 3 * DAY_MS)) return true;
  return false;
}

// Điểm ưu tiên xuất hiện trong bài kiểm tra hoặc chế độ ôn tập
function getSrsPriorityScore(card) {
  const now = Date.now();
  let score = 0;
  if (card.status === 'hard') score += 100;
  score += (card.wrongCount || 0) * 30;
  if (card.nextReview && card.nextReview <= now) {
    const overdueDays = Math.min(30, (now - card.nextReview) / DAY_MS);
    score += 50 + overdueDays * 2;
  }
  if (!card.reviews || card.status === 'new') score += 15;
  return score;
}

// Cập nhật khoảng cách lặp lại ngắt quãng theo đánh giá
function applySrsReviewResult(card, rating) {
  // rating: 'hard' (Chưa nhớ / Trả lời sai) | 'good' (Bình thường) | 'easy' (Đã nhớ / Trả lời đúng)
  const now = Date.now();
  card.reviews = (card.reviews || 0) + 1;
  card.lastReviewed = now;

  if (rating === 'hard') {
    card.status = 'hard';
    card.intervalDays = 0;
    card.nextReview = now; // Cần ôn lại ngay trong ngày
    card.wrongCount = (card.wrongCount || 0) + 1;
  } else if (rating === 'good') {
    card.status = 'learning';
    const prevIv = card.intervalDays || 0;
    card.intervalDays = prevIv < 1 ? 1 : Math.min(30, Math.round(prevIv * 2));
    card.nextReview = now + card.intervalDays * DAY_MS;
    if (card.wrongCount > 0) card.wrongCount = Math.max(0, card.wrongCount - 1);
  } else if (rating === 'easy') {
    const prevIv = card.intervalDays || 0;
    card.intervalDays = prevIv < 3 ? 3 : Math.min(90, Math.round(prevIv * 2.2));
    card.status = 'mastered';
    card.nextReview = now + card.intervalDays * DAY_MS;
    card.wrongCount = 0;
  }
}

// Định dạng văn bản hiển thị lịch ôn tập
function formatNextReviewText(card) {
  if (card.status === 'hard') {
    return card.wrongCount > 0
      ? t(`⚠️ Hay sai (${card.wrongCount} lần) • Ôn ngay`, `⚠️ 易错 (${card.wrongCount}次) • 立即复习`)
      : t(`⚠️ Cần ôn ngay`, `⚠️ 需立即复习`);
  }
  if (!card.nextReview) return t("Chưa có lịch hẹn", "暂无复习计划");
  const diffMs = card.nextReview - Date.now();
  if (diffMs <= 0) return t("🔥 Đến hạn ôn hôm nay", "🔥 今日到期需复习");
  const days = Math.ceil(diffMs / DAY_MS);
  return t(`⏳ Ôn sau ${days} ngày`, `⏳ ${days}天后复习`);
}

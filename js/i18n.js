/**
 * js/i18n.js
 * Quản lý ngôn ngữ hiển thị giao diện: Tiếng Việt (vi) | Tiếng Trung (zh) | Song ngữ (bi).
 */
window.HSK = window.HSK || {};

var uiLang = localStorage.getItem('cfg_ui_lang') || 'bi'; // 'vi' | 'zh' | 'bi'

function t(viStr, zhStr) {
  if (uiLang === 'vi') return viStr;
  if (uiLang === 'zh') return zhStr;
  return `${viStr} • ${zhStr}`;
}

function setElText(id, viStr, zhStr) {
  const el = document.getElementById(id);
  if (el) el.textContent = t(viStr, zhStr);
}

function applyLanguageUI(newLang) {
  if (newLang) {
    uiLang = newLang;
    window.uiLang = newLang;
    localStorage.setItem('cfg_ui_lang', uiLang);
  }

    // Cập nhật trạng thái nút chọn ngôn ngữ trên cả Trang Đăng nhập và Header chính
    document.querySelectorAll('.lang-switch-btn').forEach(btn => {
      const code = btn.getAttribute('data-lang-switch');
      const isActive = code === uiLang;
      const inAuth = Boolean(btn.closest('#authScreen'));
      if (inAuth) {
        btn.className = `lang-switch-btn px-3 py-1 rounded-full transition font-semibold ${isActive ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B] hover:text-[#1D1D1F]'}`;
      } else {
        btn.className = `lang-switch-btn px-2 sm:px-2.5 py-0.5 rounded-full transition font-semibold ${isActive ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B] hover:text-[#1D1D1F]'}`;
      }
    });

    // 1. Trang Đăng nhập / Đăng ký
    setElText('i18nAuthSubtitle', 'Đăng nhập để tải tiến trình học cá nhân của bạn', '登录以加载您的个人学习进度');
    setElText('i18nFirstSetupTitle', 'Khởi tạo Tài khoản Chủ sở hữu (Owner)', '初始化所有者账户');
    setElText('i18nFirstSetupDesc', 'Database hiện chưa có tài khoản nào. Hãy tạo tài khoản đầu tiên của bạn — toàn bộ thẻ và tiến trình học hiện có sẽ thuộc về tài khoản này.', '数据库尚无账户。请创建您的第一个账户——现有全部卡片与学习进度将归属此账户。');
    setElText('i18nTabLogin', 'Đăng nhập', '登录');
    setElText('i18nTabRegister', 'Tạo tài khoản', '注册');
    setElText('i18nLabelUsername', 'Tên đăng nhập (User):', '用户名:');
    setElText('i18nLabelPassword', 'Mật khẩu:', '密码:');
    setElText('i18nLabelConfirmPwd', 'Nhập lại mật khẩu:', '确认密码:');
    setElText('i18nRememberMe', 'Ghi nhớ đăng nhập trên thiết bị này', '在此设备上记住登录状态');
    setElText('i18nAuthSecurityNote', 'Bảo mật xác thực SHA-256', 'SHA-256 加密安全认证');

    const authUsername = document.getElementById('authUsername');
    const authPassword = document.getElementById('authPassword');
    const authConfirmPassword = document.getElementById('authConfirmPassword');
    if (authUsername) authUsername.placeholder = t('Nhập tên user...', '请输入用户名...');
    if (authPassword) authPassword.placeholder = t('Nhập mật khẩu...', '请输入密码...');
    if (authConfirmPassword) authConfirmPassword.placeholder = t('Nhập lại mật khẩu...', '请再次输入密码...');

    if (HSK.auth && HSK.auth.setAuthModeUI) {
      HSK.auth.setAuthModeUI(HSK.auth.getAuthMode());
    }

    // 2. Thanh Header & Điều hướng
    setElText('i18nNavStudy', 'Lật thẻ', '翻卡');
    setElText('i18nNavQuiz', 'Kiểm tra', '测验');
    setElText('i18nNavList', 'Bộ thẻ', '牌组');
    setElText('i18nNavBulk', 'Import AI', '批量导入');
    setElText('i18nNavAdd', 'Thêm câu', '添加');

    const currentUser = HSK.auth ? HSK.auth.getCurrentUser() : null;
    const currentUserBadgeText = document.getElementById('currentUserBadgeText');
    if (currentUser && currentUserBadgeText) {
      currentUserBadgeText.textContent = `${currentUser.displayName}${currentUser.role === 'owner' ? t(' (Chủ)', ' (所有者)') : ''}`;
    }

    // 3. Màn hình Lật thẻ (Flashcards)
    setElText('i18nSrsBannerTitle', 'Lặp lại ngắt quãng (SRS):', '间隔重复 (SRS):');
    setElText('i18nSrsBannerSuffix', 'cần ôn tập hôm nay', '今日待复习');
    setElText('i18nSrsBannerDesc', 'Bao gồm câu chưa thuộc, câu trả lời sai khi kiểm tra hoặc câu đã đến hạn ôn lại để tránh quên.', '包含未记住、测验答错或今日到期需复习的句子。');
    setElText('i18nBtnStudySrsNow', 'Học lại ngay', '立即复习');
    setElText('i18nBtnQuizSrsNow', 'Kiểm tra câu cần ôn', '测验待复习');
    setElText('i18nProgressLabel', 'Tiến độ:', '进度:');
    setElText('i18nBtnNewFolderQuick', '+ Bộ thẻ', '+ 新牌组');
    setElText('i18nBtnEditFolderQuick', 'Sửa bộ thẻ', '编辑牌组');
    setElText('i18nBtnEditCurrentCard', 'Sửa thẻ', '编辑卡片');
    setElText('i18nFilterAll', 'Tất cả trạng thái', '全部状态');
    setElText('i18nFilterSrsDue', '🔥 Cần ôn hôm nay (SRS)', '🔥 今日待复习 (SRS)');
    setElText('i18nFilterNew', '🌱 Mới chưa học', '🌱 未学新卡');
    setElText('i18nFilterHard', '⚠️ Chưa nhớ / Hay sai', '⚠️ 未记住 / 易错');
    setElText('i18nFilterLearning', '⏳ Đang học (Ôn sau)', '⏳ 学习中（待复习）');
    setElText('i18nFilterMastered', '✅ Đã thuộc (Dễ)', '✅ 已掌握（简单）');
    setElText('i18nFlipBackHint', 'Bấm để lật lại', '点击翻回');
    setElText('i18nCardBackFooter', 'Đánh giá bên dưới để lên lịch Lặp lại ngắt quãng (SRS) 👇', '请在下方评估记忆程度以安排复习计划 (SRS) 👇');
    setElText('i18nBtnHardLabel', 'Chưa nhớ', '没记住');
    setElText('i18nBtnHardSubtext', 'Ôn lại ngay hôm nay', '今日重温');
    setElText('i18nBtnGoodLabel', 'Bình thường', '一般');
    setElText('i18nBtnEasyLabel', 'Đã nhớ (Dễ)', '已记住（简单）');
    setElText('i18nBtnPrevLabel', 'Trước', '上一句');
    setElText('i18nBtnNextLabel', 'Sau', '下一句');

    // 4. Màn hình Kiểm tra (Quiz)
    setElText('i18nQuizHeaderTitle', 'Luyện tập & Kiểm tra', '练习与测验');
    setElText('i18nQuizSrcAll', 'Tất cả câu trong thư mục', '文件夹内全部句子');
    setElText('i18nQuizSrcPriority', '🔥 Ưu tiên câu Cần ôn / Hay sai', '🔥 优先待复习 / 易错句');
    setElText('i18nQuizSrcOnly', '⚠️ Chỉ câu Cần ôn hôm nay (SRS)', '⚠️ 仅今日待复习 (SRS)');
    setElText('i18nQuizSelectFolderLabel', 'Chọn thư mục bộ thẻ muốn kiểm tra:', '选择要测验的文件夹:');
    setElText('btnQuizSelectAllFolders', 'Chọn tất cả', '全选');
    setElText('i18nQModeZhVi', 'Trung ➔ Việt', '中译越');
    setElText('i18nQModeViZh', 'Việt ➔ Trung', '越译中');
    setElText('i18nQModeListenChoice', 'Nghe ➔ Chọn', '听音选义');
    setElText('i18nQModeListenType', 'Nghe ➔ Gõ', '听音输入');
    setElText('i18nQModeMixed', 'Ngẫu nhiên', '随机混合');
    setElText('i18nBtnPlayNormal', 'Nghe câu tiếng Trung', '播放中文句子');
    setElText('i18nBtnPlaySlow', 'Nghe chậm', '慢速播放');
    setElText('quizListenHint', 'Bấm nút loa để nghe lại (Chữ Hán sẽ hiện sau khi bạn trả lời)', '点击喇叭重听（答题后显示汉字与拼音）');
    setElText('i18nBtnSubmitTyping', 'Kiểm tra', '提交');
    setElText('i18nTypingSynonymHint', 'Hệ thống tự động chấp nhận các từ đồng nghĩa và cách diễn đạt tương đương.', '系统自动支持同义词与相近表达评判。');
    setElText('i18nBtnNextQuiz', 'Câu tiếp theo', '下一题');
    setElText('i18nBtnRestartQuiz', 'Làm lại lượt kiểm tra mới', '重新开始测验');

    const quizTypingInput = document.getElementById('quizTypingInput');
    if (quizTypingInput) {
      quizTypingInput.placeholder = t('Nhập nghĩa tiếng Việt bạn nghe được (chấp nhận từ đồng nghĩa)...', '输入您听到的越南语意思（支持同义词）...');
    }

    // 5. Màn hình Danh sách Bộ thẻ & Modal
    setElText('i18nDecksSectionTitle', 'Bộ thẻ của bạn', '您的牌组');
    setElText('i18nDecksSectionSubtitle', 'Chỉnh sửa tên bộ thẻ, thêm câu mới hoặc lọc thẻ theo từng chủ đề', '重命名牌组、添加新句或按主题筛选卡片');
    setElText('i18nBtnCreateDeckInList', 'Tạo bộ thẻ mới', '新建牌组');
    setElText('i18nListHeaderTitle', 'Danh sách toàn bộ thẻ câu', '全部卡片列表');
    setElText('i18nBtnImportJson', 'Nhập JSON', '导入 JSON');
    setElText('i18nBtnExportJson', 'Xuất JSON', '导出 JSON');

    const searchListInput = document.getElementById('searchListInput');
    if (searchListInput) {
      searchListInput.placeholder = t('Tìm chữ Hán, Pinyin, nghĩa...', '搜索汉字、拼音、越南语释义...');
    }

    const editingCardId = HSK.app ? HSK.app.getEditingCardId() : null;
    setElText('i18nModalAddTitle', editingCardId !== null ? 'Chỉnh sửa thẻ câu' : 'Thêm câu học mới', editingCardId !== null ? '编辑卡片内容' : '添加新句子');
    setElText('i18nModalAddFolderLabel', 'Bộ thẻ (Thư mục):', '所属牌组 / 文件夹:');
    setElText('btnCreateFolderInSingle', '+ Bộ thẻ mới', '+ 新建牌组');
    setElText('i18nModalAddHzLabel', 'Chữ Hán (Chỉ cần nhập mục này):', '汉字（只需输入此项）:');
    setElText('i18nBtnAutoFillSingle', 'Tự động điền AI', 'AI自动填充');
    setElText('i18nModalAddPyLabel', 'Pinyin (Tự động tạo khi gõ chữ Hán):', '拼音（输入汉字时自动生成）:');
    setElText('i18nModalAddViLabel', 'Nghĩa tiếng Việt:', '越南语释义:');
    setElText('i18nModalAddGrammarLabel', 'Giải thích từ vựng / Ngữ pháp:', '词汇与语法解析:');
    setElText('btnCancelAdd', 'Hủy', '取消');

    const btnSaveCard = document.getElementById('btnSaveCard');
    if (btnSaveCard) {
      if (editingCardId === null) {
        btnSaveCard.innerHTML = `<i class="fa-solid fa-floppy-disk mr-1"></i> ${t('Lưu thẻ mới', '保存新卡')}`;
      } else {
        btnSaveCard.innerHTML = `<i class="fa-solid fa-check mr-1"></i> ${t('Lưu chỉnh sửa', '保存修改')}`;
      }
    }

    setElText('i18nModalBulkTitle', 'Import nhanh bằng AI', 'AI批量导入中文句子');
    setElText('i18nModalBulkSubtitle', 'Mỗi dòng 1 câu tiếng Trung. Hệ thống tự động tạo Pinyin, dịch nghĩa tiếng Việt và phân tích ngữ pháp. Bạn có thể chỉnh sửa trực tiếp trước khi lưu.', '每行一句中文。系统自动生成拼音、越南语翻译与语法解析，保存前可直接修改。');
    setElText('i18nModalBulkFolderLabel', 'Lưu các câu này vào bộ thẻ:', '将这些句子保存至牌组:');
    setElText('btnCreateFolderInBulk', '+ Bộ thẻ mới', '+ 新建牌组');
    setElText('i18nModalBulkInputLabel', 'Danh sách câu tiếng Trung (mỗi câu 1 dòng):', '中文句子列表（每行一句）:');
    setElText('i18nBtnAnalyzeBulk', 'Phân tích & Tự điền tất cả', 'AI解析并自动填充全部');
    setElText('btnCancelBulk', 'Đóng', '关闭');

    setElText('i18nUserModalTitle', 'Tài khoản & Tiến trình học cá nhân', '个人账户与学习进度');
    setElText('i18nLoggedInAsLabel', 'Đang đăng nhập với tài khoản:', '当前登录账户:');
    setElText('i18nBtnLogoutModal', 'Đăng xuất', '退出登录');
    setElText('i18nChangePwdHeader', 'Đổi mật khẩu của bạn', '修改您的密码');
    setElText('btnChangePassword', 'Cập nhật mật khẩu', '更新密码');
    setElText('btnCloseUserModalBottom', 'Đóng', '关闭');

    // Cập nhật các thành phần động nếu ứng dụng đã tải
    if (typeof refreshAllFolderSelectors === 'function') refreshAllFolderSelectors();
    if (typeof updateStatsSummary === 'function') updateStatsSummary();
    if (typeof updateCardUI === 'function') updateCardUI(false);
  }

  // Lắng nghe sự kiện bấm nút chọn ngôn ngữ
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-switch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang-switch');
        if (lang) applyLanguageUI(lang);
      });
    });
  });

  // Xuất toàn cục cho toàn bộ các module script
  window.uiLang = uiLang;
  window.t = t;
  window.setElText = setElText;
  window.applyLanguageUI = applyLanguageUI;

  // Xuất vào namespace HSK
  window.HSK.i18n = {
    t,
    setElText,
    applyLanguageUI,
    getLang: () => (window.uiLang || uiLang)
  };
  window.HSK.t = t;
  window.HSK.applyLanguageUI = applyLanguageUI;

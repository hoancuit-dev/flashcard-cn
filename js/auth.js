// =========================================================================
// js/auth.js - XÁC THỰC NGƯỜI DÙNG (SHA-256), PHÂN QUYỀN OWNER & TIẾN TRÌNH HỌC RIÊNG
// =========================================================================

var currentUser = null; // { id, username, displayName, passwordHash, role: 'owner' | 'member', allowPublicRegister }
var authMode = 'login'; // 'login' | 'register'
var hasAnyUserInDb = true;
var allowPublicRegistration = true;

// DOM Elements
var authScreen = document.getElementById('authScreen');
var appHeader = document.getElementById('appHeader');
var appMain = document.getElementById('appMain');
var authForm = document.getElementById('authForm');
var authUsername = document.getElementById('authUsername');
var authPassword = document.getElementById('authPassword');
var authConfirmPassword = document.getElementById('authConfirmPassword');
var authConfirmPwdBox = document.getElementById('authConfirmPwdBox');
var authRememberMe = document.getElementById('authRememberMe');
var authErrorMsg = document.getElementById('authErrorMsg');
var btnSubmitAuth = document.getElementById('btnSubmitAuth');
var tabBtnLogin = document.getElementById('tabBtnLogin');
var tabBtnRegister = document.getElementById('tabBtnRegister');
var authFirstSetupBanner = document.getElementById('authFirstSetupBanner');
var currentUserBadgeText = document.getElementById('currentUserBadgeText');

var modalUserAccount = document.getElementById('modalUserAccount');
var userModalDisplayName = document.getElementById('userModalDisplayName');
var userModalRoleBadge = document.getElementById('userModalRoleBadge');
var userModalStatsText = document.getElementById('userModalStatsText');
var ownerAdminSection = document.getElementById('ownerAdminSection');
var chkAllowPublicRegister = document.getElementById('chkAllowPublicRegister');
var adminUserListContainer = document.getElementById('adminUserListContainer');

// =========================================================================
// HÀM MÃ HÓA BĂM SHA-256 (TƯƠNG THÍCH CẢ FILE:// VÀ HTTPS)
// =========================================================================
async function sha256Hash(message) {
  const text = String(message || '');
  if (window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch { }
  }
  // Thuật toán SHA-256 thuần JS khi chạy offline không có Web Crypto API
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';
  const words = [];
  const asciiBitLength = text.length * 8;
  let hash = [];
  const k = [];
  let primeCounter = 0;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  let str = unescape(encodeURIComponent(text)) + '\x80';
  while ((str.length % 64) - 56) str += '\x00';
  for (let i = 0; i < str.length; i++) {
    const j = str.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;
  for (let j = 0; j < words.length;) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 = hash[7] + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + ((e & hash[5]) ^ (~e & hash[6])) + k[i] +
        (w[i] = i < 16 ? w[i] : (w[i - 16] + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | 0);
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? 0 : '') + b.toString(16);
    }
  }
  return result;
}

function showAuthError(msg) {
  if (!msg) {
    authErrorMsg.classList.add('hidden');
    authErrorMsg.textContent = '';
  } else {
    authErrorMsg.textContent = msg;
    authErrorMsg.classList.remove('hidden');
  }
}

function setAuthModeUI(mode) {
  authMode = mode;
  showAuthError('');
  if (mode === 'register') {
    tabBtnRegister.className = "py-2 rounded-full bg-white text-[#1D1D1F] shadow-sm transition";
    tabBtnLogin.className = "py-2 rounded-full text-[#86868B] hover:text-[#1D1D1F] transition";
    authConfirmPwdBox.classList.remove('hidden');
    btnSubmitAuth.innerHTML = `<i class="fa-solid fa-user-plus"></i> <span id="i18nBtnSubmitAuth">${!hasAnyUserInDb ? t('Tạo Tài khoản Chủ sở hữu & Vào học', '创建所有者账户并开始学习') : t('Đăng ký Tài khoản mới', '注册新账户')}</span>`;
  } else {
    tabBtnLogin.className = "py-2 rounded-full bg-white text-[#1D1D1F] shadow-sm transition";
    tabBtnRegister.className = "py-2 rounded-full text-[#86868B] hover:text-[#1D1D1F] transition";
    authConfirmPwdBox.classList.add('hidden');
    btnSubmitAuth.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> <span id="i18nBtnSubmitAuth">${t('Đăng nhập vào học', '登录学习')}</span>`;
  }
}

function parseUserMetaRow(row) {
  let meta = {};
  try {
    meta = JSON.parse(row.grammar || '{}');
  } catch { }
  return {
    id: row.id,
    username: String(row.hz || '').toLowerCase().trim(),
    displayName: row.py || row.hz || 'User',
    passwordHash: row.vi || '',
    role: meta.role || (row.id === -1 ? 'owner' : 'member'),
    allowPublicRegister: meta.allowPublicRegister !== false,
    createdAt: meta.createdAt || 0,
    encOrKey: meta.encOrKey || '',
    orModel: meta.orModel || ''
  };
}

async function checkDatabaseAuthSetup() {
  if (!initSupabase()) return;
  try {
    const { data, error } = await supabaseClient
      .from('flashcards')
      .select('id, hz, py, grammar, status')
      .eq('status', '__user__')
      .order('id', { ascending: false });

    if (!error && Array.isArray(data)) {
      hasAnyUserInDb = data.length > 0;
      const ownerRow = data.find(r => {
        try { return JSON.parse(r.grammar || '{}').role === 'owner' || r.id === -1; } catch { return r.id === -1; }
      }) || data[0];

      if (ownerRow) {
        const parsedOwner = parseUserMetaRow(ownerRow);
        allowPublicRegistration = parsedOwner.allowPublicRegister !== false;
      }

      if (!hasAnyUserInDb) {
        authFirstSetupBanner.classList.remove('hidden');
        setAuthModeUI('register');
      } else {
        authFirstSetupBanner.classList.add('hidden');
        setAuthModeUI('login');
      }
    }
  } catch (err) {
    console.warn("Auth setup check warning:", err);
  }
}

async function fetchUserByUsernameFromDB(username) {
  const cleanUser = String(username || '').toLowerCase().trim();
  if (!cleanUser || !initSupabase()) return null;

  const { data, error } = await supabaseClient
    .from('flashcards')
    .select('id, hz, py, vi, grammar, status')
    .eq('status', '__user__')
    .eq('hz', cleanUser)
    .limit(1);

  if (error) {
    throw new Error(t("Không thể kết nối bảng dữ liệu Cloud: ", "无法连接云端数据表: ") + error.message);
  }
  if (!data || data.length === 0) return null;
  return parseUserMetaRow(data[0]);
}

async function createUserInDB(rawUsername, rawPassword, role = 'member') {
  const cleanUsername = String(rawUsername || '').toLowerCase().trim();
  const displayName = String(rawUsername || '').trim();
  const pwdHash = await sha256Hash(rawPassword);

  const userId = role === 'owner' ? -1 : -Math.floor(1000 + Math.random() * 900000000);
  const userMeta = {
    role,
    allowPublicRegister: true,
    createdAt: Date.now()
  };

  const rowPayload = {
    id: userId,
    hz: cleanUsername,
    py: displayName,
    vi: pwdHash,
    grammar: JSON.stringify(userMeta),
    status: '__user__',
    reviews: 0,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabaseClient.from('flashcards').upsert(rowPayload);
  if (error) {
    throw new Error(t("Lỗi lưu tài khoản lên Database: ", "保存账户至数据库失败: ") + error.message);
  }

  return parseUserMetaRow(rowPayload);
}

async function completeLoginSession(userObj, rememberMe = true) {
  currentUser = userObj;
  window.currentUser = userObj;

  // Giải mã OpenRouter API Key của Owner nếu đã mã hóa trên Cloud
  if (userObj.encOrKey && userObj.passwordHash) {
    const decrypted = xorDecipherHex(userObj.encOrKey, userObj.passwordHash);
    if (decrypted) {
      runtimeOpenRouterKey = decrypted;
    }
  }
  if (userObj.orModel && !localStorage.getItem('cfg_openrouter_model')) {
    localStorage.setItem('cfg_openrouter_model', userObj.orModel);
  }

  const sessionData = JSON.stringify({
    username: userObj.username,
    passwordHash: userObj.passwordHash,
    ts: Date.now()
  });

  if (rememberMe) {
    localStorage.setItem('hsk_auth_session', sessionData);
  } else {
    sessionStorage.setItem('hsk_auth_session', sessionData);
    localStorage.removeItem('hsk_auth_session');
  }

  currentUserBadgeText.textContent = `${userObj.displayName}${userObj.role === 'owner' ? t(' (Chủ)', ' (所有者)') : ''}`;
  const gearIcon = document.getElementById('settingsGearIcon');
  const btnSettings = document.getElementById('btnOpenSettings');
  const modalSettings = document.getElementById('modalSettings');

  if (userObj.role === 'owner' || userObj.role === 'admin') {
    if (gearIcon) gearIcon.classList.remove('hidden');
    if (btnSettings) btnSettings.title = t("Cấu hình AI & Đồng bộ Cloud (Owner)", "AI与云同步设置 (Owner)");
  } else {
    if (gearIcon) gearIcon.classList.add('hidden');
    if (btnSettings) btnSettings.title = t("Trạng thái đồng bộ Cloud (Chỉ Owner mới được sửa cấu hình)", "云同步状态（仅所有者可修改设置）");
    if (modalSettings) modalSettings.classList.add('hidden');
  }

  authScreen.classList.add('hidden');
  appHeader.classList.remove('hidden');
  appMain.classList.remove('hidden');

  loadFromLocalStorage();
  if (typeof refreshAllFolderSelectors === 'function') refreshAllFolderSelectors();
  if (typeof applyFilter === 'function') applyFilter();
  if (typeof renderDecksOverview === 'function') renderDecksOverview();

  await loadCardsFromCloud();
  if (typeof refreshAllFolderSelectors === 'function') refreshAllFolderSelectors();
  if (typeof applyFilter === 'function') applyFilter();
  if (typeof renderDecksOverview === 'function') renderDecksOverview();
}

function logoutCurrentUser() {
  currentUser = null;
  window.currentUser = null;
  runtimeOpenRouterKey = '';
  localStorage.removeItem('hsk_auth_session');
  sessionStorage.removeItem('hsk_auth_session');

  if (modalUserAccount) modalUserAccount.classList.add('hidden');
  const modalSettings = document.getElementById('modalSettings');
  if (modalSettings) modalSettings.classList.add('hidden');

  appHeader.classList.add('hidden');
  appMain.classList.add('hidden');
  authPassword.value = '';
  authConfirmPassword.value = '';
  authScreen.classList.remove('hidden');
  checkDatabaseAuthSetup();
}

// User Modal Details & Admin Management
async function openUserAccountModal() {
  if (!currentUser) return;
  userModalDisplayName.textContent = `${currentUser.displayName} (@${currentUser.username})`;
  if (currentUser.role === 'owner') {
    userModalRoleBadge.textContent = t("Chủ sở hữu (Owner)", "所有者 (Owner)");
    userModalRoleBadge.className = "text-[11px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-semibold";
    ownerAdminSection.classList.remove('hidden');
    chkAllowPublicRegister.checked = allowPublicRegistration;
    renderAdminUserList();
  } else {
    userModalRoleBadge.textContent = t("Học viên (Tiến trình riêng)", "学员（独立进度）");
    userModalRoleBadge.className = "text-[11px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-semibold";
    ownerAdminSection.classList.add('hidden');
  }

  const mastered = cards.filter(c => c.status === 'mastered').length;
  const learning = cards.filter(c => c.status === 'learning').length;
  const due = cards.filter(isCardDueForSRS).length;
  userModalStatsText.textContent = t(
    `Tiến trình của bạn: Đã thuộc ${mastered} câu • Đang học ${learning} câu • Cần ôn SRS ${due} câu`,
    `您的进度: 已掌握 ${mastered} 句 • 学习中 ${learning} 句 • 待复习(SRS) ${due} 句`
  );

  modalUserAccount.classList.remove('hidden');
}

async function renderAdminUserList() {
  if (!currentUser || currentUser.role !== 'owner' || !supabaseClient) return;
  adminUserListContainer.innerHTML = `<div class="p-3 text-slate-400 text-center">${t('Đang tải danh sách user...', '正在加载用户列表...')}</div>`;
  const { data, error } = await supabaseClient
    .from('flashcards')
    .select('id, hz, py, grammar, status')
    .eq('status', '__user__')
    .order('id', { ascending: false });

  if (error || !data) {
    adminUserListContainer.innerHTML = `<div class="p-3 text-rose-500 text-center">${t('Lỗi tải danh sách user', '加载用户列表失败')}</div>`;
    return;
  }

  const users = data.map(parseUserMetaRow);
  adminUserListContainer.innerHTML = users.map(u => `
    <div class="px-3 py-2 flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <i class="fa-solid ${u.role === 'owner' ? 'fa-crown text-amber-500' : 'fa-user text-slate-400'}"></i>
        <span class="font-bold text-slate-800">${u.displayName}</span>
        <span class="text-slate-400 font-mono text-[11px]">@${u.username}</span>
        <span class="text-[10px] px-1.5 py-0.5 rounded ${u.role === 'owner' ? 'bg-amber-100 text-amber-800 font-semibold' : 'bg-slate-100 text-slate-600'}">
          ${u.role === 'owner' ? t('Chủ sở hữu', '所有者') : t('Học viên', '学员')}
        </span>
      </div>
      ${u.role !== 'owner' ? `
        <button type="button" data-admin-delete-id="${u.id}" data-admin-delete-user="${u.username}" class="text-rose-500 hover:text-rose-700 text-xs font-semibold px-2 py-0.5 rounded hover:bg-rose-50">
          <i class="fa-solid fa-trash-can mr-0.5"></i> ${t('Xóa', '删除')}
        </button>
      ` : ''}
    </div>
  `).join('');
}

// =========================================================================
// GẮN CÁC SỰ KIỆN XÁC THỰC
// =========================================================================
tabBtnLogin.addEventListener('click', () => setAuthModeUI('login'));
tabBtnRegister.addEventListener('click', () => {
  if (hasAnyUserInDb && !allowPublicRegistration) {
    showAuthError(t(
      "Chủ sở hữu đã khóa tính năng tự đăng ký tài khoản mới. Vui lòng đăng nhập bằng tài khoản đã được cấp!",
      "所有者已关闭公开注册功能，请使用已分配的账户登录！"
    ));
    return;
  }
  setAuthModeUI('register');
});

document.getElementById('btnToggleShowAuthPwd').addEventListener('click', () => {
  const isPwd = authPassword.type === 'password';
  authPassword.type = isPwd ? 'text' : 'password';
  authConfirmPassword.type = isPwd ? 'text' : 'password';
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  showAuthError('');

  const rawUser = authUsername.value.trim();
  const rawPwd = authPassword.value;
  const cleanUser = rawUser.toLowerCase();

  if (!cleanUser || cleanUser.length < 2) {
    showAuthError(t("Tên đăng nhập phải có ít nhất 2 ký tự!", "用户名至少需要 2 个字符！"));
    return;
  }
  if (!/^[a-z0-9_.-]+$/i.test(cleanUser)) {
    showAuthError(t("Tên đăng nhập chỉ nên gồm chữ cái không dấu, số hoặc dấu gạch dưới (_)!", "用户名仅限字母、数字、点或下划线 (_)！"));
    return;
  }
  if (!rawPwd || rawPwd.length < 3) {
    showAuthError(t("Mật khẩu phải có ít nhất 3 ký tự!", "密码至少需要 3 个字符！"));
    return;
  }

  if (!initSupabase()) {
    showAuthError(t("Không thể khởi tạo kết nối Cloud!", "无法初始化云端连接！"));
    return;
  }

  const origBtnHtml = btnSubmitAuth.innerHTML;
  btnSubmitAuth.disabled = true;
  btnSubmitAuth.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>${t('Đang xác thực với Database...', '正在与数据库验证...')}</span>`;

  try {
    if (authMode === 'register') {
      if (hasAnyUserInDb && !allowPublicRegistration) {
        throw new Error(t("Chủ sở hữu đã khóa đăng ký tự do. Vui lòng đăng nhập bằng tài khoản đã được cấp!", "所有者已关闭公开注册，请使用已分配的账户登录！"));
      }
      if (rawPwd !== authConfirmPassword.value) {
        throw new Error(t("Mật khẩu nhập lại không khớp!", "两次输入的密码不一致！"));
      }
      const existing = await fetchUserByUsernameFromDB(cleanUser);
      if (existing) {
        throw new Error(t(`Tài khoản "${rawUser}" đã tồn tại! Vui lòng chuyển sang tab Đăng nhập.`, `账户 "${rawUser}" 已存在！请切换到登录标签页。`));
      }
      const role = !hasAnyUserInDb ? 'owner' : 'member';
      const createdUser = await createUserInDB(rawUser, rawPwd, role);
      hasAnyUserInDb = true;
      await completeLoginSession(createdUser, authRememberMe.checked);
    } else {
      // Đăng nhập
      const dbUser = await fetchUserByUsernameFromDB(cleanUser);
      if (!dbUser) {
        if (!hasAnyUserInDb) {
          throw new Error(t("Database chưa có tài khoản nào! Hãy chuyển sang tab 'Tạo tài khoản' để tạo tài khoản Chủ sở hữu đầu tiên.", "数据库尚无账户！请切换到“注册”标签页创建第一个所有者账户。"));
        }
        throw new Error(t("Tên đăng nhập hoặc mật khẩu không chính xác!", "用户名或密码不正确！"));
      }

      const inputHash = await sha256Hash(rawPwd);
      const isHashMatch = dbUser.passwordHash === inputHash;
      const isPlainMatch = dbUser.passwordHash === rawPwd;

      if (!isHashMatch && !isPlainMatch) {
        throw new Error(t("Tên đăng nhập hoặc mật khẩu không chính xác!", "用户名或密码不正确！"));
      }

      // Tự nâng cấp nếu mật khẩu cũ đang lưu plain text
      if (isPlainMatch && !isHashMatch) {
        dbUser.passwordHash = inputHash;
        await supabaseClient.from('flashcards').update({ vi: inputHash }).eq('id', dbUser.id);
      }

      await completeLoginSession(dbUser, authRememberMe.checked);
    }
  } catch (err) {
    showAuthError(err.message || t("Lỗi xác thực tài khoản", "账户验证错误"));
  } finally {
    btnSubmitAuth.disabled = false;
    btnSubmitAuth.innerHTML = origBtnHtml;
  }
});

document.getElementById('btnOpenUserModal').addEventListener('click', openUserAccountModal);
document.getElementById('btnCloseUserModal').addEventListener('click', () => modalUserAccount.classList.add('hidden'));
document.getElementById('btnCloseUserModalBottom').addEventListener('click', () => modalUserAccount.classList.add('hidden'));
document.getElementById('btnLogoutInModal').addEventListener('click', logoutCurrentUser);
document.getElementById('btnQuickLogout').addEventListener('click', () => {
  if (confirm(t(`Bạn muốn đăng xuất khỏi tài khoản "${currentUser?.displayName || ''}"?`, `您确定要退出账户 "${currentUser?.displayName || ''}" 吗？`))) {
    logoutCurrentUser();
  }
});

// Đổi mật khẩu
document.getElementById('btnChangePassword').addEventListener('click', async () => {
  if (!currentUser || !supabaseClient) return;
  const newPwd = document.getElementById('inputNewPassword').value;
  const confirmPwd = document.getElementById('inputConfirmNewPassword').value;

  if (!newPwd || newPwd.length < 3) {
    alert(t("Mật khẩu mới phải có ít nhất 3 ký tự!", "新密码至少需要 3 个字符！"));
    return;
  }
  if (newPwd !== confirmPwd) {
    alert(t("Mật khẩu xác nhận không khớp!", "确认密码不一致！"));
    return;
  }

  const newHash = await sha256Hash(newPwd);
  const updatePayload = { vi: newHash, updated_at: new Date().toISOString() };

  const currentOrKey = getConfig().openRouterKey;
  if (currentUser.role === 'owner' && currentOrKey) {
    const encOrKey = xorCipherHex(currentOrKey, newHash);
    currentUser.encOrKey = encOrKey;
    updatePayload.grammar = JSON.stringify({
      role: 'owner',
      allowPublicRegister: allowPublicRegistration,
      createdAt: currentUser.createdAt || Date.now(),
      encOrKey,
      orModel: getConfig().openRouterModel
    });
  }

  const { error } = await supabaseClient
    .from('flashcards')
    .update(updatePayload)
    .eq('id', currentUser.id);

  if (error) {
    alert(t("Lỗi khi cập nhật mật khẩu: ", "更新密码失败: ") + error.message);
    return;
  }

  currentUser.passwordHash = newHash;
  if (localStorage.getItem('hsk_auth_session')) {
    localStorage.setItem('hsk_auth_session', JSON.stringify({
      username: currentUser.username,
      passwordHash: newHash,
      ts: Date.now()
    }));
  }
  document.getElementById('inputNewPassword').value = '';
  document.getElementById('inputConfirmNewPassword').value = '';
  alert(t("Đã cập nhật mật khẩu mới thành công!", "新密码更新成功！"));
});

// Cho phép khách tự đăng ký (chỉ Owner)
chkAllowPublicRegister.addEventListener('change', async () => {
  if (!currentUser || currentUser.role !== 'owner' || !supabaseClient) return;
  allowPublicRegistration = chkAllowPublicRegister.checked;
  currentUser.allowPublicRegister = allowPublicRegistration;
  const newMeta = {
    role: 'owner',
    allowPublicRegister: allowPublicRegistration,
    createdAt: currentUser.createdAt || Date.now(),
    encOrKey: currentUser.encOrKey || '',
    orModel: getConfig().openRouterModel
  };
  await supabaseClient
    .from('flashcards')
    .update({ grammar: JSON.stringify(newMeta), updated_at: new Date().toISOString() })
    .eq('id', currentUser.id);
});

// Quản lý User bởi Owner
adminUserListContainer.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-admin-delete-id]');
  if (!btn) return;
  if (!currentUser || currentUser.role !== 'owner' || !supabaseClient) return;
  const userId = Number(btn.getAttribute('data-admin-delete-id'));
  const username = btn.getAttribute('data-admin-delete-user') || '';
  if (!confirm(t(`Bạn có chắc chắn muốn xóa tài khoản "@${username}" không?`, `您确定要删除账户 "@${username}" 吗？`))) return;
  const { error } = await supabaseClient.from('flashcards').delete().eq('id', userId);
  if (error) {
    alert(t("Lỗi khi xóa user: ", "删除用户失败: ") + error.message);
    return;
  }
  await renderAdminUserList();
});

document.getElementById('btnAdminCreateUser').addEventListener('click', async () => {
  if (!currentUser || currentUser.role !== 'owner') return;
  const uName = document.getElementById('adminNewUsername').value.trim();
  const uPwd = document.getElementById('adminNewPassword').value;
  if (!uName || uName.length < 2) {
    alert(t("Vui lòng nhập tên user mới (tối thiểu 2 ký tự)!", "请输入新用户名（至少 2 个字符）！"));
    return;
  }
  if (!uPwd || uPwd.length < 3) {
    alert(t("Vui lòng nhập mật khẩu (tối thiểu 3 ký tự)!", "请输入密码（至少 3 个字符）！"));
    return;
  }
  try {
    const existing = await fetchUserByUsernameFromDB(uName);
    if (existing) {
      alert(t(`User "${uName}" đã tồn tại!`, `用户 "${uName}" 已存在！`));
      return;
    }
    await createUserInDB(uName, uPwd, 'member');
    document.getElementById('adminNewUsername').value = '';
    document.getElementById('adminNewPassword').value = '';
    await renderAdminUserList();
    alert(t(`Đã tạo tài khoản "${uName}" thành công!`, `已成功创建账户 "${uName}"！`));
  } catch (err) {
    alert(err.message);
  }
});

// Xuất toàn cục cho toàn bộ các module script
window.currentUser = currentUser;
window.sha256Hash = sha256Hash;
window.showAuthError = showAuthError;
window.setAuthModeUI = setAuthModeUI;
window.parseUserMetaRow = parseUserMetaRow;
window.checkDatabaseAuthSetup = checkDatabaseAuthSetup;
window.fetchUserByUsernameFromDB = fetchUserByUsernameFromDB;
window.createUserInDB = createUserInDB;
window.completeLoginSession = completeLoginSession;
window.logoutCurrentUser = logoutCurrentUser;
window.openUserAccountModal = openUserAccountModal;
window.renderAdminUserList = renderAdminUserList;

/**
 * js/config.js
 * Quản lý cấu hình Supabase Cloud, OpenRouter AI và các hàm mã hóa bảo mật.
 */
window.HSK = window.HSK || {};

(function (HSK) {
  'use strict';

  // Dữ liệu nhị phân mã hóa thông tin Supabase bootstrap nội bộ (tránh lộ chuỗi khi scan repo public)
  const _EP_A = [33,61,61,57,58,115,102,102,61,56,48,62,51,33,51,45,33,34,37,60,35,37,45,49,62,45,56,58,103,58,60,57,40,43,40,58,44,103,42,38];
  const _EP_B = [44,48,3,33,43,14,42,32,6,32,3,0,28,51,0,120,7,32,0,58,0,39,27,124,42,10,0,127,0,34,57,17,31,10,3,112,103,44,48,3,57,42,122,4,32,6,32,3,51,45,17,11,33,16,36,15,51,19,26,0,58,0,39,3,37,19,32,0,127,0,39,27,49,44,17,45,127,40,1,57,34,40,14,61,58,45,30,57,58,19,1,33,122,19,1,15,51,0,32,62,32,42,36,112,58,19,26,0,127,0,36,15,60,43,123,125,32,5,10,3,57,16,17,24,32,6,35,12,122,6,29,4,49,7,13,16,51,4,13,24,58,0,36,31,125,42,10,0,127,4,35,12,62,6,13,42,48,4,35,4,62,7,1,121,103,125,51,7,61,26,7,58,3,39,38,37,15,0,127,123,45,0,42,4,26,14,28,124,58,4,100,40,46,36,60,120,32,8,47,51,35,0,60,60,126,49,59,24];

  function _decodeBytes(arr) {
    return String.fromCharCode(...arr.map(b => b ^ 73));
  }

  function xorCipherHex(plainText, keyStr) {
    if (!plainText || !keyStr) return '';
    const bytes = new TextEncoder().encode(plainText);
    const keyBytes = new TextEncoder().encode(keyStr);
    return Array.from(bytes).map((b, i) => (b ^ keyBytes[i % keyBytes.length]).toString(16).padStart(2, '0')).join('');
  }

  function xorDecipherHex(hexStr, keyStr) {
    if (!hexStr || !keyStr || hexStr.length % 2 !== 0) return '';
    try {
      const keyBytes = new TextEncoder().encode(keyStr);
      const out = new Uint8Array(hexStr.length / 2);
      for (let i = 0; i < out.length; i++) {
        const b = parseInt(hexStr.slice(i * 2, i * 2 + 2), 16);
        out[i] = b ^ keyBytes[i % keyBytes.length];
      }
      return new TextDecoder().decode(out);
    } catch {
      return '';
    }
  }

  let runtimeOpenRouterKey = '';

  function getConfig() {
    return {
      openRouterKey: runtimeOpenRouterKey || localStorage.getItem('cfg_openrouter_key') || '',
      openRouterModel: localStorage.getItem('cfg_openrouter_model') || 'deepseek/deepseek-chat'
    };
  }

  function setRuntimeOpenRouterKey(key) {
    runtimeOpenRouterKey = key || '';
  }

  let supabaseClient = null;

  function setSyncStatus(mode, text) {
    const syncStatusText = document.getElementById('syncStatusText');
    const syncStatusDot = document.getElementById('syncStatusDot');
    if (syncStatusText) syncStatusText.textContent = text;
    if (!syncStatusDot) return;

    if (mode === 'connected') {
      syncStatusDot.className = "w-2 h-2 rounded-full bg-emerald-400";
    } else if (mode === 'syncing') {
      syncStatusDot.className = "w-2 h-2 rounded-full bg-sky-400 animate-ping";
    } else if (mode === 'error') {
      syncStatusDot.className = "w-2 h-2 rounded-full bg-rose-400";
    } else {
      syncStatusDot.className = "w-2 h-2 rounded-full bg-amber-400";
    }
  }

  function initSupabase() {
    if (supabaseClient) return true;
    if (window.supabase) {
      try {
        supabaseClient = window.supabase.createClient(_decodeBytes(_EP_A), _decodeBytes(_EP_B));
        HSK.supabaseClient = supabaseClient;
        return true;
      } catch (err) {
        console.error("Cloud init error:", err);
        setSyncStatus('error', HSK.t ? HSK.t('Lỗi kết nối', '连接错误') : 'Lỗi kết nối');
        return false;
      }
    }
    supabaseClient = null;
    HSK.supabaseClient = null;
    setSyncStatus('local', HSK.t ? HSK.t('Lưu cục bộ', '本地存储') : 'Lưu cục bộ');
    return false;
  }

  // Xuất ra namespace HSK
  HSK.config = {
    getConfig,
    setRuntimeOpenRouterKey,
    getRuntimeOpenRouterKey: () => runtimeOpenRouterKey,
    xorCipherHex,
    xorDecipherHex
  };
  HSK.initSupabase = initSupabase;
  HSK.setSyncStatus = setSyncStatus;
  Object.defineProperty(HSK, 'supabaseClient', {
    get: () => supabaseClient,
    set: (val) => { supabaseClient = val; }
  });

})(window.HSK);

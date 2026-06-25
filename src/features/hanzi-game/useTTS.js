// 语音合成封装：用浏览器原生 Web Speech API 朗读中文，无需新增依赖。

export function ttsSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

// 优先挑选中文语音，提升发音质量；找不到也允许浏览器用默认语音。
function pickZhVoice() {
  if (!ttsSupported()) return null
  const voices = window.speechSynthesis.getVoices()
  return voices.find((v) => v.lang?.toLowerCase().startsWith('zh')) || null
}

export function speak(text) {
  if (!ttsSupported() || !text) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-CN'
  utterance.rate = 0.8

  const zhVoice = pickZhVoice()
  if (zhVoice) utterance.voice = zhVoice

  window.speechSynthesis.speak(utterance)
}

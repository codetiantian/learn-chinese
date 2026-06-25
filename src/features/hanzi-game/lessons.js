// 课程数据：按分组组织学习内容。
// - common：常用汉字，用 hanzi-writer 做笔画演示与描红闯关。
// - numbers：阿拉伯数字 1-10，用自由描红临摹 + 计数 + 发音（hanzi-writer 不支持数字）。
// - pinyin：声母 / 韵母，用自由描红临摹 + 发音（用助记字保证发音准确）。

export const LESSON_GROUPS = {
  common: {
    label: '写汉字',
    stage: 'hanzi',
    items: [
      { char: '我', pinyin: 'wǒ', meaning: '我 (I)' },
      { char: '你', pinyin: 'nǐ', meaning: '你 (you)' },
      { char: '好', pinyin: 'hǎo', meaning: '好 (good)' },
      { char: '学', pinyin: 'xué', meaning: '学 (learn)' },
      { char: '中', pinyin: 'zhōng', meaning: '中 (middle)' },
      { char: '国', pinyin: 'guó', meaning: '国 (country)' },
    ],
  },
  numbers: {
    label: '数字',
    stage: 'trace',
    items: [
      { glyph: '1', hanzi: '一', pinyin: 'yī', number: 1 },
      { glyph: '2', hanzi: '二', pinyin: 'èr', number: 2 },
      { glyph: '3', hanzi: '三', pinyin: 'sān', number: 3 },
      { glyph: '4', hanzi: '四', pinyin: 'sì', number: 4 },
      { glyph: '5', hanzi: '五', pinyin: 'wǔ', number: 5 },
      { glyph: '6', hanzi: '六', pinyin: 'liù', number: 6 },
      { glyph: '7', hanzi: '七', pinyin: 'qī', number: 7 },
      { glyph: '8', hanzi: '八', pinyin: 'bā', number: 8 },
      { glyph: '9', hanzi: '九', pinyin: 'jiǔ', number: 9 },
      { glyph: '10', hanzi: '十', pinyin: 'shí', number: 10 },
    ],
  },
  pinyin: {
    label: '拼音',
    stage: 'trace',
    items: [
      // 声母
      { glyph: 'b', type: '声母', mnemonic: '波' },
      { glyph: 'p', type: '声母', mnemonic: '坡' },
      { glyph: 'm', type: '声母', mnemonic: '摸' },
      { glyph: 'f', type: '声母', mnemonic: '佛' },
      { glyph: 'd', type: '声母', mnemonic: '得' },
      { glyph: 't', type: '声母', mnemonic: '特' },
      { glyph: 'n', type: '声母', mnemonic: '讷' },
      { glyph: 'l', type: '声母', mnemonic: '勒' },
      { glyph: 'g', type: '声母', mnemonic: '哥' },
      { glyph: 'k', type: '声母', mnemonic: '科' },
      { glyph: 'h', type: '声母', mnemonic: '喝' },
      { glyph: 'j', type: '声母', mnemonic: '鸡' },
      { glyph: 'q', type: '声母', mnemonic: '欺' },
      { glyph: 'x', type: '声母', mnemonic: '希' },
      { glyph: 'zh', type: '声母', mnemonic: '知' },
      { glyph: 'ch', type: '声母', mnemonic: '吃' },
      { glyph: 'sh', type: '声母', mnemonic: '狮' },
      { glyph: 'r', type: '声母', mnemonic: '日' },
      { glyph: 'z', type: '声母', mnemonic: '资' },
      { glyph: 'c', type: '声母', mnemonic: '雌' },
      { glyph: 's', type: '声母', mnemonic: '思' },
      { glyph: 'y', type: '声母', mnemonic: '医' },
      { glyph: 'w', type: '声母', mnemonic: '乌' },
      // 单韵母
      { glyph: 'a', type: '韵母', mnemonic: '阿' },
      { glyph: 'o', type: '韵母', mnemonic: '喔' },
      { glyph: 'e', type: '韵母', mnemonic: '鹅' },
      { glyph: 'i', type: '韵母', mnemonic: '衣' },
      { glyph: 'u', type: '韵母', mnemonic: '乌' },
      { glyph: 'ü', type: '韵母', mnemonic: '鱼' },
      // 复韵母
      { glyph: 'ai', type: '韵母', mnemonic: '爱' },
      { glyph: 'ei', type: '韵母', mnemonic: '欸' },
      { glyph: 'ui', type: '韵母', mnemonic: '威' },
      { glyph: 'ao', type: '韵母', mnemonic: '袄' },
      { glyph: 'ou', type: '韵母', mnemonic: '欧' },
      { glyph: 'iu', type: '韵母', mnemonic: '优' },
      { glyph: 'ie', type: '韵母', mnemonic: '耶' },
      { glyph: 'üe', type: '韵母', mnemonic: '约' },
      { glyph: 'er', type: '韵母', mnemonic: '耳' },
      { glyph: 'an', type: '韵母', mnemonic: '安' },
      { glyph: 'en', type: '韵母', mnemonic: '恩' },
      { glyph: 'in', type: '韵母', mnemonic: '因' },
      { glyph: 'un', type: '韵母', mnemonic: '温' },
      { glyph: 'ün', type: '韵母', mnemonic: '晕' },
      { glyph: 'ang', type: '韵母', mnemonic: '昂' },
      { glyph: 'eng', type: '韵母', mnemonic: '亨' },
      { glyph: 'ing', type: '韵母', mnemonic: '英' },
      { glyph: 'ong', type: '韵母', mnemonic: '翁' },
    ],
  },
}

// 按 key 顺序输出 [key, label]，供 ModeTabs 渲染。
export const GROUP_ORDER = Object.keys(LESSON_GROUPS).map((key) => ({
  key,
  label: LESSON_GROUPS[key].label,
}))

// 取某分组当前字对象在 items 中的 key（统一用 char 或 glyph）。
export function itemKey(item) {
  return item?.char ?? item?.glyph ?? ''
}

// 在全部分组中按汉字查元数据（仅 common 组有 char）；找不到返回 null。
export function findItem(char) {
  for (const group of Object.values(LESSON_GROUPS)) {
    const found = group.items.find((item) => item.char === char)
    if (found) return found
  }
  return null
}

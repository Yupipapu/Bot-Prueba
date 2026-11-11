const { EMBED_COLOR } = require('../../config/config');

const COLORS = {
  normal: 0xfcd116,
  effect: 0xff8c53,
  fusion: 0xa086b7,
  synchro: 0xffffff,
  xyz: 0x2d2f33,
  ritual: 0x6699ff,
  link: 0x0077ff,
  spell: 0x1d9e73,
  trap: 0xbc5a84,
  token: 0xaaaaaa,
};

const typeColors = {
  "Normal Monster": COLORS.normal,
  "Effect Monster": COLORS.effect,
  "Token": COLORS.token,

  "Fusion Monster": COLORS.fusion,
  "Fusion Monster Tuner": COLORS.fusion,

  "Synchro Monster": COLORS.synchro,
  "Synchro Tuner Monster": COLORS.synchro,

  "Xyz Monster": COLORS.xyz,

  "Ritual Monster": COLORS.ritual,

  "Link Monster": COLORS.link,

  // Pendulum
  "Pendulum Normal Monster": COLORS.normal,
  "Pendulum Effect Monster": COLORS.effect,
  "Fusion Pendulum Monster": COLORS.fusion,
  "Fusion Pendulum Tuner Monster": COLORS.fusion,
  "Synchro Pendulum Monster": COLORS.synchro,
  "Synchro Pendulum Tuner Monster": COLORS.synchro,
  "Xyz Pendulum Monster": COLORS.xyz,
  "Ritual Pendulum Monster": COLORS.ritual,
  "Pendulum Tuner Effect Monster": COLORS.effect,

  // Spell / Trap
  "Spell Card": COLORS.spell,
  "Trap Card": COLORS.trap,

  // Otros tipos
  "Normal Tuner Monster": COLORS.normal,
  "Tuner Monster": COLORS.effect,
  "Flip Monster": COLORS.effect,
  "Ritual Effect Monster": COLORS.ritual,
  "Ritual Flip Monster": COLORS.ritual,
  "Gemini Monster": COLORS.effect,
  "Union Monster": COLORS.effect,
  "Spirit Monster": COLORS.effect,
};

function getCardTypeColor(type) {
  const t = type.toLowerCase();

  // 🔹 Pendulum
  if (t.includes("pendulum")) {
    if (t.includes("fusion")) return COLORS.fusion;
    if (t.includes("synchro")) return COLORS.synchro;
    if (t.includes("xyz")) return COLORS.xyz;
    if (t.includes("ritual")) return COLORS.ritual;
    if (t.includes("tuner")) return t.includes("normal") ? COLORS.normal : COLORS.effect;

    if (["flip", "gemini", "union", "spirit"].some(x => t.includes(x)))
      return COLORS.effect;

    if (t.includes("effect")) return COLORS.effect;
    if (t.includes("normal")) return COLORS.normal;
  }

  // 🔹 Otros tipos que son efecto
  if (["flip", "gemini", "union", "spirit"].some(x => t.includes(x)))
    return COLORS.effect;

  // 🔹 Tipos directos
  return typeColors[type] || EMBED_COLOR;
}

module.exports = {
  typeColors,
  getCardTypeColor,
};

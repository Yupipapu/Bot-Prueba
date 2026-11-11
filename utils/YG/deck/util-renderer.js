const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const { EMBED_COLOR } = require("../../../config/config");

// =============================
// 🔧 CONFIGURACIÓN GLOBAL
// =============================

const SCALE = 1.5;

const CARD = {
  WIDTH: 96 * SCALE,
  HEIGHT: 140 * SCALE,
  COLUMNS: 10
};

const LAYOUT = {
  GAP: 4 * SCALE,
  SPACE: 10 * SCALE,
  PADDING: Math.round(4 * SCALE * SCALE),
  TITLE_SIZE: 40,
  TITLE_MIN: 20,
  OUTLINE: 3,
  CROPPED_MARGIN: 10
};

const CROP = {
  START: 1 / 3.25,
  WIDTH: 1 / 2.75
};

// =============================
// 🚀 CACHE GLOBAL
// =============================

const imageCache = new Map();
const croppedCache = new Map();

// =============================
// 🧠 HELPERS
// =============================

const normalizeName = name =>
  name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function obtenerManoInicial(deck, handSize = 5) {
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, handSize);
}

// =============================
// 🌐 FETCH CARTA
// =============================

async function cardFetcher(input) {
  try {
    const isId = /^\d+$/.test(input);

    const url = isId
      ? `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${input}`
      : `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(normalizeName(input))}`;

    const { data } = await axios.get(url, { timeout: 10000 });

    return data?.data?.[0] || null;

  } catch (err) {
    console.error("Error buscando carta:", err.message);
    return null;
  }
}

async function loadCardImage(id) {
  if (imageCache.has(id)) {
    return imageCache.get(id);
  }

  try {
    const response = await axios.get(
      `https://yugi.wiki/assets/card-images/common/${id}.jpg`,
      {
        responseType: "arraybuffer",
        timeout: 10000
      }
    );

    const img = await loadImage(response.data);
    imageCache.set(id, img);

    return img;

  } catch (err) {
    console.error("Error cargando imagen:", id);
    return null;
  }
}

// =============================
// 🖼️ LOAD CROPPED IMAGE (CORRECTO)
// =============================

async function loadCroppedImage(id) {
  if (croppedCache.has(id)) {
    return croppedCache.get(id);
  }

  try {
    const response = await axios.get(
      `https://images.ygoprodeck.com/images/cards_cropped/${id}.jpg`,
      {
        responseType: "arraybuffer",
        timeout: 10000
      }
    );

    const img = await loadImage(response.data);
    croppedCache.set(id, img);

    return img;

  } catch (err) {
    console.error("Error cargando cropped:", id);
    return null;
  }
}

// =============================
// 🎴 GENERAR MANO
// =============================

async function generarImagen(cartas) {
  const canvas = createCanvas(
    cartas.length * (CARD.WIDTH + LAYOUT.GAP),
    CARD.HEIGHT
  );

  const ctx = canvas.getContext("2d");

  const images = await Promise.all(
    cartas.map(id => loadCardImage(id))
  );

  images.forEach((img, i) => {
    if (!img) return;

    ctx.drawImage(
      img,
      i * (CARD.WIDTH + LAYOUT.GAP),
      0,
      CARD.WIDTH,
      CARD.HEIGHT
    );
  });

  return canvas.toBuffer("image/png");
}

// =============================
// 🧩 GENERATE DECK IMAGE
// =============================

async function generateDeckImage(main, extra, side, cardMap, croppedInput = null, memberColor = null) {

  const decks = [
    { cards: main, title: "Main Deck", align: "left", insideBox: false },
    { cards: extra, title: "Extra Deck", align: "right", insideBox: true },
    { cards: side, title: "Side Deck", align: "right", insideBox: true }
  ].filter(d => d.cards?.length);

  if (!decks.length) return null;

  const color = memberColor || EMBED_COLOR;

  const uniqueIds = [...new Set(decks.flatMap(d => d.cards))];

  const imagesArray = await Promise.all(
    uniqueIds.map(id => loadCardImage(id))
  );

  const imagesMap = {};
  uniqueIds.forEach((id, i) => {
    if (imagesArray[i]) imagesMap[id] = imagesArray[i];
  });

  let croppedImg = null;

  if (croppedInput) {
    const card = await cardFetcher(croppedInput);
    if (card?.id) {
      croppedImg = await loadCroppedImage(card.id);
    }
  }

  if (!croppedImg && main[0]) {
    croppedImg = await loadCroppedImage(main[0]);
  }

  const dims = decks.map(d => {
    const rows = Math.ceil(d.cards.length / CARD.COLUMNS);
    const inner = LAYOUT.PADDING + LAYOUT.GAP;

    return {
      ...d,
      width: CARD.COLUMNS * CARD.WIDTH +
             (CARD.COLUMNS - 1) * LAYOUT.GAP +
             inner * 2,
      height: rows * CARD.HEIGHT +
              (rows - 1) * LAYOUT.GAP +
              inner * 2,
      innerPadding: inner,
      extraSpace: d.insideBox ? 0 : 60
    };
  });

  const totalHeight =
    dims.reduce((s, d) => s + d.height + d.extraSpace, 0) +
    LAYOUT.SPACE * (dims.length - 1);

  const croppedWidth = croppedImg
    ? (croppedImg.width * CROP.WIDTH) * totalHeight / croppedImg.height
    : 0;

  const totalWidth = Math.ceil(
    croppedWidth +
    Math.max(...dims.map(d => d.width)) +
    LAYOUT.CROPPED_MARGIN * 2 +
    LAYOUT.GAP * 2
  );

  const canvas = createCanvas(totalWidth, totalHeight);
  const ctx = canvas.getContext("2d");

  const drawOutline = (text, x, y, size) => {
    ctx.font = `${size}px sans-serif`;
    ctx.textBaseline = "bottom";
    ctx.fillStyle = color;

    for (const dx of [-LAYOUT.OUTLINE, 0, LAYOUT.OUTLINE])
      for (const dy of [-LAYOUT.OUTLINE, 0, LAYOUT.OUTLINE])
        if (dx || dy)
          ctx.fillText(text, x + dx, y + dy);
  };

  if (croppedImg) {
    const sx = croppedImg.width * CROP.START;
    const sW = croppedImg.width * CROP.WIDTH;
    const sH = croppedImg.height;

    const scale = (totalHeight - LAYOUT.CROPPED_MARGIN * 2) / sH;
    const finalW = sW * scale;
    const finalH = sH * scale;

    ctx.lineWidth = LAYOUT.PADDING * 2;
    ctx.strokeStyle = color;

    ctx.strokeRect(
      LAYOUT.CROPPED_MARGIN,
      LAYOUT.CROPPED_MARGIN,
      finalW,
      finalH
    );

    ctx.drawImage(
      croppedImg,
      sx, 0,
      sW, sH,
      LAYOUT.CROPPED_MARGIN,
      LAYOUT.CROPPED_MARGIN,
      finalW,
      finalH
    );
  }

  let offsetY = 0;
  const xOffset =
    croppedWidth +
    LAYOUT.CROPPED_MARGIN * 2 +
    LAYOUT.GAP * 2;

  for (const d of dims) {

    ctx.lineWidth = LAYOUT.PADDING;
    ctx.strokeStyle = color;

    ctx.strokeRect(
      xOffset + LAYOUT.PADDING / 2,
      offsetY + LAYOUT.PADDING / 2,
      d.width - LAYOUT.PADDING,
      d.height - LAYOUT.PADDING
    );

    d.cards.forEach((id, i) => {
      const img = imagesMap[id];
      if (!img) return;

      const x = xOffset + d.innerPadding +
                (i % CARD.COLUMNS) * (CARD.WIDTH + LAYOUT.GAP);

      const y = offsetY + d.innerPadding +
                Math.floor(i / CARD.COLUMNS) * (CARD.HEIGHT + LAYOUT.GAP);

      ctx.drawImage(img, x, y, CARD.WIDTH, CARD.HEIGHT);
    });

    let fontSize = LAYOUT.TITLE_SIZE;
    ctx.font = `${fontSize}px sans-serif`;

    let tWidth = ctx.measureText(d.title).width;

    while (tWidth > d.width - d.innerPadding * 2 &&
           fontSize > LAYOUT.TITLE_MIN) {
      fontSize -= 2;
      ctx.font = `${fontSize}px sans-serif`;
      tWidth = ctx.measureText(d.title).width;
    }

    const textX = d.align === "left"
      ? xOffset + LAYOUT.PADDING
      : xOffset + d.width - tWidth - LAYOUT.PADDING;

    const textY = d.insideBox
      ? offsetY + d.height - LAYOUT.PADDING
      : offsetY + d.height + LAYOUT.GAP + fontSize;

    drawOutline(d.title, textX, textY, fontSize);

    ctx.fillStyle = "white";
    ctx.fillText(d.title, textX, textY);

    offsetY += d.height + d.extraSpace + LAYOUT.SPACE;
  }

  return canvas.toBuffer("image/png");
}

module.exports = {
  generarImagen,
  generateDeckImage,
  obtenerManoInicial
};
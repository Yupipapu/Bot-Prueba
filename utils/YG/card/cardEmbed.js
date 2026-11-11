const { EmbedBuilder } = require("discord.js");
const { getCardTypeColor, typeColors } = require("../colors");
const {
  attributeEmojis,
  genesysEmoji,
  levelEmojis,
  pendulumEmoji,
  linkMarkersMap,
  monsterTypeEmojis,
  spellEmojis,
  trapEmojis,
} = require("../../emojis");
const genesysPoints = require("../genesysPoints.json");

/* ============================================================
   🔠 Helper Functions
============================================================ */
function formatCardType(card) {
  if (!card.type) return "Unknown";

  let typeStr = card.type
    .replace("Spell Card", "Spell")
    .replace("Trap Card", "Trap")
    .replace(/ Monster/g, "");

  let parts = [...new Set(typeStr.split(" ").filter(Boolean))];

  const mainTypes = ["Ritual", "Fusion", "Synchro", "XYZ", "Link"];
  const subTypes = [
    "Flip",
    "Tuner",
    "Spirit",
    "Union",
    "Gemini",
    "Toon",
    "Pendulum",
  ];

  let main = parts.filter((p) => mainTypes.includes(p));
  let sub = parts.filter((p) => subTypes.includes(p));
  let others = parts.filter(
    (p) =>
      !mainTypes.includes(p) &&
      !subTypes.includes(p) &&
      !["Effect", "Normal"].includes(p),
  );

  // Determinar Effect/Normal
  let effectOrNormal = parts.find((p) => p === "Effect" || p === "Normal");

  if (!effectOrNormal) {
    if (card.desc && card.desc.toLowerCase().includes("effect")) {
      effectOrNormal = "Effect";
    } else if (card.desc && card.desc.toLowerCase().includes("flip")) {
      effectOrNormal = "Effect";
    } else {
      effectOrNormal = "Normal";
    }
  }

  return [...main, ...sub, ...others, effectOrNormal].join("/");
}

function getCardEmojis(card) {
  const isSpell = card.type?.includes("Spell");
  const isTrap = card.type?.includes("Trap");
  let typeEmoji = "";

  if (isSpell && card.race) {
    const key =
      card.race === "Quick-Play" ? "Quick" : card.race.replace(/\s+/g, "-");
    typeEmoji = spellEmojis[key] || spellEmojis["Normal"];
  } else if (isTrap && card.race) {
    typeEmoji = trapEmojis[card.race] || trapEmojis["Normal"];
  } else {
    const primaryType = card.type?.split(" ")[0];
    typeEmoji =
      monsterTypeEmojis[card.race] || monsterTypeEmojis[primaryType] || "";
  }

  const attributeEmoji = attributeEmojis[card.attribute] || "";
  const levelOrRankName = card.type?.includes("Link")
    ? "Link"
    : card.type?.includes("XYZ")
      ? "Rank"
      : "Level";
  const levelOrRankEmoji = levelEmojis[levelOrRankName] || "";

  return { typeEmoji, attributeEmoji, levelOrRankEmoji };
}

/* ============================================================
   🔧 Main Function
============================================================ */
function cardEmbed(card, requestingUser, lang) {
  const isSpellOrTrap =
    card.type.includes("Spell") || card.type.includes("Trap");
  const isPendulum =
    card.desc.includes("[ Pendulum Effect ]") && card.scale !== undefined;
  const isLink = card.type.includes("Link");
  const isXYZ = card.type.includes("XYZ");

  // Split card description
  const fullDesc = card.desc || lang.NO_DESCRIPTION;
  const [_, pendulumDescPart] = fullDesc.split("[ Pendulum Effect ]");
  const pendulumDesc = pendulumDescPart?.split("[ Monster Effect ]")[0]?.trim();
  const normalDesc = isPendulum
    ? pendulumDescPart?.includes("[ Monster Effect ]")
      ? pendulumDescPart.split("[ Monster Effect ]")[1].trim()
      : fullDesc.split("[ Pendulum Effect ]")[0].trim()
    : fullDesc;

  // Level / Rank
  const rawLevelOrRank = isLink ? card.linkval : (card.level ?? card.rank);
  const levelOrRank =
    rawLevelOrRank != null ? rawLevelOrRank.toString() : "N/A";

  // Link markers
  const linkMarkers = card.linkmarkers
    ? Array.isArray(card.linkmarkers)
      ? card.linkmarkers
          .map((marker) => linkMarkersMap[marker.trim()] || marker.trim())
          .join(" ")
      : card.linkmarkers.toString()
    : null;

  // Emojis
  const { typeEmoji, attributeEmoji, levelOrRankEmoji } = getCardEmojis(card);

  // Genesys points
  const genesysScore = genesysPoints[card.name] ?? 0;

  // Embed fields
  const fields = [
    {
      name: lang.TYPE,
      value: isSpellOrTrap
        ? `${typeEmoji} ${card.race || "Normal"}/${card.type.includes("Spell") ? "Spell" : "Trap"}`
        : `${typeEmoji} ${card.race || "Unknown"}/${formatCardType(card)}`,
      inline: true,
    },
    ...(!isSpellOrTrap
      ? [
          {
            name: isLink ? lang.LINK : isXYZ ? lang.RANK : lang.LEVEL,
            value: `${levelOrRankEmoji} ${levelOrRank}`,
            inline: true,
          },
        ]
      : []),
    ...(!isSpellOrTrap
      ? [
          {
            name: lang.ATTRIBUTE,
            value: `${attributeEmoji} ${card.attribute || "N/A"}`,
            inline: true,
          },
        ]
      : []),
    ...(card.atk !== undefined
      ? [
          {
            name: lang.ATK,
            value: card.atk === -1 ? "?" : card.atk.toString(),
            inline: true,
          },
        ]
      : []),
    ...(card.def !== undefined && !isLink
      ? [{ name: lang.DEF, value: card.def.toString(), inline: true }]
      : []),
    ...(card.scale !== undefined
      ? [
          {
            name: lang.PENDULUM_SCALE,
            value: `${pendulumEmoji.pendulumscale1} ${card.scale} ${pendulumEmoji.pendulumscale2}`,
            inline: true,
          },
        ]
      : []),
    ...(linkMarkers
      ? [{ name: lang.LINK_MARKERS, value: linkMarkers, inline: false }]
      : []),
    ...(card.archetype
      ? [{ name: lang.ARCHETYPE, value: card.archetype, inline: true }]
      : []),
    {
      name: lang.GENESYS,
      value: `${genesysEmoji.genesys} ${genesysScore} pts`,
      inline: true,
    },
    { name: lang.CARD_ID, value: card.id.toString(), inline: true },
    { name: lang.CARD_TEXT, value: normalDesc },
  ];

  const cardUrl = `https://ygoprodeck.com/card/?search=${card.id}&utm_source`;

  // Create main embed
  const mainEmbed = new EmbedBuilder()
    .setTitle(card.name)
    .setURL(cardUrl)
    .setThumbnail(
      card.card_images?.[0]?.image_url_cropped ||
        card.card_images?.[0]?.image_url,
    )
    .setColor(getCardTypeColor(card.type))
    .addFields(fields)
    .setFooter({
      text: lang.REQUESTED_BY.replace("{user}", requestingUser.username),
      iconURL: requestingUser.displayAvatarURL(),
    })
    .setTimestamp();

  const embeds = [mainEmbed];

  // Pendulum effect embed
  if (isPendulum && pendulumDesc) {
    embeds.push(
      new EmbedBuilder()
        .setTitle(lang.PENDULUM_EFFECT)
        .setColor(typeColors["Spell Card"])
        .setDescription(pendulumDesc)
        .setFooter({
          text: lang.REQUESTED_BY.replace("{user}", requestingUser.username),
          iconURL: requestingUser.displayAvatarURL(),
        })
        .setTimestamp(),
    );
  }

  return embeds;
}

module.exports = { cardEmbed };

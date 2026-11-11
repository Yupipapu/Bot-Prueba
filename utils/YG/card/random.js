const axios = require('axios');
const { cardEmbed } = require('./cardEmbed');
const { getLang } = require("../../../database/guildLang");

let cachedCards = null;

// Función para obtener la lista de cartas y cachearla
async function getAllCards() {
  if (cachedCards) return cachedCards;

  const { data } = await axios.get('https://db.ygoprodeck.com/api/v7/cardinfo.php');
  if (!data.data || data.data.length === 0) return [];
  cachedCards = data.data;
  return cachedCards;
}

// Función para obtener una carta aleatoria
async function fetchRandomCard() {
  const allCards = await getAllCards();
  if (allCards.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * allCards.length);
  return allCards[randomIndex];
}

module.exports = {
  async execute(interaction) {
    // Cargar idioma según la guild
    const lang = require(`../../../lang/${await getLang(interaction.guildId)}.js`);

    await interaction.deferReply();
    const carta = await fetchRandomCard();
    if (!carta)
      return interaction.editReply(lang.CARD_NOT_FOUND_RANDOM); // nuevo texto en lang

    const embeds = cardEmbed(carta, interaction.user, lang);
    return interaction.editReply({ embeds });
  }
};
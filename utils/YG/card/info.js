const { cardFetcher } = require("./cardFetcher");
const { cardEmbed } = require("./cardEmbed");
const { getLang } = require("../../../database/guildLang");

module.exports = {
  async execute(interaction) {
    // Cargar idioma según la guild
    const lang = require(`../../../lang/${await getLang(interaction.guildId)}.js`);
    const input = interaction.options.getString("input");
    await interaction.deferReply();

    const guildLanguage = await getLang(interaction.guildId);

    // Mapear idioma del bot → idioma API
    const mapApiLang = (lang) => {
      const supported = ["en", "fr", "de", "it", "pt", "es"];
      return supported.includes(lang) ? lang : "en";
    };

    const carta = await cardFetcher(input, mapApiLang(guildLanguage));
    if (!carta) {
      return interaction.editReply(lang.CARD_NOT_FOUND.replace("{input}", input));
    }

    const embeds = cardEmbed(carta, interaction.user, lang);
    await interaction.editReply({ embeds: Array.isArray(embeds) ? embeds : [embeds] });

  },
};
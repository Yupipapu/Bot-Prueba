const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../../../config/config");
const axios = require("axios");
const { getLang } = require("../../../database/guildLang");

module.exports = {
  async execute(interaction) {
    const lang = require(`../../../lang/${await getLang(interaction.guildId)}.js`);
    const input = interaction.options.getString("input");
    await interaction.deferReply();

    try {
      const archetypes = (await axios.get("https://db.ygoprodeck.com/api/v7/archetypes.php")).data;
      if (!archetypes?.length) return interaction.editReply(lang.ARCHETYPE_LIST_FAIL);

      const archetype = archetypes.find(a => a.archetype_name?.toLowerCase().includes(input.toLowerCase()));
      if (!archetype) return interaction.editReply(lang.ARCHETYPE_NOT_FOUND.replace("{input}", input));

      const cards = (await axios.get(`https://db.ygoprodeck.com/api/v7/cardinfo.php?archetype=${encodeURIComponent(archetype.archetype_name)}`)).data?.data || [];
      if (!cards.length) return interaction.editReply(lang.ARCHETYPE_NO_CARDS);

      const member = interaction.options.getMember("usuario") || interaction.member;
      const embed = new EmbedBuilder()
        .setTitle(lang.ARCHETYPE_TITLE.replace("{name}", archetype.archetype_name))
        .setDescription(cards.map(c => c.name).join("\n"))
        .setColor(member?.roles?.highest?.color || EMBED_COLOR)
        .setFooter({ text: lang.REQUESTED_BY.replace("{user}", interaction.user.username), iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error("ARQUETIPO ERROR:", err);
      interaction.editReply("❌ Error al consultar el arquetipo.");
    }
  },
};
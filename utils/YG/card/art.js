const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getLang } = require("../../../database/guildLang");
const { cardFetcher } = require("./cardFetcher");
const { getCardTypeColor } = require("../colors");

module.exports = {
  async execute(interaction) {
    const lang = require(`../../../lang/${await getLang(interaction.guildId)}.js`);
    const input = interaction.options.getString("input");
    await interaction.deferReply();

    try {
      const carta = await cardFetcher(input);
      if (!carta) return interaction.editReply(lang.ART_NOT_FOUND);
      if (!carta.card_images?.length) return interaction.editReply(lang.ART_NO_IMAGES);

      let index = 0;
      const total = carta.card_images.length;

      const buildEmbed = (i = index) => {
        const img = carta.card_images[i].image_url_cropped;
        return new EmbedBuilder()
          .setTitle(`${carta.name} — ${lang.ART_TITLE} ${i + 1}/${total}`)
          .setURL(img)
          .setImage(img)
          .setColor(getCardTypeColor(carta.type))
          .setFooter({ text: lang.REQUESTED_BY.replace("{user}", interaction.user.username), iconURL: interaction.user.displayAvatarURL() })
          .setTimestamp();
      };

      const buildButtons = () =>
        new ActionRowBuilder().addComponents(
          ["prev", "next"].map((id, idx) => new ButtonBuilder().setCustomId(id).setLabel(idx === 0 ? "⬅️" : "➡️").setStyle(ButtonStyle.Primary)),
          new ButtonBuilder().setCustomId("all").setLabel(lang.ART_ALL_BUTTON).setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("stop").setLabel("🛑").setStyle(ButtonStyle.Danger)
        );

      const msg = await interaction.editReply({ embeds: [buildEmbed()], components: [buildButtons()], fetchReply: true });

      const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 60_000 });

      collector.on("collect", async i => {
        await i.deferUpdate();
        switch (i.customId) {
          case "prev": index = (index - 1 + total) % total; break;
          case "next": index = (index + 1) % total; break;
          case "all":
            collector.stop("all");
            return interaction.editReply({ embeds: carta.card_images.map((_, idx) => buildEmbed(idx)), components: [] });
          case "stop":
            collector.stop("user");
            return interaction.editReply({ components: [] });
        }
        interaction.editReply({ embeds: [buildEmbed()], components: [buildButtons()] });
      });

      collector.on("end", (_c, reason) => { if (!["all", "user"].includes(reason)) interaction.editReply({ components: [] }).catch(() => {}); });

    } catch (e) {
      console.error("Error en art:", e);
      interaction.editReply(lang.ART_ERROR);
    }
  },
};

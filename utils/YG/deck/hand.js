const { AttachmentBuilder, ActionRowBuilder, EmbedBuilder,
ButtonBuilder, ButtonStyle } = require("discord.js");

const { EMBED_COLOR } = require("../../../config/config");
const axios = require("axios");

const { generarImagen, obtenerManoInicial } = require("./util-renderer");
const { processDeckFile } = require("./util");
const { getLang } = require("../../../database/guildLang");

function generarBotones(lang) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("draw_again")
      .setLabel(lang.DRAW_AGAIN)
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("draw_one")
      .setLabel(lang.DRAW_ONE)
      .setStyle(ButtonStyle.Success)
  );
}

function generarEmbed({ fileName, member, interaction, cartas, titulo, lang }) {
  return new EmbedBuilder()
    .setTitle(titulo || lang.STARTING_HAND)
    .setDescription(`${lang.CARDS_FROM} **${fileName}**: ${cartas.length}`)
    .setColor(member.roles.highest?.color || EMBED_COLOR)
    .setImage("attachment://hand.png")
    .setFooter({
      text: lang.REQUESTED_BY.replace("{user}", interaction.user.username),
      iconURL: interaction.user.displayAvatarURL()
    })
    .setTimestamp();
}

async function generarAttachment(cartas) {
  const buffer = await generarImagen(cartas);
  return new AttachmentBuilder(buffer, { name: "hand.png" });
}

async function actualizarMensaje(interaction, { embed, attachment, row }) {
  await interaction.editReply({
    embeds: [embed],
    files: [attachment],
    components: [row]
  });
}

module.exports = {
  async execute(interaction) {

    const lang = require(`../../../lang/${await getLang(interaction.guildId)}.js`);
    const file = interaction.options.getAttachment("archivo");

    // ❌ Validación archivo
    if (!file || !file.name.endsWith(".ydk")) {
      return interaction.reply({
        content: lang.INVALID_FILE,
        flags: 64
      });
    }

    await interaction.deferReply();

    try {

      // 📥 Descargar archivo
      const response = await axios.get(file.url);
      const lines = response.data.split("\n");
      const { main: mainDeck } = processDeckFile(lines);

      if (mainDeck.length < 5) {
        return interaction.editReply(lang.NEED_5_CARDS);
      }

      // 📛 Nombre limpio
      const fileName = file.name
        .replace(/_/g, " ")
        .replace(".ydk", "");

      const member =
        interaction.options.getMember("usuario") || interaction.member;

      let currentDeck = [...mainDeck];
      let currentHand = obtenerManoInicial(currentDeck, 5);

      const row = generarBotones(lang);

      // 🎴 Primera mano
      const attachment = await generarAttachment(currentHand);

      const embed = generarEmbed({
        fileName,
        member,
        interaction,
        cartas: currentHand,
        titulo: lang.STARTING_HAND,
        lang
      });

      await actualizarMensaje(interaction, { embed, attachment, row });

      const reply = await interaction.fetchReply();

      // ==================================================
      // 🎛️ COLLECTOR
      // ==================================================
      const collector = reply.createMessageComponentCollector({
        time: 15 * 60 * 1000
      });

      collector.on("collect", async (btnInt) => {

        if (btnInt.user.id !== interaction.user.id) {
          return btnInt.reply({
            content: lang.NO_ACCESS,
            flags: 64
          });
        }

        await btnInt.deferUpdate();

        try {

          // 🔄 DRAW AGAIN
          if (btnInt.customId === "draw_again") {

            currentHand = obtenerManoInicial(currentDeck, 5);

            const attachment = await generarAttachment(currentHand);

            const embed = generarEmbed({
              fileName,
              member,
              interaction,
              cartas: currentHand,
              titulo: lang.STARTING_HAND,
              lang
            });

            await actualizarMensaje(interaction, { embed, attachment, row });
          }

          // ➕ DRAW ONE
          if (btnInt.customId === "draw_one") {

            const remaining = currentDeck.filter(
              id => !currentHand.includes(id)
            );

            if (!remaining.length) {
              return interaction.followUp({
                content: lang.NO_CARDS_LEFT,
                flags: 64
              });
            }

            const nextCard =
              remaining[Math.floor(Math.random() * remaining.length)];

            currentHand.push(nextCard);

            const attachment = await generarAttachment(currentHand);

            const embed = generarEmbed({
              fileName,
              member,
              interaction,
              cartas: currentHand,
              titulo: lang.DRAW_ONE,
              lang
            });

            await actualizarMensaje(interaction, { embed, attachment, row });
          }

        } catch (err) {
          console.error("Collector error:", err);
        }

      });

      // 🛑 Cuando termina el tiempo
      collector.on("end", async () => {
        try {
          await interaction.editReply({
            components: []
          });
        } catch {}
      });

    } catch (error) {
      console.error(error);
      await interaction.editReply(lang.ERROR_FILE);
    }
  }
};
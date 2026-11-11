const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { EMBED_COLOR } = require('../../../config/config');
const { processDeckFile, fetchYDK, getCardInfoMapImg } = require('./util');
const { levelEmojis } = require('../../emojis');
const { generateDeckImage } = require('./util-renderer');
const { getLang } = require('../../../database/guildLang');
const path = require('path');

module.exports = {
  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: false });

      // Cargar idioma del servidor
      const lang = require(`../../../lang/${await getLang(interaction.guildId)}.js`);

      const file = interaction.options.getAttachment('archivo');
      if (!file?.name.endsWith('.ydk')) {
        return interaction.editReply({
          content: lang.INVALID_FILE || '⚠️ El archivo debe ser un .ydk válido.'
        });
      }

      const content = await fetchYDK(file.url);
      const { main, extra, side } = processDeckFile(content.split('\n'));
      const allIds = [...main, ...extra, ...side];
      const cardMap = await getCardInfoMapImg(allIds);

      const croppedInput = interaction.options.getString('cropped') || null;
      const member = interaction.options.getMember('usuario') || interaction.member;

      const color = member?.roles?.highest?.color
        ? `#${member.roles.highest.color.toString(16).padStart(6, '0')}`
        : EMBED_COLOR;

      const buffer = await generateDeckImage(main, extra, side, cardMap, croppedInput, color);

      if (!buffer) {
        return interaction.editReply({
          content: lang.GEN_FAIL || '❌ No se pudo generar la imagen del deck.'
        });
      }

      const attachment = new AttachmentBuilder(buffer, { name: 'deck.png' });
      const fileName = path.parse(file.name).name.replace(/_/g, ' ');

      /* ===============================
         CAMPOS CONDICIONALES
      =============================== */

      const deckSections = [
        { data: main, label: lang.MAIN_DECK || 'Main Deck:' },
        { data: extra, label: lang.EXTRA_DECK || 'Extra Deck:' },
        { data: side, label: lang.SIDE_DECK || 'Side Deck:' }
      ];

      const fields = deckSections
        .filter(section => section.data.length > 0)
        .map(section => ({
          name: section.label,
          value: `${levelEmojis.cardback} \`${section.data.length}\``,
          inline: true
        }));

      const embed = new EmbedBuilder()
        .setTitle(fileName)
        .setColor(color)
        .setImage('attachment://deck.png')
        .addFields(...fields)
        .setFooter({
          text: lang.REQUESTED_BY
            ? lang.REQUESTED_BY.replace("{user}", interaction.user.username)
            : `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL()
        })
        .setTimestamp();

      await interaction.editReply({
        embeds: [embed],
        files: [attachment]
      });

    } catch (err) {
      console.error('Error al procesar el archivo:', err);

      const msg = lang?.ERROR_FILE || "❌ There was an error processing the file.";

      interaction.deferred || interaction.replied
        ? await interaction.editReply({ content: msg }).catch(() => {})
        : await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
    }
  }
};
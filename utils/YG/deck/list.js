const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EMBED_COLOR } = require('../../../config/config');
const { getCardNames, processDeckFile, formatDeckSection } = require('./util');
const { levelEmojis } = require('../../emojis');
const { request } = require('undici');
const { getLang } = require('../../../database/guildLang');

module.exports = {
  async execute(interaction) {
    await interaction.deferReply();

    const lang = require(`../../../lang/${await getLang(interaction.guildId)}.js`);

    const file = interaction.options.getAttachment('archivo');
    if (!file.name.endsWith('.ydk')) {
      return interaction.editReply(lang.INVALID_FILE || "Invalid file");
    }

    try {
      const res = await request(file.url);
      const body = await res.body.text();
      const lines = body.split('\n');

      const { main, extra, side } = processDeckFile(lines);
      const allIds = [...main, ...extra, ...side];
      const nameMap = await getCardNames(allIds);

      const mainText = formatDeckSection(main, nameMap);
      const extraText = formatDeckSection(extra, nameMap);
      const sideText = formatDeckSection(side, nameMap);

      const fileName = file.name.replace(/_/g, ' ').replace('.ydk', '');
      const member = interaction.options.getMember('usuario') || interaction.member;

      /* ===============================
         SECCIONES DINÁMICAS
      =============================== */

      const deckSections = [
        { id: 'ver_main', data: main, label: lang.MAIN_DECK, text: mainText },
        { id: 'ver_extra', data: extra, label: lang.EXTRA_DECK, text: extraText },
        { id: 'ver_side', data: side, label: lang.SIDE_DECK, text: sideText }
      ];

      const existingSections = deckSections.filter(section => section.data.length > 0);

      /* ===============================
         EMBED PRINCIPAL
      =============================== */

      const summaryFields = existingSections.map(section => ({
        name: `${levelEmojis.cardback} ${section.label}`,
        value: `${section.data.length} cartas`,
        inline: false
      }));

      const embed = new EmbedBuilder()
        .setTitle(fileName)
        .setColor(member?.roles?.highest?.color || EMBED_COLOR)
        .addFields(...summaryFields)
        .setFooter({
          text: `Solicitado por ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      /* ===============================
         BOTONES CONDICIONALES
      =============================== */

      const buttonComponents = [];

      // Botón "Completo" solo si hay más de una sección
      if (existingSections.length > 1) {
        buttonComponents.push(
          new ButtonBuilder()
            .setCustomId('ver_completo')
            .setLabel(lang.BUTTON_COMPLETE || "Deck Complete")
            .setStyle(ButtonStyle.Primary)
        );
      }

      // Botones individuales solo si existen
      for (const section of existingSections) {
        buttonComponents.push(
          new ButtonBuilder()
            .setCustomId(section.id)
            .setLabel(
              section.id === 'ver_main'
                ? lang.BUTTON_MAIN || "Main"
                : section.id === 'ver_extra'
                ? lang.BUTTON_EXTRA || "Extra"
                : lang.BUTTON_SIDE || "Side"
            )
            .setStyle(ButtonStyle.Secondary)
        );
      }

      const row = buttonComponents.length
        ? [new ActionRowBuilder().addComponents(buttonComponents)]
        : [];

      await interaction.editReply({ embeds: [embed], components: row });

      const replyMessage = await interaction.fetchReply();

      const collector = replyMessage.createMessageComponentCollector({
        time: 60_000,
        filter: i => i.user.id === interaction.user.id
      });

      /* ===============================
         MANEJO DE BOTONES
      =============================== */

      collector.on('collect', async i => {
        const embedTitle = (suffix) => `${fileName} - ${suffix}`;

        const createDeckEmbed = (sections, titleSuffix) => {
          const fields = sections.map(section => ({
            name: section.label,
            value: section.text || '—',
            inline: false
          }));

          return new EmbedBuilder()
            .setTitle(embedTitle(titleSuffix))
            .setColor(member?.roles?.highest?.color || EMBED_COLOR)
            .addFields(...fields)
            .setFooter({
              text: `Solicitado por ${i.user.username}`,
              iconURL: i.user.displayAvatarURL()
            })
            .setTimestamp();
        };

        let embedContent;

        if (i.customId === 'ver_completo') {
          embedContent = createDeckEmbed(existingSections, lang.DECK_COMPLETE);
        } else {
          const section = existingSections.find(s => s.id === i.customId);
          if (section) {
            embedContent = createDeckEmbed([section], section.label);
          }
        }

        if (embedContent) {
          await i.update({ embeds: [embedContent], components: row });
        } else {
          await i.deferUpdate();
        }
      });

    } catch (err) {
      console.error(err);
      await interaction.editReply(
        lang.ERROR_FILE || "❌ There was an error processing the file."
      );
    }
  }
};
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { IMGUR_CLIENT_ID, EMBED_COLOR } = require('../../config/config');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poggers')
    .setDescription('Muestra una imagen aleatoria de Senko'),

  async execute(interaction) {
    try {
      const response = await axios.get('https://api.imgur.com/3/album/TuaP5da/images', {
        headers: {
          'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`,
        },
      });

      if (response.data.success) {
        const images = response.data.data.map(image => image.link);
        const randomImage = images[Math.floor(Math.random() * images.length)];
        const member = interaction.options.getMember('usuario') || interaction.member;
        const embed = new EmbedBuilder()
          .setTitle('Poggers')
          .setImage(randomImage)
          .setColor(member?.roles?.highest?.color || EMBED_COLOR)
          .setTimestamp()
          .setFooter({
            text: `Solicitado por ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          });

        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply('No se pudieron obtener las imágenes de Imgur.');
      }
    } catch (error) {
      console.error('Error al obtener imágenes de Imgur:', error);
      await interaction.reply('Hubo un error al intentar obtener las imágenes de Imgur.');
    }
  },
};
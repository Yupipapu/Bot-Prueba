const { EmbedBuilder } = require('discord.js');

module.exports = {
  async execute(interaction) {
    await interaction.deferReply();
    const bannerURL = interaction.guild.bannerURL({ size: 1024, extension: 'png', dynamic: true });
    if (!bannerURL) {
      return interaction.editReply('Este servidor no tiene un banner configurado.');
    }

    const member = interaction.options.getMember('usuario') || interaction.member;

    const embed = new EmbedBuilder()
      .setTitle(`Banner de ${interaction.guild.name}`)
      .setImage(bannerURL)
      .setColor(member.roles.highest.color)
      .setTimestamp()
      .setFooter({
        text: `Solicitado por ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    await interaction.editReply({ embeds: [embed] });
  }
};
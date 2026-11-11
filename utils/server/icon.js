const { EmbedBuilder } = require('discord.js');

module.exports = {
  async execute(interaction) {
    await interaction.deferReply();
    const iconURL = interaction.guild.iconURL({ size: 1024, extension: 'png', dynamic: true });
    if (!iconURL) {
      return interaction.editReply('Este servidor no tiene un icono configurado.');
    }
    const member = interaction.options.getMember('usuario') || interaction.member;

    const embed = new EmbedBuilder()
      .setTitle(`Icono de ${interaction.guild.name}`)
      .setImage(iconURL)
      .setColor(member.roles.highest.color)
      .setTimestamp()
      .setFooter({
        text: `Solicitado por ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    await interaction.editReply({ embeds: [embed] });
  }
};
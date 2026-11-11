const { EmbedBuilder } = require('discord.js');

module.exports = {
  async execute(interaction, memberParam, isUpdate = false, keepMenu = false) {
    const member = memberParam || interaction.member;

    const avatarEmbed = new EmbedBuilder()
      .setTitle(`Avatar de ${member.user.tag}`)
      .setImage(member.user.displayAvatarURL({ size: 1024, dynamic: true }))
      .setColor(member.displayHexColor)
      .setFooter({ text: `Solicitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    if (isUpdate) {
      await interaction.update({
        embeds: [avatarEmbed],
        components: keepMenu ? interaction.message.components : []
      });
    } else {
      await interaction.deferReply();
      await interaction.editReply({ embeds: [avatarEmbed] });
    }
  }
};
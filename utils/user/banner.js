const { EmbedBuilder } = require('discord.js');

module.exports = {
  async execute(interaction, memberParam, isUpdate = false, keepMenu = false) {
    const member = memberParam || interaction.member;
    const user = await member.user.fetch();

    // Crear embed base
    const embed = new EmbedBuilder()
      .setColor(member.displayHexColor)
      .setFooter({ 
        text: `Solicitado por ${interaction.user.username}`, 
        iconURL: interaction.user.displayAvatarURL() 
      })
      .setTimestamp();

    if (!user.banner) {
      // Usuario sin banner
      embed.setTitle(`${user.tag} no tiene un banner.`);

      if (isUpdate) {
        return interaction.update({ embeds: [embed], components: keepMenu ? interaction.message.components : [] });
      }

      await interaction.deferReply();
      return interaction.editReply({ embeds: [embed] });
    }

    // Usuario con banner
    embed
      .setTitle(`Banner de ${user.tag}`)
      .setImage(user.bannerURL({ size: 1024, dynamic: true }));

    if (isUpdate) {
      await interaction.update({ embeds: [embed], components: keepMenu ? interaction.message.components : [] });
    } else {
      await interaction.deferReply();
      await interaction.editReply({ embeds: [embed] });
    }
  }
};
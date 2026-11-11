const { EmbedBuilder } = require('discord.js');

module.exports = {
  async execute(interaction) {
    const { guild } = interaction;
    await guild.fetch();
    const owner = await guild.fetchOwner();

    const channels = guild.channels.cache;
    const count = type => channels.filter(c => c.type === type).size;

    const verificationLevels = ['Ninguno', 'Bajo', 'Medio', 'Alto', 'Muy alto'];
    const member = interaction.options.getMember('usuario') || interaction.member;

    const embed = new EmbedBuilder()
      .setColor(member.roles.highest.color)
      .setTitle(`Información de ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: 'ID del servidor', value: guild.id, inline: true },
        { name: 'Dueñ@', value: `${owner.user.tag} (${owner.id})`, inline: true },
        { name: 'Creación', value: `<t:${guild.createdTimestamp / 1000 | 0}:F>`, inline: true },

        { name: 'Miembros', value: `${guild.memberCount}`, inline: true },
        {
          name: 'Canales',
          value: [
            `Total: ${channels.size}`,
            `Texto: ${count(0)}`,
            `Voz: ${count(2)}`,
            `Categorías: ${count(4)}`
          ].join('\n'),
          inline: true
        },

        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Emojis', value: `${guild.emojis.cache.size}`, inline: true },

        {
          name: '🚀 Mejoras',
          value: `Nivel ${guild.premiumTier}\nBoosts: ${guild.premiumSubscriptionCount || 0}`,
          inline: true
        },

        { name: '🛡️ Verificación', value: verificationLevels[guild.verificationLevel], inline: true }
      )
      .setFooter({
        text: `Solicitado por ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
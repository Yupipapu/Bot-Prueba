const { EmbedBuilder } = require("discord.js");
const { badgeMap } = require("../emojis");

module.exports = {
  async execute(interaction, memberParam, isUpdate = false, keepMenu = false) {
    const member = memberParam || interaction.member;
    const user = await member.user.fetch();

    const flags = user.flags?.toArray() || [];
    const badges = flags.map(f => badgeMap[f] || f).join(' ');

    const joinedDiscord = `<t:${Math.floor(user.createdTimestamp / 1000)}:f> (hace <t:${Math.floor(user.createdTimestamp / 1000)}:R>)`;
    const joinedServer = `<t:${Math.floor(member.joinedTimestamp / 1000)}:f> (hace <t:${Math.floor(member.joinedTimestamp / 1000)}:R>)`;

    const color = member.displayHexColor !== '#000000' ? member.displayHexColor : 'Ninguno';
    const roles = member.roles.cache.filter(r => r.name !== '@everyone').map(r => r.toString()).join(', ') || 'Ninguno';

    const infoEmbed = new EmbedBuilder()
      .setTitle(`Información de ${member.user.tag}`)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setColor(member.displayHexColor)
      .addFields(
        { name: 'Usuario', value: `**ID**: \`${member.id}\`\n**Nombre**: ${user.tag}\n**Color**: \`${color}\`${badges ? `\n**Insignias**: ${badges}` : ''}`, inline: false },
        { name: 'Membresía en Discord', value: joinedDiscord, inline: false },
        { name: `Membresía en ${member.guild.name}`, value: joinedServer, inline: false },
        { name: 'Roles', value: roles, inline: false }
      )
      .setFooter({
         text: `Solicitado por ${interaction.user.username}`, 
         iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    if (isUpdate) {
      await interaction.update({
        embeds: [infoEmbed],
        components: keepMenu ? interaction.message.components : []
      });
    } else {
      await interaction.deferReply();
      await interaction.editReply({ embeds: [infoEmbed] });
    }
  }
};
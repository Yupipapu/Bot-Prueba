const { EmbedBuilder } = require('discord.js');

module.exports = {
  async execute(interaction) {
    await interaction.deferReply();

    const emojis = interaction.guild.emojis.cache;
    if (!emojis.size)
      return interaction.editReply('Este servidor no tiene emojis personalizados.');

    // Compactar el proceso de dividir en chunks
    const emojiChunks = emojis
      .map(e => e.toString() + ' ')
      .reduce((chunks, emoji) => {
        const last = chunks[chunks.length - 1];
        last.length + emoji.length > 1000
          ? chunks.push(emoji)
          : (chunks[chunks.length - 1] += emoji);
        return chunks;
      }, ['']);

    const member = interaction.options.getMember('usuario') || interaction.member;

    const embed = new EmbedBuilder()
      .setTitle(`Emojis de ${interaction.guild.name}`)
      .setColor(member.roles.highest.color)
      .setDescription(emojiChunks[0])
      .setFooter({
        text: `Total: ${emojis.size} • Solicitado por ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    // Enviar los demás chunks
    for (let i = 1; i < emojiChunks.length; i++) {
      await interaction.followUp({ content: emojiChunks[i], ephemeral: true });
    }
  }
};
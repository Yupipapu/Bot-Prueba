const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../../../config/config");
const repository = require("../teamRepository");

module.exports = {
    async execute(interaction) {

        await interaction.deferReply();
        repository.delete(interaction.user.id);
        const member = interaction.member;
        const embed = new EmbedBuilder()
            .setTitle("🗑️ Equipo eliminado")
            .setDescription("Tu equipo Pokémon ha sido eliminado correctamente.")
            .setColor(member?.roles?.highest?.color || EMBED_COLOR)
            .setTimestamp()
            .setFooter({
                text: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed]
        });
    }
};
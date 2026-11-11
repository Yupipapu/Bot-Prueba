const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../../../config/config");
const repository = require("../teamRepository");

module.exports = {
    async execute(interaction) {
        await interaction.deferReply();

        const team = repository.get(interaction.user.id);

        if (!team) {
            return interaction.editReply({
                content: "❌ Aún no has configurado un equipo Pokémon."
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("🎒 Tu equipo Pokémon")
            .setDescription(repository.format(team))
            .setColor(interaction.member?.roles?.highest?.color || EMBED_COLOR)
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
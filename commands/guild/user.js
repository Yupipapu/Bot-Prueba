const { ActionRowBuilder, SlashCommandBuilder, UserSelectMenuBuilder } = require('discord.js');
const avatarCommand = require('../../utils/user/avatar');
const bannerCommand = require('../../utils/user/banner');
const infoCommand = require('../../utils/user/info');

function createUserSelectMenu(type) {
  return new ActionRowBuilder().addComponents(
    new UserSelectMenuBuilder()
      .setCustomId(`select_user_${type}`)
      .setPlaceholder('Selecciona un usuario...')
      .setMaxValues(1)
  );
}

const subcommandsConfig = [
  { name: 'avatar', description: 'Muestra el avatar del usuario' },
  { name: 'banner', description: 'Muestra el banner del usuario' },
  { name: 'info', description: 'Muestra la información del usuario' }
];

const commandBuilder = new SlashCommandBuilder()
  .setName('user')
  .setDescription('Comandos relacionados con usuarios');

for (const sub of subcommandsConfig) {
  commandBuilder.addSubcommand(subcommand =>
    subcommand
      .setName(sub.name)
      .setDescription(sub.description)
      .addUserOption(option => 
        option
          .setName('usuario')
          .setDescription('Usuario')
          .setRequired(false)
      )
  );
}

module.exports = {
  data: commandBuilder,

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const member = interaction.options.getMember('usuario') || interaction.member;

    if (subcommand === 'avatar') await avatarCommand.execute(interaction, member);
    if (subcommand === 'banner') await bannerCommand.execute(interaction, member);
    if (subcommand === 'info') await infoCommand.execute(interaction, member);

    const menuRow = createUserSelectMenu(subcommand);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({
        components: [menuRow]
      });
    } else {
      await interaction.reply({
        components: [menuRow],
        ephemeral: true
      });
    }
  }
};
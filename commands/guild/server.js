const { SlashCommandBuilder } = require('discord.js');
const bannerCommand = require('../../utils/server/banner');
const emojisCommand = require('../../utils/server/emojis');
const infoCommand = require('../../utils/server/info');
const iconCommand = require('../../utils/server/icon');
const subcommandsConfig = [
  { name: 'banner', description: 'Muestra el banner del servidor' },
  { name: 'emojis', description: 'Muestra los emojis del servidor' },
  { name: 'icon', description: 'Muestra el icono del servidor' },
  { name: 'info', description: 'Muestra la información detallada del servidor' }
];

const commandBuilder = new SlashCommandBuilder()
  .setName('server')
  .setDescription('Comandos relacionados con el servidor');

for (const sub of subcommandsConfig) {
  commandBuilder.addSubcommand(subcommand =>
    subcommand
      .setName(sub.name)
      .setDescription(sub.description)
  );
}

const handlers = {
  banner: bannerCommand,
  emojis: emojisCommand,
  icon: iconCommand,
  info: infoCommand
};

module.exports = {
  data: commandBuilder,

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const handler = handlers[subcommand];

    if (handler) {
      return handler.execute(interaction);
    }

    return interaction.reply({ content: 'Subcomando no reconocido.', ephemeral: true });
  }
};
const { SlashCommandBuilder } = require('discord.js');
const HandCommand = require('../../utils/YG/deck/hand');
const ListCommand = require('../../utils/YG/deck/list');
const ViewCommand = require('../../utils/YG/deck/view');

const subcommandsConfig = [
  { name: 'hand', description: 'Simula la mano inicial de un deck' },
  { name: 'list', description: 'Muestra una lista de cartas agrupadas desde un archivo .ydk' },
  { name: 'view', description: 'Muestra una imagen del deck usando un archivo .ydk', hasCropped: true }
];

const commandBuilder = new SlashCommandBuilder()
  .setName('deck')
  .setDescription('Comandos relacionados al análisis de decks');

for (const sub of subcommandsConfig) {
  commandBuilder.addSubcommand(subcommand => {
    subcommand
      .setName(sub.name)
      .setDescription(sub.description)
      .addAttachmentOption(option =>
        option
          .setName('archivo')
          .setDescription('Archivo .ydk')
          .setRequired(true)
      );

    if (sub.hasCropped) {
      subcommand.addStringOption(option =>
        option
          .setName('cropped')
          .setDescription('Nombre o ID de la carta que quieres usar como cropped')
          .setRequired(false)
      );
    }

    return subcommand;
  });
}

const handlers = {
  hand: (interaction) => HandCommand.execute(interaction),
  list: (interaction) => ListCommand.execute(interaction),
  view: (interaction) => {
    const croppedInput = interaction.options.getString('cropped') || null;
    return ViewCommand.execute(interaction, croppedInput);
  }
};

module.exports = {
  data: commandBuilder,

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const handler = handlers[subcommand];

    if (handler) {
      return handler(interaction);
    }

    return interaction.reply({ content: 'Subcomando no reconocido.', ephemeral: true });
  }
};
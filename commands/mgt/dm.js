const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dm")
    .setDescription("원하는 멤버에게 DM을 전송합니다!")
    .addUserOption(option =>
        option
            .setName('유저')
            .setDescription('유저를 선택해주세요!')
            .setRequired(true)),
  /**
   *
   * @param {import("discord.js").CommandInteraction} interaction
   */
  /**
   *
   * @param {import("discord.js").Client} interaction
   */
  async execute(interaction) {
    if (interaction.member.permissions.has(PermissionsBitField.Flags.admini)) {
      const modal = new ModalBuilder()
        .setCustomId("dmmodal")
        .setTitle("사용자에게 DM을 전송합니다")
      const mention = new TextInputBuilder()
        .setCustomId("mention")
        .setLabel("전송 유저")
        .setStyle(TextInputStyle.Short)
        .setValue(`${interaction.options.getUser("유저").username}`)
      const msg = new TextInputBuilder()
        .setCustomId("msg")
        .setLabel("사용자에게 전송할 메세지를 적어주세요")
        .setStyle(TextInputStyle.Paragraph)
      const manager = new TextInputBuilder()
        .setCustomId("manager")
        .setLabel("본인 닉네임을 적어주세요")
        .setStyle(TextInputStyle.Short)
      const first = new ActionRowBuilder().addComponents(mention)
      const second = new ActionRowBuilder().addComponents(msg)
      const third = new ActionRowBuilder().addComponents(manager)
      modal.addComponents(first, second, third)

      await interaction.showModal(modal)
    }
  },
}

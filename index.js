const { Client, Collection, ChannelType, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js")
const client = new Client({ intents: [131071] })
require("dotenv").config();
const fs = require("fs")

client.commands = new Collection();

const commands_json = [];

const commandsCategoryPath = "./commands";
const commandsCategoryFiles = fs.readdirSync(commandsCategoryPath);

for (const category of commandsCategoryFiles) {
  const commandsPath = `./commands/${category}`;
  const commandsFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandsFiles) {
    const command = require(`./commands/${category}/${file}`);
    client.commands.set(command.data.name, command);
    commands_json.push(command.data.toJSON());
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

rest
  .put(Routes.applicationCommands(process.env.ID), { body: commands_json })
  .then((command) => console.log(`${command.length}개의 커맨드를 푸쉬했습니다`))
  .catch(console.error);



client.once("ready", async () => {
  console.log("봇을 준비했습니다!")
})

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.channel.type != ChannelType.DM) {
      const command = client.commands.get(interaction.commandName)
      try {
        await command.execute(interaction)
      } catch (error) {
        console.log(error)
      }
    }
  } else if (interaction.isButton()) {
    const id = interaction.customId
    if (id === "cer") {
      const user = interaction.guild.members.cache.get(interaction.user.id)
      user.roles.add("1038098133277745162")
      const mention = interaction.user.id
      await interaction.reply({ content: `<@${mention}>님, 인증이 완료되었습니다! **서버에서 즐거운 시간 보내세요!**`, ephemeral: true })
    } else if (id === "ticket") { 
      const ticketmodal = new ModalBuilder()
        .setCustomId("ticketmodal")
        .setTitle("티켓을 전송합니다")
      const reason = new TextInputBuilder()
        .setCustomId("reason")
        .setLabel("목적 [ 신고 / 문의 ]")
        .setStyle(TextInputStyle.Short)
      const minecraft = new TextInputBuilder()
        .setCustomId("minecraft")
        .setLabel("마인크래프트 닉네임")
        .setStyle(TextInputStyle.Short)
      const input = new TextInputBuilder()
        .setCustomId("input")
        .setLabel("내용")
        .setStyle(TextInputStyle.Paragraph)
      const first = new ActionRowBuilder().addComponents(reason)
      const second = new ActionRowBuilder().addComponents(minecraft)
      const third = new ActionRowBuilder().addComponents(input)
      ticketmodal.addComponents(first, second, third)

      await interaction.showModal(ticketmodal)
    }
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId === "dmmodal") {
      const username = interaction.fields.getTextInputValue("mention")
      const userid = client.users.cache.find(user => user.username === `${username}`)
      const msg = interaction.fields.getTextInputValue("msg")
      const manager = interaction.fields.getTextInputValue("manager")
      try {
        await userid.send({ content: `**안녕하세요! 관리자로부터 DM이 전송되어 안내드립니다!**\n\n\`\`\`${msg}\`\`\`` })
        await interaction.guild.channels.cache.get("1038107220103155722").send({ content: `**로그가 전송되었습니다!** \n\n \`담당자 : ${manager}\`\n\`\`\`${msg}\`\`\`` })
        await interaction.reply({ content: "전송을 완료했습니다!", ephemeral: true })
      } catch (error) {
        await interaction.reply({ content: "사용자가 다이렉트 메세지를 허용하지 않아 전송에 실패했습니다!", ephemeral: true })
      }
    } else if (interaction.customId === "ticketmodal") {
      const reason = interaction.fields.getTextInputValue("reason")
      const minecraft = interaction.fields.getTextInputValue("minecraft")
      const input = interaction.fields.getTextInputValue("input")
      const ticketname = `TICKET-${interaction.user.username}`
      interaction.guild.channels
        .create({
          name: `${ticketname}`,
          ChannelType: "text",
          parent: "1038107343499567184",
          permissionOverwrites: [
            {
              id: interaction.user.id,
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            },
            {
              id: interaction.guild.id,
              deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            }
          ]
        }).then(async (channel) => {
          await interaction.reply({ content: `**티켓이 오픈되었습니다!** || ${channel}`, ephemeral: true })
          await channel.send(`\`\`\`목적 : ${reason}\n마인크래프트 닉네임 : ${minecraft}\n내용 : ${input}\`\`\`\n**증거사진을 같이 첨부하면 더욱 빠르게 처리할 수 있습니다!** || ${interaction.user}`)
        })
    }
  }
})

client.on("guildMemberAdd", async (member) => {
  const userid = member.id
  const embed = new EmbedBuilder()
    .setTitle(`**서버에 새로운 멤버가 들어왔어요!**`)
    .setDescription(`새로운 멤버 <@${userid}>님을 반갑게 환영해주세요!`)
    .setColor("Green")
    .setThumbnail("https://emojigraph.org/media/twitter/waving-hand_1f44b.png")
  client.channels.cache.get('1038099671685541969').send({ embeds: [embed] })
})

client.on("messageCreate", async (message) => {
  if (message.content === "!생성 인증") {
    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("cer")
          .setLabel("인증")
          .setStyle(ButtonStyle.Success)
          .setEmoji("✅")
      )
      await message.channel.send({ content: "```[NOVA SERVER]에 오신것을 진심으로 환영합니다!\n아래 버튼을 클릭하고 여러 소식들을 알아보세요!```\n**해당 서버는 인증 시스템을 사용하고있습니다! 서버 이용을 위해 인증을 완료해주세요!**", components: [row] })
    }
  } else if (message.content === "!생성 티켓") {
    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("ticket")
          .setLabel("티켓열기")
          .setStyle(ButtonStyle.Success)
          .setEmoji("💌")
      )
      await message.channel.send({ content: "**티켓을 열기위해 아래 버튼을 눌러주세요!**", components: [row] })
    }
  }
})

client.login(process.env.TOKEN)
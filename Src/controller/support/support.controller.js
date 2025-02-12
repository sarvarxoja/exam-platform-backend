import TelegramBot from "node-telegram-bot-api";
const bot = new TelegramBot(process.env.TOKEN);

export const sendMessage = async (req, res) => {
  try {
    let { phone, name, message } = req.body;

    if (!phone || !name || !message) {
      return res.status(400).json({ message: "Bad request", status: 400 });
    }

    let sendMessage = `
☎️ Telefon raqam: ${phone}

❓ Muammo: ${message}  
👤 Foydalanuvchining ismi: ${name}
        `;
    await bot.sendMessage(1390138455, sendMessage);
    res
      .status(200)
      .json({ message: "Question successfully send", status: 200 });
  } catch (error) {
    console.log(error);
  }
};

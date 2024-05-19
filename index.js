const { Telegraf, Markup } = require("telegraf");
const films = require("./films");
const fs = require("fs");

require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start(async (ctx) => {
   await ctx.replyWithHTML(
      "<b>Привет!</b>\n\nНапиши код фильма и я пришлю название"
   );
   const chatId = ctx.message.chat.id;
   const path = "chat_ids.json";
   const data = JSON.parse(fs.readFileSync(path, { encoding: "utf8" }));
   if (!(chatId in data)) {
      data[chatId] = chatId;
		fs.writeFileSync(path, JSON.stringify(data), { encoding: "utf8", flag: 'w' });
   }
   
});
bot.help(
   async (ctx) => await ctx.reply("Напиши код фильма и я пришлю название")
);

bot.on("message", async (ctx) => {
   if (!ctx.message.text) await ctx.reply("Пришли код фильма");
   else {
      if (ctx.message.text.trim() === "/bonus") {
         await ctx.replyWithPhoto(
            {
               url: "https://sun6-21.userapi.com/impg/FKUpQaR-IbbaHU14bMEBjSyacXx65bzrg8trIQ/GvROrPVBCXo.jpg?size=1000x714&quality=95&sign=f2d694c50b657c1dd6af9378311db6ee&c_uniq_tag=iSQ2-a_fkC6xIXvd6xOAqrtzM_vn_Cu-BzHCcpvZds0&type=album",
            },
            {
               caption: `Забирай бонус при регистрации!`,
               parse_mode: "HTML",
               ...Markup.inlineKeyboard([
                  [Markup.button.url("ЗАБРАТЬ БОНУС 🚀", "naebalovo.ru")],
               ]),
               disable_web_page_preview: true,
            }
         );
      } else {
         const id = +ctx.message.text.trim();
         if (id in films) {
            await ctx.replyWithHTML(
               `Фильм ${id}`,
               Markup.inlineKeyboard([
                  [Markup.button.url("СМОТРЕТЬ ФИЛЬМ 🎬", films[id])],
                  [Markup.button.url("ЗАБРАТЬ БОНУС 🚀", "naebalovo.ru")],
               ]),
               {
                  disable_web_page_preview: true,
               }
            );
         } else {
            await ctx.reply(
               "Фильм с таким кодом не найден, проверь код и попробуй ещё раз"
            );
         }
      }
   }
});
bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

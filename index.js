const { Telegraf, Markup } = require("telegraf");
const films = require("./films");
const fs = require("fs");
const { log } = require("console");
const refLink = "https://kurl.ru/ASKye";
const statsPath = "stats.json";
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start(async (ctx) => {
   await ctx.replyWithHTML(
      "<b>Привет!</b>\nНапиши код фильма и я пришлю название"
   );
   const chatId = ctx.message.chat.id;

   const data = JSON.parse(fs.readFileSync(statsPath, { encoding: "utf8" }));
   if (!(chatId in data.members)) {
      data.members[chatId] = {
         name: ctx.message.chat.first_name,
         username: `@${ctx.message.chat.username}`,
      };
      data.membersCounter += 1;
      data.membersCounterActive += 1;
      fs.writeFileSync(statsPath, JSON.stringify(data), {
         encoding: "utf8",
         flag: "w",
      });
   }
});
bot.help(
   async (ctx) => await ctx.reply("Напиши код фильма и я пришлю название")
);

bot.on("message", async (ctx) => {
   console.log(ctx.message);
   if (!ctx.message.text) await ctx.reply("Пришли код фильма");
   else {
      if (ctx.message.text.trim() === "/bonus") {
         await ctx.replyWithPhoto(
            {
               source: "./img/bonus.png",
            },
            {
               ...Markup.inlineKeyboard([
                  [Markup.button.url("ПОЛУЧИТЬ БОНУС + 500% 🚀", refLink)],
               ]),
               disable_web_page_preview: true,
            }
         );
      } else if (ctx.message.text.trim() === "/tutorial") {
         await sendTutorial(ctx);
      } else if (ctx.message.text.trim() === "/stats") {
         if (ctx.message.chat.id === 5509442847) {
            const data = JSON.parse(
               fs.readFileSync(statsPath, { encoding: "utf8" })
            );
            let reply = `Пользователи за все время: ${data.membersCounter}\nАктивные пользователи: ${data.membersCounterActive}`;
            for (let member in data.members) {
               const memberString = `\n<code>${member}</code> | ${data.members[member].username} | ${data.members[member].name}`;
               const temp = reply + memberString;
               if (temp.length >= 4096) {
                  await ctx.replyWithHTML(reply);
                  reply = "";
               }
               reply += memberString;
            }
            if (reply.length.trim != "") await ctx.replyWithHTML(reply);
         } else {
            await ctx.reply("У вас нет доступа к этой команде");
         }
      } else {
         const id = +ctx.message.text.trim();
         if (id in films) {
            await ctx.replyWithPhoto(
               {
                  source: "./img/bonus.png",
               },
               {
                  caption: `🎬 <b>${films[id].type}: ${films[id].name}</b>\n\nДля удобного просмотра фильмов и сериалов в отличном качестве без рекламы пройдите по <b><a href="${refLink}">ссылке</a></b> или кнопке ниже\n\nА также получите бонусы при регистрации 🔔`,
                  parse_mode: "HTML",
                  ...Markup.inlineKeyboard([
                     [
                        Markup.button.url(
                           `СМОТРЕТЬ ${films[id].type.toUpperCase()} 🎬`,
                           refLink
                        ),
                     ],
                     [Markup.button.url("ПОЛУЧИТЬ БОНУС + 500% 🚀", refLink)],
                     [
                        Markup.button.callback(
                           "ИНСТРУКЦИЯ ПО ПРОСМОТРУ ⚙️",
                           "btn_tutorial"
                        ),
                     ],
                  ]),
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
bot.action("btn_tutorial", async (ctx) => {
   await sendTutorial(ctx, true);
});
bot.launch();

async function sendTutorial(ctx, isButton = false) {
   await ctx.replyWithVideo(
      {
         source: "./video/tutorial.mp4",
      },
      {
         ...Markup.inlineKeyboard([
            [Markup.button.url(`СМОТРЕТЬ ФИЛЬМЫ 🎬`, refLink)],
         ]),
         disable_web_page_preview: true,
      }
   );
   if (isButton) await ctx.answerCbQuery();
}
// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

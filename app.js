const { Telegraf } = require("telegraf");
const { ndown, ytdown } = require("nayan-media-downloader");
const fs = require("node:fs");
const fetch = require("node-fetch");

const token = "7445329871:AAFNZvMiNnFlQscrKedPdrcp0PrHRg7005w";
const bot = new Telegraf(token);

bot.command("start", async (ctx) => {
  await ctx.replyWithHTML(
    `Assalomu alaykum! Instagram yoki YouTubedan video linkini yuboring.\n\nHello! Could you please provide a link to a video from Instagram or YouTube.\n\nПривет! Не могли бы вы предоставить ссылку на видео из Instagram или YouTube.\n\nCreated by @Rasha_Dev`
   

  );
});

bot.on("message", async (ctx) => {
  const url = ctx.message.text;
  if (url.includes("instagram.com")) {
    await ctx.reply("Instagram videoni yuklash boshlandi, iltimos kuting...");
    await InstagramDownloader(ctx, url);
  } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
    await ctx.reply("YouTube videoni yuklash boshlandi, iltimos kuting...");
    await YoutubeDownloader(ctx, url);
  } else {
    await ctx.reply("Iltimos, Instagram yoki YouTube video linkini yuboring.");
  }
});

async function InstagramDownloader(ctx, url) {
  try {
    let data = await ndown(url);
    if (data.status && data.data && data.data.length > 0) {
      let downloadUrl = data.data[0].url;

      const fileName = `instagram_video.mp4`;
      const writeStream = fs.createWriteStream(fileName);

      const response = await fetch(downloadUrl);
      response.body.pipe(writeStream);

      writeStream.on("finish", async () => {
        writeStream.end();
        await ctx.replyWithVideo({ source: fileName });
        fs.unlinkSync(fileName);
      });
      writeStream.on("error", async () => {
        await ctx.reply("Videoni yuklashda xatolik yuz berdi.");
      });
    } else {
      await ctx.reply("Video topilmadi. Iltimos to'g'ri link yuboring.");
    }
  } catch (error) {
    console.error("Xato yuz berdi:", error);
    await ctx.reply("Xato yuz berdi: " + error.message);
  }
}

async function YoutubeDownloader(ctx, url) {
  try {
    let data = await ytdown(url);
    if (data && data.status && data.data && data.data.video) {
      let downloadUrl = data.data.video;

      const fileName = `youtube_video.mp4`;
      const writeStream = fs.createWriteStream(fileName);

      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Failed to fetch video");
      response.body.pipe(writeStream);

      writeStream.on("finish", async () => {
        writeStream.end();
        await ctx.replyWithVideo({ source: fileName });
        fs.unlinkSync(fileName);
      });
      writeStream.on("error", async (err) => {
        console.error("writeStream xatolik:", err);
        await ctx.reply("Videoni yuklashda xatolik yuz berdi.");
      });
    } else {
      await ctx.reply("Video topilmadi. Iltimos to'g'ri link yuboring.");
    }
  } catch (error) {
    console.error("Xato yuz berdi:", error);
    await ctx.reply("Xato yuz berdi: " + error.message);
  }
}

bot.launch();
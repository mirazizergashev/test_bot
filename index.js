require('dotenv').config()
// require('./restart')
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express()
app.use(express.json())
app.get("/", (req, res) => {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  res.send(ip);
  console.log(ip)
})

const token = process.env.TOKEN || 'token kiritiladi';
//botga ulanish
const bot = new TelegramBot(token, {
  polling: true
});
//Databasega ulanish
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://Rtest:o27012001@cluster0.se58s.gcp.mongodb.net/telegrambotbase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  }).then(() => console.log('Database Connected'))
  .catch(err => console.log(err));


const Sinflar = require('./models/sinf')
const Category = require('./models/category')
const Mavzular = require('./models/mavzu')
const Files = require('./models/files')
const Testlar = require('./models/test');
const request = require('request');

let users = {}

// tugma nomlari
const commands = ["❇️ Bo'lim qo'shish", "🗑 Bo'lim o'chirish", "❇️ Sinf qo'shish", "🗑 Sinf o'chirish", "⬅️ orqaga",
  "❇️ Mavzu qo'shish", "🗑 Mavzu o'chirish", "📂 Fayl qo'shish", "🔑 Testlar", "🖊 Savollar", "🧾 Krosswordlar", //<=10-si
  "✅ Tasdiqlayman", "❌ Bekor qilinsin", "🗑 Faylni o'chirish", "❇️ Test qo'shish", "🖇 Barcha testlar", "🖊 Test bajarish" //16-si
]
//file turlari
const tur = [
  ["📝 Word fayl", "🌇 Slayd"],
  ["📚 Pdf file", "📄 Matnli file"],
  ["📓 Aralash turdagi"],
  [commands[4]]
]

function sendMessage(chatId, data, array) {
  bot.sendMessage(chatId, data, {
    parse_mode: "Markdown",
    reply_markup: {
      one_time_keyboard: true,
      resize_keyboard: true,
      "keyboard": array
    }
  });
}
async function caseStart(msg) {
  const array = []
  const kategoriyalar = await Category.getAll()
  kategoriyalar.forEach(e => {
    array.push([e.name]);
  })
  array.push([commands[0], commands[1]])
  sendMessage(msg.chat.id, "Kerakli bo'limni tanlang:", array);
  users[msg.chat.id] = {
    step: "0"
  };
}
async function case0_3(msg) {
  const array = []

  const sinflari = (await Sinflar.getAll(users[msg.chat.id].kategoriya))

  sinflari.forEach(e => {
    array.push([e.name]);
  })
  array.push([commands[2], commands[3]], [commands[4]])
  sendMessage(msg.chat.id, "Kerakli sinfni tanlang:", array)
  users[msg.chat.id].step = "0.3"

}
async function case0_3_3(msg) {
  const array = []

  const mavzulari = (await Mavzular.getAll(users[msg.chat.id].sinfim, users[msg.chat.id].kategoriya))

  mavzulari.forEach(e => {
    array.push([e.name]);
  })
  array.push([commands[5], commands[6]], [commands[4]])
  sendMessage(msg.chat.id, "Kerakli mavzuni tanlang:", array)
  users[msg.chat.id].step = "0.3.3"

}

async function case0_3_3_3(msg, k) {
  const array = []

  const mavzu1 = (k == 1) ? await Mavzular.getOne(msg.text, users[msg.chat.id].sinfim, users[msg.chat.id].kategoriya) : await Mavzular.getById(users[msg.chat.id].mavzuId || 0)

  const Mavzufayllari = await Files.getAll(mavzu1._id)
  Mavzufayllari.forEach(e => {
    bot.sendDocument(msg.chat.id, e.fileId, {
        parse_mode: 'HTML',
        caption: `<i><b>File turi:</b>${e.file_turi}\n
    <b>About:</b>${e.about}</i>`,
        reply_markup: {
          inline_keyboard: [
            [{
              text: commands[13],
              callback_data: "deleteFile" + "#" + e._id
            }]
          ]
        }
      }).then(() => {
        console.log("ok file")
      })
      .catch(e => console.log(e))
  })

  // console.log(array)
  if (mavzu1) {
    users[msg.chat.id].mavzuId = mavzu1._id;
    array.push([commands[7], commands[8]], [commands[9], commands[10]], [commands[4]])
    sendMessage(msg.chat.id, "Kerakli menuni tanlang:", array)
    users[msg.chat.id].step = "0.3.3.3"
  }
}

bot.on('message', async (msg) => {
  // const msg.chat.id = msg.chat.id;
  if (msg.chat.id == (msg.chat.id || process.env.ADMIN || "adminning idsi")) {
    // console.log(users)
    //Agar start bosilsa
    if (msg.text === '/start') {
      await caseStart(msg)
    } else
    if (!users[msg.chat.id]) {
      await caseStart(msg)
    } else if (!(msg.text && (msg.text === '/start')))
      switch (users[msg.chat.id].step) {
        case "0":
          if (msg.text) {
            //+++
            if (msg.text === commands[0]) {
              sendMessage(msg.chat.id, "Qo'shiladigan bo'lim nomini kiriting:", [
                [commands[4]]
              ])
              users[msg.chat.id].step = "0.1" //add++
            } //---
            else if (msg.text === commands[1]) {
              const array = []
              const kategoriyalar = await Category.getAll()
              kategoriyalar.forEach(e => {
                array.push([e.name]);
              })
              array.push([commands[4]])
              users[msg.chat.id].step = "0.2" //remove--
              sendMessage(msg.chat.id, "O'chiriladigan bo'limni tanlang:", array)
            } else {
              const kategoriya = await Category.getOne(msg.text)
              if (kategoriya) {
                users[msg.chat.id].kategoriya = msg.text;
                await case0_3(msg)
              }
            }
          }
          break;
        case '0.1':
          if (msg.text) {
            //orqaga
            if (msg.text === commands[4]) caseStart(msg)
            else {
              await Category.create({
                name: msg.text
              })

              caseStart(msg)
            }
          }
          break
        case '0.2':
          if (msg.text) {
            //orqaga
            if (msg.text === commands[4]) caseStart(msg)
            else {
              await Category.deleteByName(msg.text)
              caseStart(msg)
            }
          }
          break
        case "0.3":
          if (msg.text) {
            if (msg.text == commands[4]) {
              await caseStart(msg)
            } else
              //+++
              if (msg.text === commands[2]) {
                sendMessage(msg.chat.id, "Qo'shiladigan sinf nomini kiriting:", [
                  [commands[4]]
                ])
                users[msg.chat.id].step = "0.3.1" //add++
              } //---
            else if (msg.text === commands[3]) {
              const array = []
              const sinfi = await Sinflar.getAll(users[msg.chat.id].kategoriya)
              sinfi.forEach(e => {
                array.push([e.name]);
              })
              array.push([commands[4]])
              users[msg.chat.id].step = "0.3.2" //remove--
              sendMessage(msg.chat.id, "O'chiriladigan sinfni tanlang:", array)
            } else { //sinfga kirish
              const sinfim = await Sinflar.getOne(msg.text, users[msg.chat.id].kategoriya)
              if (sinfim) {
                users[msg.chat.id].sinfim = msg.text;
                await case0_3_3(msg)

              }
            }
          }
          break;
        case '0.3.1':
          //  console.log("++") 
          if (msg.text) {
            //orqaga
            if (msg.text === commands[4]) case0_3(msg)
            else {
              console.log("++ok")
              await Sinflar.create({
                name: msg.text,
                categoryName: users[msg.chat.id].kategoriya
              })

              case0_3(msg)
            }
          }
          break
        case '0.3.2':
          // console.log("++") 
          if (msg.text) {
            //orqaga
            if (msg.text === commands[4]) case0_3(msg)
            else {
              console.log("---deleted")
              await Sinflar.deleteByName(msg.text, users[msg.chat.id].kategoriya)
              case0_3(msg)
            }
          }
          break
        case "0.3.3":
          console.log("0.3.3")
          if (msg.text) {
            if (msg.text == commands[4]) {
              await case0_3(msg)
            } else
              //+++
              if (msg.text === commands[5]) {
                users[msg.chat.id].step = "0.3.3.1" //add++
                sendMessage(msg.chat.id, "Qo'shiladigan mavzu nomini kiriting:", [
                  [commands[4]]
                ])
              } //---
            else if (msg.text === commands[6]) {
              const array = []

              const mavzulari = (await Mavzular.getAll(users[msg.chat.id].sinfim, users[msg.chat.id].kategoriya))

              mavzulari.forEach(e => {
                array.push([e.name]);
              })
              array.push([commands[4]])

              users[msg.chat.id].step = "0.3.3.2" //remove--
              sendMessage(msg.chat.id, "O'chiriladigan mavzuni tanlang:", array)
            } else { //mavzuga kirish
              await case0_3_3_3(msg, 1)
            }
          }
          break;
        case '0.3.3.1':

          if (msg.text) {
            //orqaga
            if (msg.text === commands[4]) case0_3_3(msg)
            else {

              await Mavzular.create({
                name: msg.text,
                sinfnomi: users[msg.chat.id].sinfim,
                categoryName: users[msg.chat.id].kategoriya
              }).catch(e => {

                sendMessage(msg.chat.id, "❌ Bunday mavzu qo'shishning imkoni yo'q!\nIltimos biror belgi qo'shing yoki o'zgartiring:")
              }).finally(() => case0_3_3(msg))


            }
          }
          break
        case '0.3.3.2':
          // console.log("++") 
          if (msg.text) {
            //orqaga
            if (msg.text === commands[4]) case0_3_3(msg)
            else {
              console.log("---deleted mavzu")
              await Mavzular.deleteByName(msg.text, users[msg.chat.id].kategoriya, users[msg.chat.id].sinfim)
              // case0_3_3(msg)
              const array = []

              const mavzulari = (await Mavzular.getAll(users[msg.chat.id].sinfim, users[msg.chat.id].kategoriya))

              mavzulari.forEach(e => {
                array.push([e.name]);
              })
              array.push([commands[4]])

              users[msg.chat.id].step = "0.3.3.2" //remove--
              sendMessage(msg.chat.id, "O'chiriladigan mavzuni tanlang:", array)
            }
          }
          break
        case "0.3.3.3":
          if (msg.text) {
            if (msg.text == commands[4]) {
              await case0_3_3(msg)
            } else
              //+++
              if (msg.text === commands[7]) {
                users[msg.chat.id].step = "0.3.3.3.1" //add++
                sendMessage(msg.chat.id, "Qo'shmoqchi bo'lgan faylingizni bizga jo'nating:", [
                  [commands[4]]
                ])
              } //---
            else if (msg.text === commands[8]) {
              users[msg.chat.id].step = "0.3.3.3.2" //remove--
              sendMessage(msg.chat.id, "Testlar bo'limiga xush kelibsiz!", [
                [commands[14], commands[15]],
                [commands[16], commands[4]]
              ])
            } else { //sinfga kirish
              const array = []
              const kategoriya = await Category.getOne(msg.text)
              if (kategoriya) {
                (await Sinflar.getAll(msg.text)).forEach(e => {
                  array.push([e.name]);
                })
                array.push([commands[2]], [commands[3]], [commands[4]])
                sendMessage(msg.chat.id, "Kerakli mavzuni tanlang:", array)
                users[msg.chat.id].step = "0.3.3.3"
              }
            }
          }
          break;
        case '0.3.3.3.1':

          if (msg.text && msg.text === commands[4]) case0_3_3_3(msg, 0)
          else if (msg.document) {

            users[msg.chat.id].fileId = msg.document.file_id
            sendMessage(msg.chat.id, "Kiritgan faylingiz qanday turda ekanligini belgilang:", tur)
            users[msg.chat.id].step = '0.3.3.3.1.2'
          }

          break
        case '0.3.3.3.1.2':

          if (msg.text && msg.text === commands[4]) case0_3_3_3(msg, 0)
          else if (msg.text) {

            users[msg.chat.id].file_turi = msg.text;
            sendMessage(msg.chat.id, "Fayl haqida qisqacha ma'lumot bering:", [
              [commands[4]]
            ])
            users[msg.chat.id].step = '0.3.3.3.1.3'
          }

          break
        case '0.3.3.3.1.3':

          if (msg.text && msg.text === commands[4]) case0_3_3_3(msg, 0)
          else if (msg.text) {

            users[msg.chat.id].about = msg.text;
            bot.sendDocument(msg.chat.id, users[msg.chat.id].fileId, {
              parse_mode: 'HTML',
              caption: `<i><b>File turi:</b>${users[msg.chat.id].file_turi}\n
                  <b>About:</b>${users[msg.chat.id].about}</i>`
            })
            sendMessage(msg.chat.id, "Ma'lumotlaringizni tasdiqlaysizmi?", [
              [commands[11], commands[12]]
            ])
            users[msg.chat.id].step = '0.3.3.3.1.4'
          }

          break
        case '0.3.3.3.1.4':

          if (msg.text && (msg.text == commands[11] || msg.text == commands[12])) {
            if (msg.text == commands[11]) await Files.create({
              about: users[msg.chat.id].about,
              fileId: users[msg.chat.id].fileId,
              file_turi: users[msg.chat.id].file_turi,
              mavzuId: users[msg.chat.id].mavzuId
            })
            sendMessage(msg.chat.id, "✅ Muvaffaqiyatli saqlandi!", [
              []
            ])
            // users[msg.chat.id].step='0.3.3.3'
            case0_3_3_3(msg);
          } else {
            sendMessage(msg.chat.id, "❌ Bekor qilindi!", [
              []
            ])
            // users[msg.chat.id].step='0.3.3.3'
            case0_3_3_3(msg);
          }

          break
        case '0.3.3.3.2':
          if (msg.text)
            if (msg.text === commands[4]) case0_3_3_3(msg, 0)
          else if (msg.text === commands[14]) {
            sendMessage(msg.chat.id, "Test file ni yuboring:(file ko'rinishida)", [
              []
            ])
            users[msg.chat.id].step = '0.3.3.3.2.1'
          }else
          if (msg.text === commands[15]) {
            sendMessage(msg.chat.id, "Test file ni yuboring:(file ko'rinishida)", [
              []
            ])
            users[msg.chat.id].step = '0.3.3.3.3.1'
          }else if (msg.text === commands[16]) {//test yechish
            const testlar=await Testlar.getByMavzu(users[msg.chat.id].mavzuId)
            const index=Math.trunc(testlar.length*Math.random)
            if(testlar.length==0){sendMessage(msg.chat,id,"Bu mavzuda test mavjud emas!",[[]]);return;}
            users[msg.chat.id].testAnswers=testlar[index].testKey
            bot.sendDocument(msg.chat.id, testlar[index].testFileId, {
              parse_mode: 'HTML',
              caption: `<i><b>Testlar soni:</b>${testlar[index].testCount}
            \nJavoblarni <b>ABAA***</b> ko'rinishidagi satr sifatida yuboring:</i>`
            })
sendMessage(msg.chat.id,"Yuqoridagi ko'rinishda javobni yuboring:",[[]])
            users[msg.chat.id].step = '0.3.3.3.4.1'
          }
         
          break;
        case '0.3.3.3.2.1':
          if (msg.document) {
            users[msg.chat.id].testFileId = msg.document.file_id
            sendMessage(msg.chat.id, "Fayldagi testlar sonini kiriting:", [
              []
            ])
            users[msg.chat.id].step = '0.3.3.3.2.2'
          }
          break;
        case '0.3.3.3.2.2':
          if (msg.text && parseInt(msg.text)) {
            users[msg.chat.id].testCount = msg.text
            sendMessage(msg.chat.id, "Test kalitlarini kiriting:\n(Masalan testlar soni 4 ta bo'lsa ABAA ko'rinishda kiritiladi)", [
              []
            ])
            users[msg.chat.id].step = '0.3.3.3.2.3'
          }else sendMessage(msg.chat.id, "Testlar soni butun son bo'lishi kerak.\nIltimos, qayta kiriting:",[[]])
          break;
        case '0.3.3.3.2.3':
          if (msg.text && msg.text.length== users[msg.chat.id].testCount) {
            users[msg.chat.id].testKey = msg.text.toUpperCase()
            users[msg.chat.id].testId = Math.round(Math.random()*89000000+10000000)
            bot.sendDocument(msg.chat.id, users[msg.chat.id].testFileId, {
              parse_mode: 'HTML',
              caption: `<i><b>Testlar soni:</b>${users[msg.chat.id].testCount}
              \n<b>Javoblari:</b>${msg.text}
              \n<b>Testning id raqami:</b>${users[msg.chat.id].testId}</i>`
            })
            sendMessage(msg.chat.id, "Ma'lumotlaringizni tasdiqlaysizmi?", [
              [commands[11], commands[12]]
            ])
          
           users[msg.chat.id].step = '0.3.3.3.2.4'
          }
          else sendMessage(msg.chat.id, "Kalitlar soni "+users[msg.chat.id].testCount+"ta bo'lishi kerak.\nIltimos, qayta kiriting:",[[]])
          break;
          case '0.3.3.3.2.4':
            if (msg.text && (msg.text == commands[11] || msg.text == commands[12])) 
              if (msg.text == commands[11]) 
              {await Testlar.create({
                testId: users[msg.chat.id].testId,
                mavzuId: users[msg.chat.id].mavzuId,
                testFileId: users[msg.chat.id].testFileId,
                testCount: users[msg.chat.id].testCount,
                testKey: users[msg.chat.id].testKey
              })
              sendMessage(msg.chat.id, "✅ Muvaffaqiyatli saqlandi!", [
                []
              ])
              // users[msg.chat.id].step='0.3.3.3'
              case0_3_3_3(msg);
            } else {
              sendMessage(msg.chat.id, "❌ Bekor qilindi!", [
                []
              ])
              // users[msg.chat.id].step='0.3.3.3'
              case0_3_3_3(msg);
            }
        break

        case '0.3.3.3.4.1':
            if (msg.text && msg.text.length()== users[msg.chat.id].testAnswers.length()){
              let k=0
              for(let i=0;i<msg.text.length;i++)
                  if(msg.text.toUpperCase()[i]==users[msg.chat.id].testAnswers[i])k++
              sendMessage(msg.chat.id,"Siz "+msg.text.length+" ta savoldan "+k +"tasiga to'g'ri javob berdingiz!"+k*100/msg.text.length+"%",[[]])
              sendMessage(msg.chat.id,"Ajoyib",[[]]);
              case0_3_3_3(msg)
            }else sendMessage(msg.chat.id,"SIz javoblarni noto'g'ri formatda yubordingiz iltimos qayta yuboring!")
        break;
        case 2:
          if (msg.photo) {
            users[msg.chat.id].photo = msg.photo[0].file_id
            step = 3
            sendMessage(msg.chat.id, users[msg.chat.id].name + " haqida ma'lumot kiriting:");
          } else {
            sendMessage(msg.chat.id, "Inshoot rasmini kiriting:");
          }
          break;
        case 3:
          if (msg.text) {
            if (msg.text.length > 200) {
              sendMessage(msg.chat.id, "Caption 200 ta belgidan oshmasligi kerak!\n" + users[msg.chat.id].name + " haqida ma'lumotni qayta kiriting:");
            } else {
              users[msg.chat.id].data = msg.text
              step = 4
              sendFoto(msg.chat.id, users[msg.chat.id].photo, "<b>Nomi:" + users[msg.chat.id].name + '</b>\n' + users[msg.chat.id].data);
              sendChecked(msg.chat.id, "Ma'lumotlaringizni tasdiqlaysizmi?");
            }
          } else {
            sendMessage(msg.chat.id, users[msg.chat.id].name + " haqida ma'lumot kiriting:");
          }
          break;
        case 4:
          if (msg.text || (msg.text in ["Ha", "Yo'q"])) {
            if (msg.text == "Ha") {
              new Inshoot({
                id: msg.chat.id,
                name: users[msg.chat.id].name,
                photoid: users[msg.chat.id].photo,
                data: users[msg.chat.id].data,
              }).save()
              sendMessage(msg.chat.id, "Qabul qilindi ✅")

            } else
              sendMessage(msg.chat.id, "Qabul qilinmadi ❌");

          } else {
            sendChecked(msg.chat.id, "Ma'lumotlaringizni tasdiqlaysizmi?");
          }
          break;

        default:
          sendMessage(msg.chat.id, "Buyog'i endi taxlanadi qaytish uchun /start ni yuboring", [
            []
          ]);
          break;
      }
    try {
      bot.deleteMessage(msg.chat.id, msg.message_id).catch(() => console.log("uchmadi0"))
      bot.deleteMessage(msg.chat.id, msg.message_id - 1).catch(() => console.log("uchmadi-1"))
    } catch {
      console.log("zarari yuq", e)
    }
  } else {}
});

bot.on('callback_query', async (data) => {
  const a = data.data.split('#')
  if (!(data.message.text && (data.message.text === '/start')))
    if (users[data.message.chat.id].step === '0.3.3.3') {
      await Files.delete(a[1])
      bot.deleteMessage(data.message.chat.id, data.message.message_id).catch(e => console.log({
        "callback_query": e
      }));
    }

})






app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port%s`, process.env.PORT || 3000);
});
require('./restart')
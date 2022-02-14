const TelegramApi = require('node-telegram-bot-api');
const token = require("./config.js").token;
const DBquery = require("./db.js").DBquery;

const bot = new TelegramApi(token, {polling: true})

const keyboard = {
    reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: true,
        keyboard: [
            ['Отправить валентинку'],
            ['Мои валентинки']
        ],
    },
};

let usersStatus = [];
let valentines = [];

bot.on('message', msg => {
    id = msg.chat.id;
    if(!FindUser(id)){
        usersStatus.push({
            id: msg.chat.id,
            status: 'default'
        });
        DBquery(`INSERT INTO users(_userid, _username, _datetime) VALUES (\'${msg.chat.id}\', \'${msg.chat.username}\', Now())`);
    }

    switch (GetStatusUser(id)){
        case 'name':
            if(msg.text[0] == '@') {
                valentines.push({
                    userid: id,
                    username: msg.chat.username,
                    name: msg.text.replace('@', ''),
                    valentine: null
                });
            }
            else {
                valentines.push({
                    userid: id,
                    username: msg.chat.username,
                    name: msg.text,
                    valentine: null
                });
            }
            EditStatusUser(msg.chat.id, 'text');
            bot.sendMessage(msg.chat.id, "Напишите валентинку:");
            break;
        case 'text':
            EditNullValentine(id, msg.chat.username, msg.text);
            EditStatusUser(msg.chat.id, 'default');
            bot.sendMessage(msg.chat.id, "Ваша валентинка отправлена!", keyboard);
            break;
        default:
            Answer(msg);
            break;
    }
})

async function Answer(msg){
    switch (msg.text) {
        case 'Отправить валентинку':
            EditStatusUser(msg.chat.id, 'name');
            await bot.sendMessage(msg.chat.id, "Кому отправить валентинку? \n (айди в телеграмме с собачкой или без, регистр важен!)");
            break;
        case 'Мои валентинки':
            let date = new Date();
            if(date.getDate() == 14 && date.getHours() < 18)
            {
                await bot.sendMessage(msg.chat.id, 'Валентинки можно будет посмотреть через ' + (17 - date.getHours()) + ' часов ' + (60 - date.getMinutes()) + ' минут(ы).');
            }
            else{
                await bot.sendMessage(msg.chat.id, 'Ваши валентинки:');
                while(GetValentine(msg.chat.username)){
                    await bot.sendMessage(msg.chat.id, GetValentine(msg.chat.username).valentine);
                    DBquery(`INSERT INTO GETvalentines(_userid, _username, _name, _text, _datetime) VALUES (\'${GetValentine(msg.chat.username).userid}\', \'${GetValentine(msg.chat.username).username}\', \'${GetValentine(msg.chat.username).name}\', \'${GetValentine(msg.chat.username).valentine}\', Now())`);
                    valentines.splice(valentines.indexOf(GetValentine(msg.chat.username)), 1);
                }
            }
            break;
        default:
            DefaultAnswer(msg);
            break;
    }
}

function DefaultAnswer(msg){
    const chatId = msg.chat.id;
    bot.sendMessage(msg.chat.id, "Приветствую! Через этого бота вы сможете отправлять и получать анонимные валентинки!", keyboard);
}

function GetStatusUser(id) {
    return usersStatus.find(item => {
        if(item.id === id) {
            return true;
        }
    }).status;
}

function EditStatusUser(id, status) {
    return usersStatus.find(item => {
        if(item.id === id) {
            item.status = status;
            return true;
        }
    });
}

function FindUser(id) {
    return usersStatus.find(item => {
        if(item.id === id) {
            return true;
        }
    });
}

function GetValentine(name) {
    return valentines.find(item => {
        if(item.name === name) {
            return true;
        }
    });
}

function EditNullValentine(id, username, valentine) {
    return valentines.find(item => {
        if(item.userid === id && item.valentine === null) {
            item.valentine = valentine;
            DBquery(`INSERT INTO valentines(_userid, _username, _name, _text, _datetime) VALUES (\'${item.userid}\', \'${item.username}\', \'${item.name}\', \'${item.valentine}\', Now())`);
            if(usersStatus)
            return true;
        }
    });
}

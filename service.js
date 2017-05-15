const _ = require('underscore');
const fs = require('fs');
const timeStamp = require('time-stamp');
const telegram = require('node-telegram-bot-api');

const telegramBot = require('./bot');

var apiKey = function() {
  if (fs.existsSync('botconf.json')) {
    data = fs.readFileSync('botconf.json', {"encoding": "utf8"});
    if (data != "") {
      return JSON.parse(data)['telegram-api-key'];
    }
  }
};
var api = new telegram(apiKey(), {polling: true});

var bot = new telegramBot.Bot(api);

api.onText(/\/(.+)/, function(message, match){
  console.log(message)
  if (isBotMessage(message)) {
    var chatId = message.chat.id;
    var cmdOffsets = parseBotCommand(message.entities);
    var command = message.text.substring(cmdOffsets.commandStart, cmdOffsets.commandEnd);
    console.log(command);
    switch (command) {
      case '/startReporting':
        var filterParams = parseFilterParameters(message.text);
        console.log("Parsed parameters: ");
        console.log(filterParams);
        bot.startReporting(chatId, filterParams);
        break;
      case '/stopReporting':
        bot.stopReporting(chatId);
        break;
      case '/getNew':
        bot.getNew(chatId);
        break;
      default:
        sendUnsupportedOperationError(chatId, command);
    }
  }
});

var parseFilterParameters = function(message) {
  var params = message.match(/\(.+\)/);
  var parameters = {};
  if (params && params.length > 0) {
    var stripped = params[0].replace('(', '').replace(')', '');
    _.each(stripped.split(', '), function(parameter) {
      var kvp = parameter.split("=");
      if (kvp[1].indexOf('-') > -1) {
        parameters[kvp[0]] = timeStamp(kvp[1]);
      } else {
        parameters[kvp[0]] = kvp[1];
      }
    });
  }
  return parameters;
}

var isBotMessage = function(message) {
  var messageIsText = message.text;
  console.log("Is text: " + messageIsText);
  if (messageIsText) {
    var hasBotCommand = _.some(message.entities, function(entity) {
      return entity['type'] == 'bot_command';
    });

    return messageIsText && hasBotCommand;
  }
  return false;
}

var parseBotCommand = function(messageEntities) {
  var command = _.find(messageEntities, function(entity) {
    return entity.type == 'bot_command';
  });
  return {commandStart: command.offset, commandEnd: command.length}
};

var sendUnsupportedOperationError = function(chatId, unsupportedOperation) {
  api.sendMessage(chatId, "Unsupported operation:\"" + message.text + "\".")
  .catch(function(error) {
    console.log(error);
  });
}

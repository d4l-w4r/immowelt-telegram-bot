const _ = require('underscore');
const telegram = require('telegram-bot-api');

var api = new telegram({
  token: '351490564:AAES4bmKq5akFfeNjz0fcgYUiKscmhrWQrI'),
  updates: { enabled: true }
};

api.on('message', function(message){
  if (isBotMessage(message)) {
    var chatId = message.chat.id;
    var command = parseBotCommand(message.entities);

    switch (command) {
      case 'startReporting':
        bot.startReporting(chatId);
        break;
      case 'stopReporting':
        bot.stopReporting(chatId);
        break;
      case 'getNew':
        bot.getNew(chatId);
        break;
      default:
        sendUnsupportedOperationError(chatId, command);
    }
  }
});

var isBotMessage = function(message) {
  var messageIsText = message.text;
  var hasBotCommand = false;
  if (messageIsText) {
    var hasBotCommand = _.some(message.entities, function(entity) {
      entity.type == 'bot_command';
    });
  }
  return messageIsText && hasBotCommand;
}

var parseBotCommand = function(messageEntities) {
  var command = _.find(messageEntities, function(entity) {
    return entity.type == 'bot_command';
  });
  return {commandStart: command.offset, commandEnd: command.length}
};

var sendUnsupportedOperationError = function(chatId, unsupportedOperation) {
  bot.sendMessage({
    chat_id: chatId,
    text: "Unsupported operation:\"" + message.text + "\"."
  }).catch(function(error) {
    console.log(error);
  });
}

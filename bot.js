const filter = require('./filter_api');
const _ = require('underscore');

const areasByZip = {
  "20099": "Sankt Georg",
  "20251": "Hoheluft-Ost",
  "22609": "Othmarschen",
  "22453": "Groß Borstel",
  "22607": "Othmarschen",
  "22605": "Othmarschen",
  "22305": "Winterhude",
  "20095": "Sankt Georg",
  "20097": "Sankt Georg",
  "20357": "Eimsbüttel",
  "20355": "Sankt Pauli",
  "20354": "Rotherbaum",
  "22299": "Winterhude",
  "22529": "Hoheluft-West",
  "22527": "Eimsbüttel",
  "22297": "Groß Borstel",
  "20359": "Sankt Pauli",
  "22525": "Eimsbüttel",
  "21107": "Wilhelmsburg",
  "22303": "Winterhude",
  "20253": "Hoheluft-West",
  "22767": "Sankt Pauli",
  "20257": "Eimsbüttel",
  "20255": "Hoheluft-West",
  "22081": "Barmbek-Süd",
  "21109": "Veddel",
  "22083": "Barmbek-Süd",
  "22301": "Winterhude",
  "22085": "Barmbek-Süd",
  "22307": "Barmbek-Nord",
  "22087": "Hamm",
  "20459": "Sankt Pauli",
  "22089": "Hamm",
  "22309": "Barmbek-Nord",
  "20537": "Hamm",
  "22761": "Bahrenfeld",
  "20535": "Hamm",
  "22763": "Othmarschen",
  "20146": "Rotherbaum",
  "22765": "Altona-Altstadt",
  "20144": "Eimsbüttel",
  "20457": "Hamburg-Altstadt",
  "22769": "Eimsbüttel",
  "20148": "Rotherbaum",
  "20149": "Rotherbaum",
  "20539": "Wilhelmsburg",
  "22047": "Wandsbek",
  "20259": "Eimsbüttel",
  "22041": "Wandsbek",
  "22043": "Marienthal",
  "22049": "Dulsberg",
  "20249": "Hoheluft-Ost",
  "22337": "Alsterdorf",
  "22539": "Veddel",
  "22335": "Groß Borstel"
};

module.exports.Bot = function(telegramInstance) {

  var filterApi = new filter.FilterApi();

  var subscriptions = []

  this.startReporting = function(chatId, filterParams) {
    console.log("Start reporting to " + chatId);
    filterApi.subscribe(chatId, filterParams)
      .then(function(result) {
        sendMessage(chatId, "Start reporting new offers...");
        schedulePeriodicCheck(chatId);
      })
      .catch(function(error) {
        console.error(error);
        sendMessage(chatId, "Irgendwas ist da schief gelaufen...");
      });
  };

  this.stopReporting = function(chatId) {
    console.log("Stop reporting to " + chatId);
    filterApi.unsubscribe(chatId)
      .then(function(result) {
        sendMessage(chatId, "Das ist erstmal das letzte was ihr von mir hört!")
        var subscription = _.find(subscriptions, function(subscription) {
          return chatId == subscription.id;
        });
        clearInterval(subscription.task);
        _.without(subscriptions, subscription);
      })
      .catch(function(error) {
        console.error(error);
        sendMessage(chatId, "Irgendwas ist da schief gelaufen...Ich spam wohl erstmal weiter :P");
      });
  };

  this.getNew = function(chatId) {
    getNewEntries(chatId);
  }

  var getNewEntries = function(chatId) {
    console.log("Looking for newest offers...");
    filterApi.getUpdates(chatId)
      .then(function(result) {
        _.each(result['data'], function(entry) {
          sendMessage(chatId, buildTelegramMessage(entry))
        });
      })
      .catch(function(error) {
          sendMessage(chatId, "Irgendwas ist da schief gelaufen. Kann keine neuen Angebote zeigen.");
      });
  }

  var resolveLocation = function(address, zip) {
      var zipArea = zip + " (" + areasByZip[zip] + ")";
      if (!_.isNull(address)) {
          return address + ", " + zipArea;
      }
      return zipArea;
  }

  var resolveRent = function(base, total) {
      var baseRent = "Kaltmiete: " + base + "€";
      if (!_.isNull(total)) {
          return baseRent + "\nWarmmiete: " + total + "€";
      }
      return baseRent;
  }

  var buildTelegramMessage = function(entry) {
      var location = resolveLocation(entry['address'], entry['postalCode']);
      var header = entry['rooms'] + " Zimmer Wohnung in " + location;
      var rent = resolveRent(entry['rentBase'], entry['rentTotal']);
      return header + "\n" + rent + "\n" + entry['url'];
  }

  var schedulePeriodicCheck = function(chatId) {
    var delay1Minute = 60 * 1000;
    var filterTask = setInterval(getNewEntries, delay1Minute, chatId);
    subscriptions.push({id: chatId, task: filterTask});
  }

  var sendMessage = function(chatId, message) {
    console.log("sending message: " + message + " to chat " + chatId);
    telegramInstance.sendMessage(chatId, message)
    .then(function(data) {
      console.log(data);
    }).catch(function(error) {
      console.error(error);
    });
  };
};

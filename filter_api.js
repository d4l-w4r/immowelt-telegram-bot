const request = require('request');
const _ = require('underscore');

module.exports.FilterApi = function() {

  var baseUrl = 'http://127.0.0.1:1235/api/subscriber';

  this.subscribe = function(chatId, filterParams) {
    return new Promise(function(resolve, reject) {
      request.post({ url: baseUrl + "/subscribe", body: {subscriberId: chatId, filterParameters: filterParams}, json: true}, (error, response, body) => {
        if (error) {
          reject(error);
          return;
        }

        if (response.statusCode !== 200) {
          console.log(response);
          console.log(error);
          console.log(body);
          reject(`Invalid response: ${response.statusCode}`);
          return;
        }

        resolve(body);
      });
    });
  };

  this.unsubscribe = function(chatId) {
    return new Promise(function(resolve, reject) {
      request.put(baseUrl + "/" + chatId + "/unsubscribe", (error, response, body) => {
        if (error) {
          reject(error);
          return;
        }

        if (response.statusCode !== 200) {
          console.log(response);
          console.log(error);
          console.log(body);
          reject(`Invalid response: ${response.statusCode}`);
          return;
        }

        resolve(JSON.parse(body));
      });
    });
  }

  this.getUpdates = function(chatId) {
    return new Promise(function(resolve, reject) {
      request.get(baseUrl + "/" + chatId + "/results", (error, response, body) => {
        if (error) {
          reject(error);
          return;
        }

        if (response.statusCode !== 200) {
          console.log(response);
          console.log(error);
          console.log(body);
          reject(`Invalid response: ${response.statusCode}`);
          return;
        }

        resolve(JSON.parse(body));
      });
    });
  }

}

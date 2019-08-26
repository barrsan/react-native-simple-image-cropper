"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPercentDiffNumberFromNumber = exports.getPercentFromNumber = void 0;

var getPercentFromNumber = function getPercentFromNumber(percent, numberFrom) {
  return numberFrom / 100 * percent;
};

exports.getPercentFromNumber = getPercentFromNumber;

var getPercentDiffNumberFromNumber = function getPercentDiffNumberFromNumber(number, numberFrom) {
  return number / numberFrom * 100;
};

exports.getPercentDiffNumberFromNumber = getPercentDiffNumberFromNumber;
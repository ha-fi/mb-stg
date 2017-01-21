(function(Mineralbay) {
  'use strict';

  Mineralbay.filter('capitalize', function() {
    return function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };
  });
})(angular.module('mineralbay'));

(function(Mineralbay) {
  'use strict';
  Mineralbay.directive('btLoader', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'template/loader/bt-loader.tpl.html'
    };
  });
})(angular.module('mineralbay'));
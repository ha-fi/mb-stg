(function(Mineralbay) {
  'use strict';

  Mineralbay.directive('btAddClassOnLoad', function () {
    return {
      link: function(scope, element, attrs) {
        attrs.$observe('btAddClassOnLoad', function(attrClass) {
          element.bind('load', function(){
            element.addClass(attrClass);
          });
        });
      }
    };
  });
})(angular.module('mineralbay'));

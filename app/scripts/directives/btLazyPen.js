(function(Mineralbay) {
  'use strict';

  /**
   * @ngdoc directive
   * @name  mineralbay.directive:lazyPen
   * @restrict E
   *
   * @description Lazy loads a CodePen iframe
   */
  Mineralbay.directive('btLazyPen', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        height: '@',
        themeId: '@',
        slug: '@',
        userId: '@',
        author: '@'
      },
      templateUrl: 'template/btLazyPen/btLazyPen.tpl.html',
      link: function(scope) {
        scope.showingPen = { value: false };
      }
    };
  });
})(angular.module('mineralbay'));
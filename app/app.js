(function() {
  'use strict';

  angular.module('mineralbay', [
    'ui.bootstrap',
    'ui.select',
    'angularMoment',
    'ngSanitize',
    'ngAnimate',
    'ngRoute'
  ])
  .value('AUTO_START_TOUR', {
    value: false
  })
  .config(function(uiSelectConfig) {
    uiSelectConfig.theme = 'bootstrap';
  })
  .config(function($interpolateProvider) {
	    $interpolateProvider.startSymbol('[[');
	    $interpolateProvider.endSymbol(']]');
  });

  angular.module('ui.bootstrap')
  .config(function($provide) {
    $provide.decorator('pagerDirective', function($delegate) {
      var defaultUrl = $delegate[0].templateUrl;
      $delegate[0].templateUrl = function(tElement, tAttrs) {
        return tAttrs.templateUrl || defaultUrl;
      };

      return $delegate;
    });
  });

})();

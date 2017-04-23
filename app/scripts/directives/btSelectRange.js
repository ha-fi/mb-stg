(function(Mineralbay) {
  'use strict';

  /**
   * @ngdoc directive
   * @name  mineralbay.directive:btSelectRange
   * @requires $filter
   * @restrict E
   *
   * @param {Array} values Array of values to display in the select dropdowns.
   * @param {string} minPlaceholder String to show when the user is selecting an item from the minimum dropdown
   * @param {string} maxPlaceholder String to show when the user is selecting an item from the maximum dropdown
   * @param {string} btnClass String to add a Bootstrap class to control the style of the button
   * @param {string} rangeType If the range type is 'money', format the Number values as currency.
   * @param {function} translate If numbers and currency are not acceptable values, or the 'No min' and 'No max' are not satisfactory empty values, a function can be provided to translate them.
   *
   * @description The `btSelectRange` element directive wraps the AngularUI's uiSelect directive.
   * It allows the user to change the placeholder text for the range, and ensures that the minimum will always
   * be less than the maximum.  It also provides a way for the user to select 'No minimum' or 'No maximum' if
   * the array provided has -1 value in it.  This directive will add the users input to the current
   * list of items shown as the user types, and if the user enters a non-provided value, that value will be added
   * to the values Array provided.
   *
   */
  Mineralbay.directive('btSelectRange', function($filter) {
    return {
      restrict: 'E',
      require: 'ngModel',
      templateUrl: 'template/select-range/range.tpl.html',
      replace: true,
      scope: {
        values: '=',
        minPlaceholder: '@',
        maxPlaceholder: '@',
        btnClass: '@',
        translateMin: '=',
        translateMax: '=',
        onSelectBoundary: '&'
      },
      link: function(scope, iElement, iAttrs, ngModel) {
        /*
         * Set default values for minimum, maximum, and placeholders.
         */
        scope.minimum = {
          value: ngModel.$modelValue.minimum
        };
        scope.maximum = {
          value: ngModel.$modelValue.maximum
        };
        scope.minPlaceholder = scope.minPlaceholder || 'Select a minimum value';
        scope.maxPlaceholder = scope.maxPlaceholder || 'Select a maximum value';
        scope.btnClass       = scope.btnClass       || '';
        scope.boundaryEnum = {
          MINIMUM : 'minimum',
          MAXIMUM : 'maximum'
        };

        var validateMinMax = function(flippingFn) {
          if(scope.maximum.value !== -1 && scope.minimum.value !== -1 && scope.maximum.value < scope.minimum.value && flippingFn) {
            flippingFn();
          }
        };

        var addValueToValues = function(value, collection) {
          if (value && collection) {

            // First, remove all non-number or decimal characters from string
            var parsedValue = value.toString().replace(/[^0-9\.]+/, '');

            // If the string is not completely empty, we likely have a number
            if (parsedValue) {
              parsedValue = parseFloat(parseFloat(parsedValue).toFixed(2));
              if (!isNaN(parsedValue) && collection.indexOf(parsedValue) === -1) {
                collection.unshift(parsedValue);
              }
            }
          }
        };

        var translateValidValue;
        if (iAttrs.rangeType === 'money') {
          translateValidValue = function(value) {
            return $filter('currency')(value).split('.')[0];
          };
        } else {
          translateValidValue = angular.identity;
        }

        scope.translateMinValue = scope.translateMin || function(value, defaultText) {
          if (angular.isNumber(value)) {
            return value === -1 ? defaultText : translateValidValue(value);
          } else {
            return defaultText;
          }
        };

        scope.translateMaxValue = scope.translateMax || function(value, defaultText) {
          if (angular.isNumber(value)) {
            return value === -1 ? defaultText : translateValidValue(value);
          } else {
            return defaultText;
          }
        };

        /*
         * selectRangeBoundary
         * This function is fired whenever user selects and item from either
         * min or max dropdown and is used to communicate to external controllers
         * Optional hook to onSelectBoundary may be provided in the directive markup: on-select-boundary='someFunction(minOrMax, value)'
         * Specifically implemented for event tracking / analytics
         * @minOrMax - string (boundaryEnum.MINIMUM or boundaryEnum.MAXIMUM) to differentiate between the dropdowns
         * @value - selected value (currently only integers are supported)
         */
        scope.selectRangeBoundary = function (minOrMax, value) {
          if (typeof(scope.onSelectBoundary) === 'function') {
            scope.onSelectBoundary({minOrMax: minOrMax, value:value});
          }
        };

        (function() {
          /*
           * getValues uses modifiedValues and previousValue
           * to avoid modifying the collection and value
           * each digest loop.  If the user has provided
           * new input, then we transform the value and return
           * a modified collection.
           */
          var modifiedValues, previousValue;
          scope.getValues = function(value) {
            if (value !== previousValue) {
              previousValue = value;
              modifiedValues = scope.values.slice();
              addValueToValues(value, modifiedValues);
            }
            return modifiedValues;
          };
        })();

        scope.$watch(function() { return ngModel.$modelValue.minimum; }, function() {
          if (scope.minimum.value !== ngModel.$modelValue.minimum) {
            scope.minimum.value = ngModel.$modelValue.minimum;
          }
        });

        scope.$watch(function() { return ngModel.$modelValue.maximum; }, function() {
          if (scope.maximum.value !== ngModel.$modelValue.maximum) {
            scope.maximum.value = ngModel.$modelValue.maximum;
          }
        });

        scope.$watch('minimum.value', function(newMin, oldMin) {
          if (newMin !== oldMin) {
            validateMinMax(function() {
              // Pass in the flipping function if the min/max order is invalid.
              scope.maximum.value = scope.minimum.value;
            });

            // Add the value to the list of potential values
            addValueToValues(scope.minimum.value, scope.values);

            // Update the ngModel
            ngModel.$modelValue.minimum = scope.minimum.value;
            ngModel.$setViewValue(ngModel.$viewValue);
          }
        });

        scope.$watch('maximum.value', function(newMax, oldMax) {
          if (newMax !== oldMax) {
            validateMinMax(function() {
              // Pass in the flipping function if the min/max order is invalid.
              scope.minimum.value = scope.maximum.value;
            });

            // Add the value to the list of potential values
            addValueToValues(scope.maximum.value, scope.values);

            // Update the ngModel
            ngModel.$modelValue.maximum = scope.maximum.value;
            ngModel.$setViewValue(ngModel.$viewValue);
          }
        });
      }
    };
  });
})(angular.module('mineralbay'));
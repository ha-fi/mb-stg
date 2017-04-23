(function(Mineralbay, Tour) {
  'use strict';
  Mineralbay.service('bootstrapTourService', function($templateCache, $rootScope, $http, AUTO_START_TOUR) {
    var tourRef;

    var tour = {
      init: function(steps, onStart, onNextStep, onDismiss, onComplete) {
        var tourSteps = [];
        angular.forEach(steps, function(step) {
          if (step.template) {
            step.template = $templateCache.get(step.template);
          }
          if (!step.content && !step.title) {
            // Giving content a default value due to an issue
            // with bootstrap tour where a popover will not show
            // if both the content and the title is empty
            step.content = '.';
          }
          tourSteps.push(step);
        });

        tour.steps = tourSteps;
        tour.onStart = onStart;
        tour.onNextStep = onNextStep;
        tour.onDismiss = onDismiss;
        tour.onComplete = onComplete;
      },
      steps: [],
      startTour: function(startingStep) {
        startingStep = startingStep || 0;
        var tourTemplate = $templateCache.get('template/popover/popover-bootstrap-tour.html');

        var wasHidden = tour.isHidden;
        tour.isHidden = false;

        // End existing tours
        if(tourRef && tourRef.ended && !tourRef.ended()) {
          tourRef.end();
        }

        var ngApply = function(fn) {
          return function() {
            // This could be called in a programmatic context so
            // Make sure we're not currently in an angular context first
            if(!$rootScope.$$phase) {
              $rootScope.$apply(fn);
            } else {
              fn();
            }
          };
        };

        tourRef = new Tour({
          steps: tour.steps.slice(startingStep),
          template: tourTemplate,
          container: 'body',
          storage: false,
          onNext: ngApply(function() {
            tour.currentStep += 1;

            if (tour.onNextStep) {
              tour.onNextStep();
            }
          }),
          onPrev: ngApply(function() {
            tour.currentStep -= 1;
          }),
          onEnd: ngApply(function() {
            if (!tour.isHidden) {
              if (tour.currentStep === tour.steps.length - 1) {

                // Tour is complete
                if (tour.onComplete) {
                  tour.onComplete();
                }
              } else {

                // Tour is dismissed
                if (tour.onDismiss) {
                  tour.onDismiss();
                }
              }
            }

            tour.currentStep = -1;
          })
        });
        tourRef.init();
        tourRef.start(true);

        tour.currentStep = startingStep;

        if (!wasHidden && tour.onStart) {
          tour.onStart();
        }

        $rootScope.$on('$stateChangeStart', function() {
          if(tourRef && tourRef.ended && !tourRef.ended()) {
            // End the tour at the current step, but do not dismiss
            tour.endTour(true);
            AUTO_START_TOUR.value = false;
          }
        });
      },
      currentStep: -1,
      isHidden: false,
      shouldResume: function(val) {
        if (angular.isDefined(val)) {
          tour.isHidden = val;

          /*
           * shouldResume is assuming that the tour will start again
           * Because we are starting the tour in an intermediate state
           * the next step function will not be registered
           * Call the next step function here because of this
           */
          if (tour.onNextStep) {
            tour.onNextStep();
          }
        }
        return tour.isHidden;
      },
      goToNextStep: function() {
        tourRef.next();
      },
      endTour: function() {
        tourRef.end();
      }
    };

    return tour;
  });
})(angular.module('mineralbay'), window.Tour);
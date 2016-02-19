var app = angular.module('Flightboard', []);

app.controller('FlightboardController', function ($scope) {

    $scope.auto = true;

    $scope.schedule = [];
    $scope.completeSchedule = [];
    $scope.highlight = null;
    $scope.selected = 0;

    $scope.rotateSelectionInterval = null;
    $scope.updateHighlightsInterval = null;
    $scope.updateCsvInterval = null;
    $scope.intervalsInitialized = false;
    $scope.updatingCsv = false;

    $scope.ROTATE_SELECTION_DELAY = 120000; // 120 000ms == 2 minutes
    $scope.UPDATE_HIGHLIGHTS_DELAY = 3000;
    $scope.UPDATE_CSV_DELAY = 30011	; // 30 011ms = ~30 seconds, chosen because prime number

    $scope.startRotateSelectionInterval = function () {
        if ($scope.auto) {
            $scope.rotateSelectionInterval = setInterval(function () {
                $scope.rotateSelection();
            }, $scope.ROTATE_SELECTION_DELAY);
        }
    };

    $scope.startUpdateHighlightsInterval = function() {
        $scope.updateHighlightsInterval = setInterval(function() {
            $scope.updateHighlights();
        }, $scope.UPDATE_HIGHLIGHTS_DELAY);
    };

    $scope.startUpdateCsvInterval = function() {
        $scope.updateCsvInterval = setInterval(function() {
            $scope.updateCsv();
        }, $scope.UPDATE_CSV_DELAY);
    };

    $scope.stopRotateSelectionInterval = function() {
        $scope.rotateSelectionInterval.clear();
    };

    $scope.stopUpdateHighlightsInterval = function() {
        $scope.updateHighlightsInterval.clear();
    };

    $scope.stopUpdateCsvInterval = function() {
        $scope.updateCsvInterval.clear();
    };

    $scope.updateCsv = function() {
        $scope.updatingCsv = true;
        Papa.parse("csv/schedule.csv", {
            download: true,
            header: true,
            complete: function(results) {
                $scope.updatingCsv = false;
                results.data.pop();
                $scope.completeSchedule = results.data;
                $scope.loadCategory($scope.selected);
                $scope.parseBools();
                $scope.updateHighlights();
                if (!$scope.intervalsInitialized) {
                    $scope.startUpdateHighlightsInterval();
                    $scope.startRotateSelectionInterval();
                    $scope.startUpdateCsvInterval();
                    $scope.intervalsInitialized = true;
                }
                $scope.$apply();
            }
        });
    };

    $scope.loadCategory = function(index) {
        if ($scope.updatingCsv) return;
        var category = '';
        switch (index) {
            case 0:
                category = 'innovation';
                break;
            case 1:
                category = 'wc';
                break;
            case 2:
                category = 'games';
                break;
            default:
                category = 'innovation';
        }
        $scope.schedule = [];
        for (var i=0; i<$scope.completeSchedule.length; ++i) {
            if ($scope.completeSchedule[i].category.toLowerCase() == category) {
                $scope.schedule.push($scope.completeSchedule[i]);
            }
        }
        $scope.updateHighlights();
    };

    $scope.rotateSelection = function() {
        $scope.select(++$scope.selected > 2 ? $scope.selected = 0 : $scope.selected);
    };

    $scope.select = function (index) {
        $scope.selected = index;
        $scope.loadCategory($scope.selected);
        $scope.$apply();
    };

    $scope.parseBools = function() {
        if ($scope.updatingCsv) return;
        for (var i=0; i<$scope.schedule.length; ++i) {
            $scope.schedule[i].isDelayed = $.parseJSON($scope.schedule[i].isDelayed.toLowerCase());
        }
    };

    $scope.updateHighlights = function() {
        if ($scope.updatingCsv) return;
        var anyFound = false;
        for (var i=0; i<$scope.schedule.length; ++i) {
            if ($scope.updateHightlight(i)) {
                anyFound = true;
            }
        }
        if (!anyFound) {
            $scope.highlight = -1; // highlight none
        }
    };

    $scope.updateHightlight = function(index) {
        if ($scope.updatingCsv) return;
        var startHour = parseInt($scope.schedule[index].startHour.split(':')[0]);
        var startMinutes = parseInt($scope.schedule[index].startHour.split(':')[1]);
        var endHour = parseInt($scope.schedule[index].endHour.split(':')[0]);
        var endMinutes = parseInt($scope.schedule[index].endHour.split(':')[1]);

        var startDate = new Date();
        startDate.setHours(startHour);
        startDate.setMinutes(startMinutes);

        var endDate = new Date();
        endDate.setHours(endHour);
        endDate.setMinutes(endMinutes);

        var now = new Date();

        if (now > startDate && now < endDate) {
            $scope.highlight = index;
            $scope.$apply();
            if ($scope.auto) {
                $('.agenda:eq(' + index + ')').goTo();
            }
            return true;
        }
        return false;
    };

    $scope.updateCsv();

    (function($) {
        $.fn.goTo = function() {
            $('html, body').animate({
                scrollTop: $(this).offset().top - ((Math.max(document.documentElement.clientHeight, window.innerHeight || 0)) * 0.33) + 'px'
            }, 'fast');
            return this; // for chaining...
        }
    })(jQuery);

});
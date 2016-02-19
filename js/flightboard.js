var app = angular.module('Flightboard', []);

app.controller('FlightboardController', function ($scope) {

    $scope.schedule = [];
    $scope.completeSchedule = [];
    $scope.highlight = null;
    $scope.selected = 0;

    Papa.parse("csv/schedule.csv", {
        download: true,
        header: true,
        complete: function(results) {
            results.data.pop();
            $scope.completeSchedule = results.data;
            $scope.loadCategory();
            $scope.parseBools();
            $scope.updateHighlights();
            $scope.$apply();
            setInterval(function() {
                $scope.updateHighlights();
            }, 3000);
            setInterval(function() {
                $scope.rotateSelection();
            }, 120000); // 120000ms == 2 minutes
        }
    });

    (function($) {
        $.fn.goTo = function() {
            $('html, body').animate({
                scrollTop: $(this).offset().top - ((Math.max(document.documentElement.clientHeight, window.innerHeight || 0)) * 0.33) + 'px'
            }, 'fast');
            return this; // for chaining...
        }
    })(jQuery);

    $scope.loadCategory = function(index) {
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
        for (var i=0; i<$scope.schedule.length; ++i) {
            $scope.schedule[i].isDelayed = $.parseJSON($scope.schedule[i].isDelayed.toLowerCase());
        }
    };

    $scope.updateHighlights = function() {
        var anyFound = false;
        for (var i=0; i<$scope.schedule.length; ++i) {
            if ($scope.updateHightlight(i)) {
                anyFound = true;
            };
        }
        if (!anyFound) {
            $scope.highlight = -1;
        }
    };

    $scope.updateHightlight = function(index) {

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
            $('.agenda:eq(' + index + ')').goTo();
            return true;
        }
        return false;
    }

});
/*
 * Copyright (C) 2017 Push Technology Ltd.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

'use strict';

var app = require('angular').module('racing');

app.factory('StatsModel', function() {
    var StatsModel = {
        options : {
                    "chart": {
                      "type": "lineChart",
                      "height": 280,
                      "margin": {
                        "top": 20,
                        "right": 20,
                        "bottom": 40,
                        "left": 55
                      },
                      "useInteractiveGuideline": true,
                      "dispatch": {},
                      "xAxis": {
                        "axisLabel": "Lap"
                      },
                      "yAxis": {
                        "axisLabel": "Lap Time",
                        "axisLabelDistance": -10
                      }
                    },
                    "legend" : {enable:false},
                    "title": {
                      "enable": false
                    },
                    "subtitle": {
                      "enable": false
                    },
                    "caption": {
                      "enable": false
                    }
                  },
        data : [
            {
                values : [],
                key : 'Lap Times',
                color : '#f15500',
                area : false
            }
        ]
    };

    StatsModel.init = function(data) {
        StatsModel.clear();
        data.forEach(function(time, lap) {
            StatsModel.data[0].values.push({ x : lap + 1, y : time.toFixed(3) });
        });
    };

    StatsModel.getLaps = function() {
        return StatsModel.data;
    };

    StatsModel.clear = function() {
        StatsModel.data[0].values = [];
    };

    StatsModel.dummy = function() {
        var promise = function(success, failure) {
            success([
                34.123,
                33.109,
                34.893,
                31.513,
                31.301,
                29.985,
                29.994,
                28.964,
                29.543,
                29.859
            ]);
        };

        return { then : promise };
    };

    return StatsModel;
});

app.controller('StatsController', ['$scope', '$http', 'CarsModel', 'StatsModel', 'Diffusion', 'TopicModel',
    function($scope, $http, CarsModel, StatsModel, Diffusion, TopicModel) {

    var rootTopic = TopicModel.getTopic();
        $scope.stats = false;

    $scope.data = StatsModel.getLaps();

    $scope.carSelected = function() {
        return !!CarsModel.getSelectedCar();
    };

    $scope.getCar = function() {
        return CarsModel.getSelectedCar();
    };

    $scope.options = StatsModel.options;

    $scope.toggleStats = function() {
        $scope.stats = !$scope.stats;
        updateStats();
    };

    var updateStats = function() {
        if ($scope.stats) {
            var car = CarsModel.getSelectedCar();
            var request = { id : ''+car.id, teamid : ''+car.teamid };
            Diffusion.session().messages.sendRequest(rootTopic["Topic"], request).then(function(data) {
                StatsModel.init(data.get());
                $scope.data = StatsModel.getLaps();
            }, function(err) {
                console.log(err);
            });
        }
    };

    $scope.$watch(function() {
        if (CarsModel.getSelectedCar()) {
            return CarsModel.getSelectedCar().laps;
        }
        return 0;
    }, updateStats);

        $scope.$watch(function() {
            if (CarsModel.getSelectedCar()) {
                return CarsModel.getSelectedCar().id + ' ' + CarsModel.getSelectedCar().teamid;
            }
            return '0';
        }, updateStats);
    }]);
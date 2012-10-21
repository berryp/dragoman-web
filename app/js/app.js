'use strict';

var Dragoman = angular.module('dragoman', ['ngResource']);

Dragoman
    .config(['$routeProvider', '$locationProvider', '$httpProvider',
        function(routeProvider, locationProvider, httpProvider) {
            routeProvider.
                when('/', {
                    templateUrl: 'partials/home.html',
                    controller: 'CatalogListCtrl'
                }).
                when('/login', {
                    templateUrl: 'partials/login.html',
                    controller: 'LoginCtrl'
                }).
                when('/catalogs', {
                    templateUrl: 'partials/catalog-list.html',
                    controller: 'CatalogListCtrl'
                }).
                when('/catalogs/:catalogId', {
                    templateUrl: 'partials/catalog-detail.html',
                    controller: 'CatalogDetailCtrl'
                }).
                when('/catalogs/:catalogId/:languageCode', {
                    templateUrl: 'partials/catalog-detail.html',
                    controller: 'CatalogDetailCtrl'
                }).
                otherwise({redirectTo: '/'});
        }
    ]);

Dragoman.run(['$rootScope', '$http', '$compile', 'Catalog',
    function(scope, http, compile, Catalog) {
        scope.flash = function (message, status) {
            scope.$broadcast('flash', message, status);
        }

        scope.$on('flash', function(event, message, status) {
            var html = '' +
                '<div class="alert alert-' + status + '">' +
                '   <button type="button" class="close" data-dismiss="alert">x</button>' +
                '    ' + message +
                '</div>';

            //var element = compile(template)({message: message, status: status});
            $('.flash').append(html);
        });

        scope.catalogs = Catalog.query();
    }
]);
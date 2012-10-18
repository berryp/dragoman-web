'use strict';

var Dragoman = angular.module('dragoman', ['ngResource']);

Dragoman.config(function($routeProvider, $locationProvider) {
        // $locationProvider.html5Mode(true);
        $routeProvider.
            when('/', {
                templateUrl: 'partials/home.html',
                controller: 'CatalogListCtrl'
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
    });

Dragoman.run(function($rootScope, Catalog) {
    var isLoggedIn = function () {
        return true;
    };

    $rootScope.isLoggedIn = isLoggedIn;

    if (isLoggedIn()) {
        $rootScope.session = {'username': 'berryp'};
        $rootScope.catalogs = Catalog.query();
    }
});
'use strict';

Dragoman.
    factory('Catalog', function($resource) {
        return $resource('/catalogs/:catalogId', {});
    }).
    factory('Message', function($resource, $routeParams) {
        return $resource('/catalogs/:catalogId/messages/:languageCode/:messageId', {
            catalogId: $routeParams.catalogId, languageCode: $routeParams.languageCode
        });
    });

'use strict';

Dragoman.
    factory('Catalog', function($resource) {
        return $resource('/catalogs/:catalogId', {});
    }).
    factory('Message', function($resource, $routeParams) {
        var Message = $resource('/catalogs/:catalogId/messages/:languageCode/:msgid', {
            catalogId: $routeParams.catalogId, languageCode: $routeParams.languageCode
            }, {
        });

        return Message;
    });

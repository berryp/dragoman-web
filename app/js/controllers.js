'use strict';

function CatalogListCtrl($scope, $routeParams, Catalog) {

}

function CatalogDetailCtrl($scope, $routeParams, $location, Catalog, Message) {
    Catalog.get({catalogId: $routeParams.catalogId}, function (catalog) {
        if ($routeParams.languageCode) {
            $scope.languageCode = $routeParams.languageCode;
            $scope.messages = Message.query();
        }

        $scope.catalog = catalog;
        $scope.language = catalog.languages[$routeParams.languageCode];
    });

    $scope.addLanguage = function () {
        // $scope.catalog.languages[$scope.languagecode] = {
        //     code: $scope.languagecode,
        //     name: langList[$scope.languagecode]
        // };
        // $scope.catalog.$save();
    };
    $scope.editMessage = function (message) {
        $scope.message = message;
        //$location.path('/catalogs/' + $scope.catalogId + '/' + $scope.languageCode);
    };
}

function CatalogFormController($scope, Catalog) {
    $scope.catalogId = '';
    $scope.catalogName = '';
    $scope.catalogDescription = '';

    $scope.saveCatalog = function () {
        var newCatalog = new Catalog({
            'id': $scope.catalogId,
            'name': $scope.catalogName,
            'description': $scope.catalogDescription
        });

        newCatalog.$save(function (catalog) {
            $scope.catalogId = '';
            $scope.catalogName = '';
            $scope.catalogDescription = '';
        });
    };
}

function ImportPofileFormController($scope, $location, $routeParams, $http, Catalog) {
    var langList = languageList;
    var catalogLangKeys = Object.keys($scope.catalog.languages);

    for (var i = 0; i < catalogLangKeys.length; i++) {
        if (langList[catalogLangKeys[i]] !== undefined) {
            delete langList[catalogLangKeys[i]];
        }
    }

    $scope.languageList = langList;
    $scope.catalogId = $routeParams.catalogId;
    $scope.langaugeCode = '';

    $scope.change = function () {
        $('#fileDrop').filedrop({
            fallback_id: 'uploadButton',
            url: '/catalogs/' + $scope.catalogId + '/import',
            paramname: 'pofile',
            data: {
                catalogId: $scope.catalogId,
                languageCode: $scope.languageCode
            },
            maxfiles: 1,
            uploadStarted: function (i, file, len) {
                $('#fileDrop').hide();
                $('.progress').width('0%;').show();
            },
            uploadFinished: function (i, file, response, time) {
                $('.progress').hide();
                $('#importPofileModalLabel').modal('hide');
                $scope.$apply(function () {
                    $location.path('/catalogs/' + $scope.catalogId + '/' + $scope.languageCode);
                });

            },
            progressUpdated: function(i, file, progress) {
                $('.progress .bar').width(progress + '%');
            }
        }).show();
        $('.fileDropContainer').show();
    };
}

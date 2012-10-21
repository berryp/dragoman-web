'use strict';

function CatalogListCtrl($scope, $routeParams, Catalog) {

}

function CatalogDetailCtrl($rootScope, $scope, $routeParams, $location, Catalog, Message) {
    Catalog.get({catalogId: $routeParams.catalogId}, function (catalog) {

        if ($routeParams.languageCode) {
            $scope.languageCode = $routeParams.languageCode;
            $scope.language = catalog.languages[$routeParams.languageCode];

            $scope.loading = true;
            $scope.messagesState = 0; // All.
            $scope.messages = Message.query(function () {
                $scope.loading = false;
            });
        }

        $scope.catalog = catalog;
        $scope.advanced_edit = false;

        var pofileLanguageList = languageList;
        var catalogLangKeys = Object.keys($scope.catalog.languages);

        for (var i = 0; i < catalogLangKeys.length; i++) {
            if (pofileLanguageList[catalogLangKeys[i]] !== undefined) {
                delete pofileLanguageList[catalogLangKeys[i]];
            }
        }

        $scope.pofileLanguageList = pofileLanguageList;
        $scope.pofileLanguageCode = '';
    });

    $scope.setMessagesState = function (stateId) {
        $scope.messagesState = stateId;
    };

    $scope.filterByMessageState = function (message) {
        var filter = false;
        switch ($scope.messagesState) {
            case 0:
                filter = true;
                break;
            case 1:
                filter = message.msgstr[0] === '';
                break;
        }
        return filter;
    };

    $scope.filterByText = function (message) {
        function cleanText(text) {
            text = text.replace(/(\r\n|\n|\r)/gm, '');
            text = text.replace(/<\/?[^>]+>/gi, '');
            return text.toLowerCase();
        }
        if ($scope.searchMsgStr === undefined) {
            return true;
        }
        var searchables = [message.msgid, message.msgstr[0]];

        if (message.msgid_plural !== null) {
            searchables.push(message.msgid_plural);
            if (message.msgstr.length === 2) {
                searchables.push(message.msgstr[1]);
            }
        }

        for (var i = 0; i < searchables.length; i++) {
            if (cleanText(searchables[i]).search(
                    $scope.searchMsgStr.toLowerCase()) !== -1) {
                return true;
            }
        }

        return false;
    };

    $scope.clearSearch = function () {
        $scope.searchMsgStr = '';
    };

    $scope.addLanguage = function () {
        // $scope.catalog.languages[$scope.languagecode] = {
        //     code: $scope.languagecode,
        //     name: langList[$scope.languagecode]
        // };
        // $scope.catalog.$save();
    };

    $scope.editMessage = function (message) {
        $scope.message = message;
    };

    $scope.submit = function () {
        var messages = $scope.messages;
        var msgLen = messages.length;

        $scope.loading = true;

        for (var i = 0; i < msgLen; i++) {
            var msg = messages[i];
            if (msg.dirty) {
                delete messages[i].dirty;

                // comments is expected to be a list.
                msg.comments = msg.comments.split('\n');
                var comments = msg.comments;

                for (var j = 0; j < comments.length; j++) {
                    if (comments[j] === '') {
                        msg.comments.pop(j);
                    }
                }

                Message.save({msgid: msg.msgid}, msg); //, function (res) {}
            }
        }

        delete $scope.message;
        $scope.loading = false;
        $rootScope.flash('Messages saved!', 'success');
    };

    $scope.change = function (message) {
        message.dirty = true;
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
    $scope.change = function () {
        $('#importPofileModal').filedrop({
            fallback_id: 'uploadButton',
            url: '/catalogs/' + $scope.catalogId + '/import',
            paramname: 'pofile',
            data: {
                catalogId: $scope.catalogId,
                languageCode: $scope.languageCode
            },
            maxfiles: 1,
            uploadStarted: function (i, file, len) {
                // $('#fileDrop').hide();
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
        // $('.fileDropContainer').show();
    };
}

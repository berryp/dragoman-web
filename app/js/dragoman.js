/*global angular:false, $:false */

'use strict';

var dragomanApp = {
    serviceFactory: {},
    directive: {},
    controller: {}
};

dragomanApp.controller.CatalogListCtrl = function($scope, $routeParams, Catalog) {

};

dragomanApp.controller.CatalogDetailCtrl = function($rootScope, $scope, $routeParams, $location, $filter, Catalog, Message) {
    Catalog.get({catalogId: $routeParams.catalogId}, function (catalog) {
        $scope.currentPage = 0;
        $scope.pageSize = 10;

        if ($routeParams.languageCode) {
            $scope.languageCode = $routeParams.languageCode;
            $scope.language = catalog.languages[$routeParams.languageCode];

            $scope.loading = true;
            $scope.messagesState = 0; // All
            $scope.messages = Message.query(function () {
                $scope.loading = false;
            });
        }

        $scope.catalog = catalog;
        $scope.advanced_edit = false;

        var pofileLanguageList = LANGUAGE_LIST;
        var catalogLangKeys = Object.keys($scope.catalog.languages);

        angular.forEach(catalogLangKeys, function (key) {
            if (pofileLanguageList[key] !== undefined) {
                delete pofileLanguageList[key];
            }
        });

        $scope.pofileLanguageList = pofileLanguageList;
        $scope.pofileLanguageCode = '';
    });

    function reset() {
        delete $scope.editing;
        delete $scope.dirty;
        delete $scope.messageOriginal;
        delete $scope.currentMessage;
    }

    $scope.setMessagesState = function (stateId) {
        delete $scope.currentMessage;
        $scope.messagesState = stateId;
    };

    $scope.filterByMessageState = function (message) {
        var show = false;

        switch ($scope.messagesState) {
            case 0:
                show = true;
                break;
            case 1:
                show = message.msgstr[0] === '';
                break;
            case 1:
                show = message.fuzzy !== undefined && message.fuzzy;
                break;
        }

        return show;
    };

    $scope.filterByText = function (message) {
        function cleanText(text) {
            text = text.replace(/(\r\n|\n|\r)/gm, '');
            text = text.replace(/<\/?[^>]+>/gi, '');
            return text.toLowerCase();
        }

        if (!$scope.searchMsgStr) {
            return true;
        }

        // if (message.msgstr === undefined) {
        //     message.msgstr = [''];
        // }

        var searchables = [message.msgid, message.msgstr[0]];

        if (message.msgid_plural !== null) {
            searchables.push(message.msgid_plural);
            if (message.msgstr.length === 2) {
                searchables.push(message.msgstr[1]);
            }
        }

        angular.forEach(searchables, function (searchable) {
            searchable = searchable === undefined ? '' : cleanText(searchable);
            if (searchable.search($scope.searchMsgStr.toLowerCase()) !== -1) {
                return true;
            }
        });

        return false;
    };

    $scope.messageStatusClass = function (message, active, inactive) {
        if ($scope.currentMessage) {
            return message.msgid === $scope.currentMessage.msgid ? active : inactive;
        }
        return '';
    };

    $scope.clearSearch = function () {
        delete $scope.searchMsgStr;
    };

    $scope.clearEdit = function () {
        delete $scope.currentMessage;
    };

    $scope.addLanguage = function () {
        // $scope.catalog.languages[$scope.languagecode] = {
        //     code: $scope.languagecode,
        //     name: langList[$scope.languagecode]
        // };
        // $scope.catalog.$save();
    };

    $scope.editMessage = function (message) {
        if ($scope.editing) {
            if (!$scope.cancelEdit()) {
                return;
            }
        }

        $scope.editing = true;
        $scope.messageOriginal = angular.copy(message);
        $scope.currentMessage = angular.copy(message);
    };

    $scope.cancelEdit = function () {
        var confirmed = true;

        if ($scope.dirty) {
            confirmed = confirm("Any changes you have made will be lost.");
        }

        if (confirmed) {
            reset();
        }

        return confirmed;
    };

    $scope.submit = function () {
        reset();

        $scope.loading = true;

        var message = $scope.currentMessage;

        // comments is expected to be a list.
        message.comments = message.comments.split('\n');
        var comments = message.comments;

        for (var j = 0; j < comments.length; j++) {
            if (comments[j] === '') {
                message.comments.pop(j);
            }
        }

        Message.save({msgid: message.msgid}, message); //, function (res) {}

        delete $scope.currentMessage;
        $scope.loading = false;
        $rootScope.flash('Messages saved!', 'success');
    };

    $scope.change = function (message) {
        // TODO: There _has_ to be a better way of doing this.
        // Investigate scope.$watch.
        console.log($scope.currentMessage);
        console.log($scope.messageOriginal);
        $scope.dirty = $scope.currentMessage != $scope.messageOriginal;
        console.log($scope.dirty);
    };
};

dragomanApp.controller.CatalogFormController = function ($scope, Catalog) {
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
};

dragomanApp.controller.ImportPofileFormController = function($scope, $location, $routeParams, $http, Catalog) {
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
};

dragomanApp.serviceFactory.Catalog = function ($resource) {
    return $resource('/catalogs/:catalogId', {});
};

dragomanApp.serviceFactory.Message = function ($resource, $routeParams) {
    var Message = $resource('/catalogs/:catalogId/messages/:languageCode/:msgid', {
        catalogId: $routeParams.catalogId, languageCode: $routeParams.languageCode
        }, {
    });

    return Message;
};

angular.module('dragomanApp', ['ngResource']).
    config(['$routeProvider', '$locationProvider', '$httpProvider',
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
    ]).
    factory(dragomanApp.serviceFactory).
    directive(dragomanApp.directive).
    controller(dragomanApp.controller).
    run(['$rootScope', '$http', '$compile', 'Catalog',
        function(scope, http, compile, Catalog) {
            scope.flash = function (message, status) {
                scope.$broadcast('flash', message, status);
            };

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


var LANGUAGE_LIST = {
    'af': 'Afrikaans',
    'ar': 'Arabic',
    'hy': 'Armenian',
    'be': 'Belarusian',
    'bg': 'Bulgarian',
    'ca': 'Catalan',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'hr': 'Croatian',
    'cs': 'Czech',
    'da': 'Danish',
    'nl': 'Dutch',
    'en': 'English',
    'eo': 'Esperanto',
    'et': 'Estonian',
    'tl': 'Filipino',
    'fi': 'Finnish',
    'fr': 'French',
    'de': 'German',
    'el': 'Greek',
    'iw': 'Hebrew',
    'hi': 'Hindi',
    'hu': 'Hungarian',
    'is': 'Icelandic',
    'id': 'Indonesian',
    'it': 'Italian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'no': 'Norwegian',
    'fa': 'Persian',
    'pl': 'Polish',
    'pt': 'Portuguese',
    'ro': 'Romanian',
    'ru': 'Russian',
    'sr': 'Serbian',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'es': 'Spanish',
    'sw': 'Swahili',
    'sv': 'Swedish',
    'th': 'Thai',
    'tr': 'Turkish',
    'uk': 'Ukrainian',
    'vi': 'Vietnamese'
};
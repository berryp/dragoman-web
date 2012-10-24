/*global angular:false, $:false */

'use strict';

var dragomanApp = {
    serviceFactory: {},
    directive: {},
    controller: {}
};

dragomanApp.controller.CatalogListCtrl = function($scope, $routeParams, Catalog) {
    $scope.view = 'application';
};

dragomanApp.controller.CatalogDetailCtrl = function($rootScope, $scope, $routeParams, $location, $filter, $q, Catalog, Message) {
    $scope.hasMessages = false;
    $scope.view = '';

    Catalog.get({catalogId: $routeParams.catalogId}, function (catalog) {
        $scope.messageStates = [[0, 'All'], [1, 'Untranslated'], [2, 'Fuzzy']];

        if ($routeParams.languageCode) {
            $scope.languageCode = $routeParams.languageCode;
            $scope.language = catalog.languages[$routeParams.languageCode];

            $scope.loading = true;
            $scope.messagesState = 0; // All

            Message.query(function (messages) {
                $scope.messages = messages;

                // $scope.loading = false;
                $scope.counts = {
                    messages: $scope.messages.length,
                    untranslated: $scope.untranslatedCount(),
                    fuzzy: $scope.fuzzyCount()
                };

                $scope.view = 'catalog';
                $scope.loading = false;
            });
        } else {
            $scope.view = 'application';
        }

        $scope.catalog = catalog;
        $scope.advanced_edit = false;

        var pofileLanguageList = LANGUAGE_LIST;
        var catalogLangKeys = Object.keys($scope.catalog.languages);

        for (var i = 0; i < catalogLangKeys.length; i++) {
            var key = catalogLangKeys[i];
            if (pofileLanguageList[key] !== undefined) {
                delete pofileLanguageList[key];
            }
        }

        $scope.pofileLanguageList = pofileLanguageList;
        $scope.pofileLanguageCode = '';
    });

    $scope.reset = function () {
        delete $scope.editing;
        delete $scope.dirty;
        delete $scope.messageOriginal;
        delete $scope.currentMessage;
    };

    $scope.setMessagesState = function (stateId) {
        delete $scope.currentMessage;
        $scope.messagesState = stateId;
    };

    $scope.untranslatedCount = function () {
        var msgLen = $scope.messages.length;
        var untranslated = 0;

        for (var i = 0; i < msgLen; i++) {
            var message = $scope.messages[i];
            var messageUntranslated = false;

            messageUntranslated = message.msgstr[0] === '';

            if (messageUntranslated) {
                if (message.msgid_plural && (message.msgstr.length === 1 || message.msgstr[1] === '')) {
                    messageUntranslated = true;
                }
            }

            if (messageUntranslated) {
                untranslated += 1;
            }
        }

        return untranslated;
    };

    $scope.fuzzyCount = function () {
        var msgLen = $scope.messages.length;
        var fuzzyCount = 0;

        for (var i = 0; i < msgLen; i++) {
            if ($scope.messages[i].fuzzy) {
                fuzzyCount += 1;
            }
        }

        return fuzzyCount;
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

        var searchables = [message.msgid, message.msgstr[0]];

        if (message.msgid_plural !== null) {
            searchables.push(message.msgid_plural);
            if (message.msgstr.length === 2) {
                searchables.push(message.msgstr[1]);
            }
        }

        for (var i = 0; i < searchables.length; i++) {
            var searchable = searchables[i];
            searchable = searchable === undefined ? '' : cleanText(searchable);
            if (searchable.search($scope.searchMsgStr.toLowerCase()) !== -1) {
                return true;
            }
        }

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
        $scope.messageOriginal = message;
        $scope.currentMessage = angular.copy(message);
    };

    $scope.cancelEdit = function () {
        var confirmed = true;

        if ($scope.isChanged()) {
            confirmed = confirm("Any changes you have made will be lost.");
        }

        if (confirmed) {
            $scope.reset();
        }

        return confirmed;
    };

    $scope.update = function () {
        var message = $scope.currentMessage;

        $scope.loading = true;
        $scope.reset();

        // comments is expected to be a list.
        message.comments = message.comments.split('\n');
        var comments = message.comments;

        for (var j = 0; j < comments.length; j++) {
            if (comments[j] === '') {
                message.comments.pop(j);
            }
        }

        Message.save({msgid: message.msgid}, message); //, function (res) {}

        $scope.loading = false;
        $rootScope.flash('Messages saved!', 'success');
    };

    $scope.isChanged = function () {
        return !angular.equals($scope.currentMessage, $scope.messageOriginal);
    };

    $scope.scrollListDown = function () {
        var elem = $('ul.messagesCol');
        var scrollTo = elem.scrollTop() + elem.height();
        elem.animate({scrollTop: scrollTo}, 'fast');

    };

    $scope.reset();
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

// dragomanApp.directive.scroll = function () {
//     return {
//         restrict: 'A',
//         replace: false,
//         transclude: false,
//         link: function(scope, element, attrs) {
//             var target = $(attrs.scroll);
//             var direction = attrs.direction;

//             scope.scrollTo = 0;

//             scope.$watch(scope.scrollTo, function (newVal, oldVal) {
//                 console.log(scope.scrollTo);
//                 target.animate({scrollTop: scope.scrollTo}, 'fast');
//             }, true);

//             $(element).on('click', function () {
//                 switch (direction) {
//                     case 'T':
//                         scope.scrollTo = 0;
//                         break;
//                     case 'B':
//                         // scope.scrollTo = elem.height();
//                         // element.disabled = elem.scrollTop() == elem.height();
//                         break;
//                     case 'U':
//                         scope.scrollTo = target.scrollTop() - target.height();
//                         break;
//                     case 'D':
//                         scope.scrollTo = target.scrollTop() + target.height();
//                         break;
//                 }

//                 console.log(scope.scrollTo);
//                 target.animate({scrollTop: scope.scrollTo}, 'fast');
//             });
//         }
//     };
// };

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
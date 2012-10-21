'use strict';

Dragoman.
    directive('dragomanApplication', function() {
        return {
            restrict: 'C',
            link: function(scope, elem, attrs) {
                // elem.removeClass('waiting-for-angular');

                // var login = elem.find('#login-holder');
                // var main = elem.find('#content');

                // login.hide();

                scope.$on('event:auth-loginRequired', function() {
                        console.log('Login required.');
                    // login.slideDown('slow', function() {
                    //     main.hide();
                    // });
                });
                scope.$on('event:auth-loginConfirmed', function() {
                        console.log('Login confirmed');
                });
            }
        };
    });

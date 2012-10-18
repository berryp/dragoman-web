'use strict';

// Dragoman.
//     // directive('show-modal', function() {

//     //     return {
//     //         link: function (scope, element, attrs) {
//     //             function showModal() {
//     //                 var element = angular.element(element.data('target'));
//     //                 element.modal('show');
//     //             }
//     //             element.bind('click', showModal())
//     //         }
//     //     };
//     // }).
//     directive('fileDrop', function() {
//         return {
//             template: '<span>Drop the PO file here.</span>',
//             replace: false,
//             transclude: true,
//             // controller: 'ImportPofileFormController',
//             link: function (scope, element, attrs) {
//                 $(element).filedrop({
//                     fallback_id: 'uploadButton',
//                     url: '/catalogs/' + scope.catalogId + '/import',
//                     paramname: 'pofile',
//                     // headers: {},
//                     // error: function (error, file) {},
//                     // allowedfiletypes: ['text/plain'],
//                     // maxfiles: 1,
//                     // maxfilesize: 20,
//                     // dragOver: function () {},
//                     // dragLeave: function () {},
//                     // docOver: function () {},
//                     // docLeave: function () {},
//                     // drop: function () {},
//                     uploadStarted: function (i, file, len) {
//                         $('.progress').show();
//                     },
//                     drop: function (e) {
//                         console.log(e);
//                         console.log(this.opts);
//                     },
//                     uploadFinished: function (i, file, response, time) {
//                         $('.progress').attr('style', 'width: 100%;');
//                     },
//                     progressUpdated: function(i, file, progress) {
//                         $('.progress').attr('style', 'width: ' + progress + '%;');
//                     }
//                 });
//             }
//         };
//     });


(function () {
    'use strict';
    angular.module('zenubu.ngStrap.dropdown', [
        'mgcrea.ngStrap.dropdown',
        'ngSanitize'
    ])
        .config(function ($dropdownProvider) {
            angular.extend($dropdownProvider.defaults, {
                html: true,
                placement: 'bottom',
                templateUrl: '/components/angular-strap-patches/src/dropdown/dropdown.tpl.html',
                container: 'body'
            });
        })
        .controller('DropdownCtrl', DropdownCtrl)
        .config(monkeyPatchDropdownDirective)
        .directive('compile', compileDirective);

    function compileDirective($compile) {
        return function (scope, element, attrs) {
            scope.$watch(
                function (scope) {
                    // watch the 'compile' expression for changes
                    return scope.$eval(attrs.compile);
                },
                function (value) {
                    // when the 'compile' expression changes
                    // assign it into the current DOM
                    element.html(value);

                    // compile the new DOM and link it to the current
                    // scope.
                    // NOTE: we only compile .childNodes so that
                    // we don't get into infinite loop compiling ourselves
                    $compile(element.contents())(scope);
                }
            );
        };
    }

	function monkeyPatchDropdownDirective($provide) {
        $provide.decorator('bsDropdownDirective', function ($delegate) {
            var directive = $delegate[0];
            var originalCompile = directive.compile;

            directive.compile = function(tElem, tAttr) {
                var originalLink = originalCompile(tElem, tAttr);

                return function(scope, element, attr, transclusion) {
                    originalLink(scope, element, attr, transclusion);
                    scope.$watchCollection(attr.bsModel, function (newValue) {
                        scope.bsModel = newValue;
                    }, true);
                }
            }

            return $delegate;
        });
    }

    function DropdownCtrl($scope) {

        var vm = this;

        vm.model = $scope.bsModel;

        vm.execute = execute;
        vm.hide = hide;
        vm.show = show;

        function execute(configObject) {
            if (typeof configObject.click === 'function') {
                configObject.click(vm.model, configObject.field);
            }
        }

        function hide(configObject) {
            if (typeof configObject.hide === 'function') {
                return configObject.hide(vm.model, configObject.field);
            }
            if (configObject.hasOwnProperty('hide')) {
                return vm.model[configObject.field] === configObject.hide;
            }
            return false;
        }

        function show(configObject) {
            if (typeof configObject.show === 'function') {
                return configObject.show(vm.model, configObject.field);
            }
            if (configObject.hasOwnProperty('show')) {
                return vm.model[configObject.show] === configObject.show;
            }
            return true;
        }

    }

})();
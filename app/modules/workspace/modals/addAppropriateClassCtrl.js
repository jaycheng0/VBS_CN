(function () {
    'use strict';
    /**
     * SubjectCollectionCtrl
     * Controller for all subjects.
     */

    angular.module('VSB.modals', ['zenubu.ngStrap', 'VSB.subject.service'])
        .controller('addAppropriateClassCtrl', addAppropriateClassCtrl);

    function addAppropriateClassCtrl($scope, property, SubjectService, subject, $modalInstance, translationCacheService, EndPointService) {

console.log('!!!!!!')
console.log(property)
        $scope.property = property;

        $scope.subject = subject;

        $scope.search = {};

        $scope.availableSubjects = [];

        $scope.arrowClass = (property.type === 'OBJECT_PROPERTY') ? 'fa-long-arrow-right' : 'fa-long-arrow-left';

        $scope.selected = null;

        $scope.select = function (subject) {
            if ($scope.selected === subject) {
                $scope.selected = null;
            } else {
                $scope.selected = subject;
            }
        };
        $scope.ok = function () {
            if ($scope.selected !== null) {
                // var newSubject = SubjectService.addSubjectByURI(angular.copy($scope.selected.uri));
                var newSubject = SubjectService.addSubjectByURI(angular.copy($scope.selected));
                property.hasFilter = true;
                property.linkTo = newSubject;
            }
            $modalInstance.dismiss();
        };

        $scope.cancel = $modalInstance.dismiss;

        // translationCacheService.getFromCache('availableClasses').then(function (classes) {
        //     console.log('addAppropriateClassCtrl');
        //     console.log(classes);
        //     $scope.availableSubjects = _(classes)
        //         .filter(function (value) {
        //             // return _.contains(property.$range, value.uri);
        //             return _.contains($scope.property.range, value.uri);
        //         })
        //         .value();
        //         console.log($scope.availableSubjects);
        // });

        EndPointService.getSubAndEqClasses($scope.property.range).then(function (data) {
            var ary = data;
            for (var i = 0; i < data.length; i++) {
                if (data[i].indexOf('IdentifiedObject') > -1) {
                    ary.splice(i, 1);
                    break;
                }
            }
            translationCacheService.getFromCache('availableClasses').then(function (classes) {
                console.log('addAppropriateClassCtrl');
                console.log(classes);
                $scope.availableSubjects = _(classes)
                    .filter(function (value) {
                        // return _.contains(property.$range, value.uri);
                        return _.contains(data, value.uri);
                    })
                    .value();
                    console.log($scope.availableSubjects);
            });
        // $scope.availableSubjects = data;
        })

    }

})();
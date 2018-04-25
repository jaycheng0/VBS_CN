(function () {
    'use strict';
    angular.module('VSB.property.model', [
        'VSB.endPointService',
        'VSB.connectionService',
        'pascalprecht.translate'
        ])
        .factory('Property', PropertyConstructor);

    function PropertyConstructor(EndPointService, $log, $translate, $q, connectionService, $rootScope) {
        return function (data) {

            console.log("@@@@@@@@")
            console.log(data)
            var property = {
                uri: null,
                type: null,
                filterExists: true,
                hasFilter: false,
                compareRaw: {},
                linkTo: null,
                view: true,
                optional: false,
                arithmetic: null,
                compare: null,
                $subject: {},
                range: data.$range[0] ? data.$range[0] : '',
            };
            _.extend(property, data);
            property.$id = connectionService.generateID();
            connectionService.addPropertyToSubject(property.$subject.$id, property.$id);

            var getSubClassesOfRange = function (range) {
                console.log('getSubClassesOfRange')
                console.log(range);
                if (!_.isEmpty(range)) {
                    var originalPropertyRange = angular.copy(range);
                    var promises = [];
                    originalPropertyRange.forEach(function (rangeItem) {
                        // promises.push(EndPointService.getSubAndEqClasses(rangeItem));
                        EndPointService.getSubAndEqClasses(rangeItem).then(function (data) {
                            console.log('promises')
                            promises.push(data);
                        })
                    });
                    return $q.all(promises).then(function ($range) {
                        $range = _.uniq(_.flatten($range));
                        property.$range = $range;
                    }).then(function () {
                        if (!property.typeCasted && property.type !== 'INVERSE_PROPERTY' && property.type !== 'AGGREGATE_PROPERTY') {
                            property.type = EndPointService.getPropertyType(property);
                        }
                    });
                }
            };

            if (property.$copied) {

                                // console.log(data);
                if (!_.startsWith(property.uri, '$$')) {
                    EndPointService.getPropertyDetails(property.$subject.uri, property)
                        .then(function (data) {
                            data = data[0];
                            console.log('ssssssssss')
                            console.log(data)
                            if (!_.isEmpty(data)) {
                                console.log('####');
                                console.log(data);
                                property.$range = data.$range;
                                if (!property.typeCasted) {
                                    property.type = data.type;
                                }
                                return data.$range;
                            }
                            return null;
                        })
                        .then(getSubClassesOfRange)
                        .catch(function (error) {
                            $log.error(error);
                        });
                }
            } else {
                console.log('####');
                console.log(property)
                getSubClassesOfRange(property.$range);
            }

            var currentLanguage = null;

            $rootScope.$on('$translateChangeSuccess', function (event, data) {

                if (!property.$label || currentLanguage !== data.language) {
                    var $comment = property.uri + '.$comment';
                    var $label = property.uri + '.$label';

                    $translate([$comment, $label]).then(function (translated) {
                        if ($label !== translated[$label]) {
                            currentLanguage = data.language;
                            property.$label = translated[$label];

                            property.$comment = ($comment !== translated[$comment]) ? translated[$comment] : false;


                        }
                    });
                }

            });


            return property;

        };
    }

})();
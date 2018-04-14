(function () {
    'use strict';
    angular.module('VSB.package.service', [
        'VSB.endPointService',
        'VSB.language',
        'VSB.arrowService'
    ])
        .factory('PackageService', PackageService)
    ;

    function PackageService($log, helperFunctions, EndPointService, $q, translationCacheService, MessageService) {

        var factory = {};
        factory.getAvailablePackages = getAvailablePackages;

        function getAvailablePackages(filter, limit) {
            return translationCacheService.getFromCache('availablePackages').then(function (classes) {
                return helperFunctions.filterByTokenStringWithLimit(classes, filter, limit);
            });
        }

        factory.loading = EndPointService.getAvailablePackages()
            .catch(function (err) {
                $log.error('An error occurred while loading available Packages: ', err);
                var message = '<span> An error occured while loading available packages <br>' + _.escape(err) + '</span>';
                MessageService.addMessage({message: message, icon: 'times-circle-o', 'class': 'danger'});
            })
            .then(function (classes) {
                $log.debug('Packages loaded ', classes);
                if (classes.length === 0) {
                    var message = '<span>Your endpoint returned zero classes</span>';
                    MessageService.addMessage({message: message, icon: 'times-circle-o', 'class': 'danger'});
                }
                return translationCacheService.putInCache('availablePackages', 'package', classes);
            }).then(function () {
                factory.loading = false;
            });
        

        return factory;

    }

})();
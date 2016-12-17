angular.module('orsApp.ors-panel-accessibilityanalysis', ['orsApp.ors-aa-controls', 'orsApp.ors-aa-waypoints', 'orsApp.ors-aa-sliders']).component('orsAnalysis', {
    templateUrl: 'app/components/ors-panel-accessibilityanalysis/ors-panel-accessibilityanalysis.html',
    controller($scope, $location, orsSettingsFactory, orsObjectsFactory, orsUtilsService, orsRequestService, orsErrorhandlerService, orsParamsService, orsCookiesFactory, orsMapFactory) {
        var ctrl = this;
        let currentUrl;
        ctrl.$routerCanReuse = function(next, prev) {
            return next.urlPath === prev.urlPath;
        };
        ctrl.$onInit = function() {
            ctrl.profiles = lists.profiles;
        };
        ctrl.$routerOnActivate = function(next) {
            orsSettingsFactory.isInitialized = true;
            /** notify the settings that we're now in the aa panel */
            orsSettingsFactory.updateNgRoute(next.urlPath);
            /** 
             * check if anything is saved in the settings object
             * if there isn't initialize settings object from permalink or provide empty
             */
            if (orsSettingsFactory.getWaypoints().length == 0) {
                ctrl.routeParams = next.params;
                orsSettingsFactory.initWaypoints(1);
                const importedParams = orsParamsService.importSettings(ctrl.routeParams, false);
                orsSettingsFactory.setSettings(importedParams.settings);
                // fetch addresses afterwards
                angular.forEach(importedParams.settings.waypoints, function(wp, idx) {
                    orsSettingsFactory.getAddress(wp._latlng, idx, true);
                });
                /**
                 * First get the Cookie Settings (These are currently language, routinglanguage and units). Then get the permalink user settings (Can be routinglanguage and units)
                 * The permalink settings replace the cookie settings if they exist.
                 */
                orsSettingsFactory.setUserOptions(orsCookiesFactory.getCookies());
                orsSettingsFactory.setUserOptions(importedParams.user_options);
            }
            orsSettingsFactory.updateWaypoints();
            ctrl.currentOptions = orsSettingsFactory.getActiveOptions();
            ctrl.activeProfile = orsSettingsFactory.getActiveProfile().type;
            ctrl.activeSubgroup = ctrl.profiles[ctrl.activeProfile].subgroup;
        };
        ctrl.$routerOnReuse = function(next, prev) {
            // Update Permalink 
            const settings = orsSettingsFactory.getSettings();
            const userSettings = orsSettingsFactory.getUserOptions();
            orsUtilsService.parseSettingsToPermalink(settings, userSettings);
        };
    },
    require: {
        parent: '^orsSidebar'
    }
});
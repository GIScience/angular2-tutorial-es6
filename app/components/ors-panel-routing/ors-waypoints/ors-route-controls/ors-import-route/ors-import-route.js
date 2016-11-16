angular.module('orsApp.ors-importRoute-controls', []).component('orsImportRouteControls', {
    templateUrl: '/app/components/ors-panel-routing/ors-waypoints/ors-route-controls/ors-import-route/import_route_tpl.html',
    controller($scope, orsImportFactory, orsObjectsFactory, orsMapFactory) {
        let ctrl = this;
        console.log("here")
        ctrl.showCSVopt = false;
        ctrl.showXY = false;
        ctrl.showXYZ = false;
        ctrl.showWKT = false;
        ctrl.isCsv = false;
        ctrl.loadedPreviewLayers = [];
        ctrl.fileNameChanged = function(fileName) {
            console.log(fileName)
            var uploadedFiles = [];
            var fileArrayLength = fileName.files.length;
            // Initialize the global variable preocessedCount. This variable will be responsible to iterate and keep track of the current iteration during the on load event
            var processedCount = 0;
            //This will loop through all the opened files
            for (var i = 0; i < fileArrayLength; i++) {
                var current_fileObject = fileName.files[i]
                var reader = new FileReader();
                //On load event call.  This event is assýnc
                reader.onload = (function(theFile) {
                    return function() {
                        onLoadHandler(this, theFile, processedCount, uploadedFiles); //this will happen during the onload event
                        onLoadEndHandler(); // this happens at the end of the onload event.
                    };
                })(current_fileObject);
                reader.readAsText(current_fileObject)
            };
            var onLoadHandler = function(e, theFile, processedCount, uploadedFiles) {
                uploadedFiles[processedCount] = {
                    name: theFile.name,
                    extension: (theFile.name).slice(((theFile.name).lastIndexOf(".") - 1 >>> 0) + 2),
                    index: processedCount,
                    content: e.result,
                    preview:true
                }
            };
            var onLoadEndHandler = function() {
                processedCount++;
                if (processedCount == fileArrayLength) {
                    //this code will run after everything has been loaded and processed
                    ctrl.uploadedFiles = uploadedFiles;
                    $scope.$apply();
                }
            };
        };
        ctrl.previewRoute = function(boolean, file) {
            if (boolean) {
                //console.log(file)
                const geometry = orsImportFactory.importFile(file.extension, file.content);
                //console.log(geometry.geometry.coordinates)
                // create map action add geom to layer tracks
                let action = orsObjectsFactory.createMapAction(1, lists.layers[4], geometry.geometry.coordinates, file.index);
                orsMapFactory.mapServiceSubject.onNext(action)
            } else {
                let action = orsObjectsFactory.createMapAction(2, lists.layers[4], undefined, file.index);
                //ctrl.previewRoutes.removeLayer(ctrl.theId)
                orsMapFactory.mapServiceSubject.onNext(action)
            }
        }
        ctrl.importRoute = function() {
            //remove all existing layers before import. There must only be one layer in this group
            ctrl.importedRoutes.eachLayer(function(layer) {
                ctrl.importedRoutes.removeLayer(layer)
            });
            //add the clicked layer
            ctrl.theRoute = orsImportFactory.importFile(ctrl.uploadedFiles.extension, ctrl.uploadedFiles.content);
            ctrl.importedRoutes.addLayer(ctrl.theRoute);
            ctrl.map.fitBounds(ctrl.theRoute.getBounds());
        }
    },
    bindings: {
        importedRoutes: '<',
        previewRoutes: '<'
    }
});
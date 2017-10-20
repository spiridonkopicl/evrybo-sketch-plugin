function Exporter() {}

Exporter.prototype.export = function (context) {
    
};

function ExporterAll() {}
ExporterAll.prototype = Object.create(Exporter.prototype)

ExporterAll.prototype.constructor = ExporterAll

ExporterAll.prototype.export = function (context) {
    log('[INFO][evrybo] export all artboards - exporter');
    var document = context.document,
        page = [document currentPage],
        artboards = [page artboards];
    return artboards;
};

function ExporterSelected() {}

ExporterSelected.prototype = Object.create(Exporter.prototype)

ExporterSelected.prototype.constructor = ExporterSelected

ExporterSelected.prototype.export = function (context) {
    log('[INFO][evrybo] export selected artboards - exporter')
    var document = context.document,
        page = [document currentPage],
        artboards = [page artboards];
    var selectedArtboards = [[NSMutableArray alloc] init];
    var loop = [artboards objectEnumerator];
    while(artboard = [loop nextObject]) {
        if([artboard isSelected]) {
            selectedArtboards.addObject(artboard);
        }
    }
    return selectedArtboards;
};
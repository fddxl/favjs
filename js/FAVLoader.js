/**
 * @author Takumi Moriya
 * @version 0.0.1
 */


THREE.FAVLoader = function (manager) {

	this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;

};

THREE.FAVLoader.prototype = {

	constructor: THREE.FAVLoader,

	load: function (url, onLoad, onProgress, onError) {

		var scope = this;

		var loader = new THREE.FileLoader(scope.manager);
		loader.setPath(scope.path);
		loader.setResponseType('arraybuffer');
		loader.load(url, function (text) {
			try {
				onLoad(scope.parse(text));
			} catch (exception) {
				if (onError) {
					onError(exception);
				}
			}
		}, onProgress, onError);

	},

	setPath: function (value) {

		this.path = value;
		return this;

	},

	parse: function (data) {

    function ensureString(buffer) {
			if (typeof buffer !== 'string') {
				return THREE.LoaderUtils.decodeText(new Uint8Array(buffer));
			}
			return buffer;
		}

    function parseDimension(dimensionElement) {
      const x = parseInt(dimensionElement.querySelector('x').innerHTML);
      const y = parseInt(dimensionElement.querySelector('y').innerHTML);
      const z = parseInt(dimensionElement.querySelector('z').innerHTML);
      return {'x': x, 'y': y, 'z': z};
    }

    function parseVoxelMap(voxelMapElement, dimension) {
      const layerElements = voxelMapElement.querySelectorAll('layer');

      const bitPerVoxel = parseInt(voxelMapElement.getAttribute('bit_per_voxel'));
      const voxelLength = bitPerVoxel / 4;

      var voxelMap = [];
      const regexp = new RegExp('.{' + voxelLength + '}', 'g');

      for (var z = 0; z < layerElements.length; z++) {
        const matched = layerElements[z].innerHTML.match(/<!\[CDATA\[(.+)\]\]>/);
        const cdataContent = matched[1];
        const voxelValues = cdataContent.match(regexp);

        for (var i = 0; i < voxelValues.length; i++) {
          const x = Math.floor(i / dimension.x);
          const y = i % dimension.x;
          const v = parseInt(voxelValues[i], 16);

          if (v >= 1) {
            voxelMap.push([x, y, z]);
          }
        }
      }

      return voxelMap;
    }

    function parse(data) {
      const parser = new DOMParser();
      const dom = parser.parseFromString(data, 'text/xml');
      const objectElements = dom.querySelectorAll('object');

      var volumeList = [];

      for (var el of objectElements) {
        const gridElement = el.querySelector('grid');
        const dimensionElement = gridElement.querySelector('dimension');
        const dimension = parseDimension(dimensionElement);

        const structureElement = el.querySelector('structure');
        const voxelMapElement = structureElement.querySelector('voxel_map');
        const voxelMap = parseVoxelMap(voxelMapElement, dimension);

        const volume = {
          'dimension': dimension,
          'data': voxelMap
        };
        volumeList.push(volume);
      }

      return volumeList;
    }

    return parse(ensureString(data));
	}

};

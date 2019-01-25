/**
 * @author Takumi Moriya
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

    function parseVoxelMap(voxelMapElement) {
      const layerElements = voxelMapElement.querySelectorAll('layer');

      const bitPerVoxel = parseInt(voxelMapElement.getAttribute('bit_per_voxel'));
      const voxelLength = bitPerVoxel / 4;

      for (var el of layerElements) {
        const matched = el.innerHTML.match(/<!\[CDATA\[(.+)\]\]>/);
        const value = matched[1];
        const voxels = value.match(/.{2}/g);

        for (var i = 0; i < voxels.length; i++) {
          const v = parseInt(voxels[i], 16);
          if (v >= 1) {
          }
        }
      }
    }

    function parse(data) {
      const parser = new DOMParser();
      const dom = parser.parseFromString(data, 'text/xml');
      const objectElements = dom.querySelectorAll('object');

      for (var el of objectElements) {
        const structureElement = el.querySelector('structure');
        const voxelMapElement = structureElement.querySelector('voxel_map');
        parseVoxelMap(voxelMapElement);
      }
    }

    return parse(ensureString(data));
	}

};

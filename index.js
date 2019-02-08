'use strict';

require('./main.scss');
require('./src/d3-fr');
require('./src/interactive-chart/interactive-chart');
require('./src/medias-section');

import MicroModal from 'micromodal';
MicroModal.init({ awaitCloseAnimation: true, disableScroll: false });

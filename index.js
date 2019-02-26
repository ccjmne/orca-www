'use strict';

require('./main.scss');
require('./src/menu');
require('webfontloader').load({ google: { families: ['Raleway:300', 'Montserrat:300'] } });
require('./src/main-heading/main-heading');

import { Router } from './src/spa/routing';
import { reveal } from './src/reveal';
reveal(document);
new Router('.pages-container').onLoad(reveal);

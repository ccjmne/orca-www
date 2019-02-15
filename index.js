'use strict';

require('./main.scss');
require('./src/modals/modals');
require('webfontloader').load({ google: { families: ['Raleway:300', 'Montserrat:300'] } });

import { Router } from './src/spa/routing';
import { reveal } from './src/reveal';
reveal(document);
new Router('.pages-container').onLoad(reveal);

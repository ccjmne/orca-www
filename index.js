'use strict';

require('orca-logo');
require('./main.scss');
require('./src/menu');
require('webfontloader').load({ google: { families: ['Raleway:300', 'Montserrat:300'] } });
require('./src/main-heading/main-heading');

import { api as modals } from './src/modals/modals';
import { Router } from './src/spa/routing';
import { reveal } from './src/reveal';
reveal(document);
modals.hookUp(document);
new Router('.pages-container').onLoad((root, onLoadOpts) => (reveal(root, onLoadOpts), modals.hookUp(root)));

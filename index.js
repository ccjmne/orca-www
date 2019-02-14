'use strict';

require('./main.scss');
require('./src/modals/modals');

import { Router } from './src/spa/routing';
import { reveal } from './src/reveal';
reveal(document);
new Router('.pages-container').onLoad(reveal);

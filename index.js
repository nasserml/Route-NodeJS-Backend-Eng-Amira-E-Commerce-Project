import express from 'express';
import {config} from 'dotenv';

import {intiateApp} from './src/initiate-app.js';

// Load enviroment variables from dev.config.env
config({ path: './config/dev.config.env'});

// Initialize instance of the express app
const app = express();

// Initialize and start the app
intiateApp(app, express);
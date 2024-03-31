import { gracefulShutdown } from 'node-schedule';
import { Server } from 'socket.io';
import cors from 'cors';
import db_connection from '../DB/connection.js';
import {globalResponse} from './middlewares/globalResponse.middleware.js';
import {rollbackSavedDocuments} from './middlewares/rollback-saved-documents.middleware.js';
import { rollbackUploadedFiles} from './middlewares/rollback-uploaded-files.middleware.js';
import productSocketIOTestModel from '../DB/models/product-socketIO-test.model.js';
import productModel from '../DB/models/product.model.js';

import * as routers from './modules/index.routes.js';
import { scheduleCronsForCouponCheck } from './utils/crons.js';
import { generateIO } from './utils/io-generation.js';

/**
 * Initialize the E-commerce project.
 * 
 * @param {import('express')()} app - The express app instance.
 * @param {import('express')} express - The Express module.
 */
export const intiateApp = (app, express) => {

    // Get the port from enviromnent variables.
    const port = process.env.PORT

    // Parse request as JSOM
    app.use(express.json());

    // Connect to the database
    db_connection();

    // Set cors to allow access from origins
    app.use(cors());

    // Set up authentication routes
    app.use('/auth', routers.authRouter);

    // Set up category routes
    app.use('/category', routers.categoryRouter);

    // Set up subCategory routes
    app.use('/subCategory', routers.subCategoryRouter);

    // Set up brand routes
    app.use('/brand', routers.brandRouter);

    // Set up product routes
    app.use('/product', routers.productRouter);

    // Set up user routes
    app.use('/user', routers.userRouter);

    // Set up cart routes
    app.use('/cart', routers.cartRouter);

    // Set up coupon routes
    app.use('/coupon', routers.couponRouter );

    // Set up order routes
    app.use('/order',routers.orderRouter);

    app.use('*',(req,res,next)=>{res.status(404).json({message:'Not Found'})})

    //  Apply global response middleware and rollback saved documents middleware and rollback uploaded files middleware
    app.use(globalResponse, rollbackSavedDocuments, rollbackUploadedFiles);

    // Schedule crons to check the expiration of the coupons
    scheduleCronsForCouponCheck();
    gracefulShutdown();

    // Set up a hello world route
    app.get('/', (req, res, next) => res.send('Hello world!'));
    
    // Start the app listening on the specified port
   const server=app.listen(port, ()=> console.log(`E-commerce app listening on port ${port}`));

   // Generate socket IO from the server
   const io=generateIO(server);

   // Start listening to socket IO from the server on the connection
   io.on('connection',(socket)=>{
    
    // Console log when a client is connected to the server with its id
    console.log('a client connected', {id:socket.id});
    
   });
}
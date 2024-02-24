import db_connection from '../DB/connection.js';
import {globalResponse} from './middlewares/globalResponse.middleware.js';
import {rollbackSavedDocuments} from './middlewares/rollback-saved-documents.middleware.js';
import { rollbackUploadedFiles} from './middlewares/rollback-uploaded-files.middleware.js';

import * as routes from './modules/index.routes.js';

export const intiateApp = (app, express) => {
    const port = process.env.PORT

    app.use(express.json());

    db_connection();

    app.use('/auth', routes.authRouter);

    app.use(globalResponse, rollbackSavedDocuments, rollbackUploadedFiles);

    app.get('/', (req, res, next) => res.send('Hello world!'));
    app.listen(port, ()=> console.log(`E-commerce app listening on port ${port}`));
}
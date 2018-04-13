const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/data').then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
        console.log('Mongo conected');
    },
    err => { /** handle initial connection error */
        console.error(err);
    }
);
const app = require('../index');
const syncDB = require('./sync-db');

syncDB().then(() => {
    console.log('sync database!');
    
    app.listen(3000, () => {
        console.log('server is running on 3000 port!')
    });
});

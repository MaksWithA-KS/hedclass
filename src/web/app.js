const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('HEdClass is successfully running');
});

app.listen(PORT, () => {
    console.log(`Application started. Listening on port ${PORT}`);
});
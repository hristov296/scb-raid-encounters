require('dotenv').config({ path: './config/.env' });

const express = require('express');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const upload = require('./routes/api/upload');
const test = require('./routes/api/test');
const { readCell, readBatch, updateCell } = require('./routes/api/gSheets');

mongoose
  .connect(
    `mongodb://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    { useNewUrlParser: true, useUnifiedTopology: true },
  )
  .then(() => console.log('MongoDB successfully connected'))
  .catch((err) => console.log(err));

const app = express();
const port = process.env.PORT;

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
    // useTempFiles: true,
    tempFileDir: '/tmp/',
    abortOnLimit: true,
    limits: { fileSize: 50 * 1024 * 1024 },
  }),
);

// add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.post('/upload', upload);
app.post('/test', test);
app.get('/test', test);
app.get('/readCell', readCell);
app.get('/readBatch', readBatch);
app.post('/updateCell', updateCell);

app.use((error, req, res, next) => res.status(error.status).send(error.message));

app.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});

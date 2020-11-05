const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const DB_URI = process.env.DB_URI.replace(
  '<PWD>',
  process.env.DB_PWD
);

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((_) => {
    console.log('DB connected successully');
  })
  .catch((err) => console.log(err));
const app = require('./app');
const port =
  parseInt(process.env.PORT, 10) || 3000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

process.on(
  'unhandledRejection',
  (reason, promise) => {
    console.log(
      'UNHANDLED REJECTION! 💥 Shutting down...'
    );
    console.log(
      `AT:${promise}\nREASON:${reason}`
    );

    server.close(() => process.exit(1));
  }
);

process.on('uncaughtException', (err, origin) => {
  console.log(
    'UNCAUGHT EXCEPTION!💥 Shutting down...'
  );
  console.log(
    `CAUGHT EXCEPTION: ${err.stack}\nEXCEPTION ORIGIN: ${origin}`
  );

  server.close(() => process.exit(1));
});

const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');

const userRouter = require('./routes/userRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const productRouter = require('./routes/productRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderRouter = require('./routes/orderRoutes');
const orderItemRouter = require('./routes/orderItemRoutes');
const cartRouter = require('./routes/cartRoutes');
const cartItemRouter = require('./routes/cartItemRoutes');
const globalErrorHandler = require('./controllers/errorController');

const {
  webhookCheckout,
} = require('./controllers/orderController');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.options('*', cors());

app.use(compression());

// Setting security HTTP Headers
app.use(helmet());
app.use(
  helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Implementing Rate Limiting
const apiLimiter = rateLimit({
  max: 1000,
  windowMs: 10 * 60 * 1000,
  message:
    'Too many requests sent from this IP, please try again after an hour!',
});
app.use('/api', apiLimiter);
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  webhookCheckout
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter polution
app.use(
  hpp({
    whitelist: [
      'word',
      'wordClass',
      'createdAt',
      'updatedAt',
      'guideWord',
    ],
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/users', userRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/orderItems', orderItemRouter);
app.use('/api/v1/carts', cartRouter);
app.use('/api/v1/cartItems', cartItemRouter);

app.use('/', viewRouter);

app.all('*', (req, res, next) => {
  return next(
    new AppError(
      `Can't find ${req.originalUrl} on this server!`,
      404
    )
  );
});

app.use(globalErrorHandler);
module.exports = app;

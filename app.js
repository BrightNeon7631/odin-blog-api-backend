const express = require('express');
require('dotenv').config();
const userRouter = require('./routes/userRouter');
const postRouter = require('./routes/postRouter');
const commentRouter = require('./routes/commentRouter');
const passport = require('passport');
const cors = require('cors');
// strategy in config/passport.js needs the passport object
require('./config/passport')(passport);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/user', userRouter);
app.use('/api/post', postRouter);
app.use('/api/comment', commentRouter);

app.use('*', (req, res) => {
  res.send({ error: '404 - resource not found' });
});

// Error handling
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).send({ error: err.message });
});

const PORT = process.env.SERVER_PORT;
app.listen(PORT, () => console.log(`server running on port: ${PORT}`));

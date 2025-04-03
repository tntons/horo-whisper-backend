const express = require('express');
const app = express();

app.use(express.json());

const userRoutes = require('./routes/userRoutes');
const tellerRoutes = require('./routes/tellerRoutes');
app.use('/users', userRoutes);
app.use('/tellers',tellerRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

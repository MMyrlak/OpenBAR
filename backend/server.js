import express from 'express';
import cors from 'cors';
import drinkRoutes from './routes/drink.js';
import orderRoutes from './routes/order.js';
import userRoutes from './routes/user.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const corsOption = {
  origin: ['http://localhost:5173']
};

app.use(cors(corsOption));
app.use(express.json());

app.use('/drink', drinkRoutes);
app.use('/order', orderRoutes);
app.use('/user', userRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Nasłuchiwanie na ${process.env.PORT} ...`);
});


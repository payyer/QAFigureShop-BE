import express from 'express';
import connectDB from './config/database.js'; // Lưu ý dùng .js thay vì .ts ở đây
import checkoutRoutes from './routes/checkout.route.js';
import { errorHandler } from './middleware/error.middleware.js';
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});
app.use('/api', checkoutRoutes);
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

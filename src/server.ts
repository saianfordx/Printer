import express from 'express';
import printRoutes from './routes/printRoutes';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', printRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Printer API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/database.js";

const PORT = process.env.PORT || 5000;

// Connect Database rồi mới start Server
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

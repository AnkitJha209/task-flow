import express from "express";
import router from "./routes/auth.route.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/", router);

app.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});

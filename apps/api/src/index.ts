import express from "express";

const app = express();

app.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});

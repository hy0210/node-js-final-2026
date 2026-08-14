import express from "express";
import createError from "http-errors";

import apiRouter from "./routes/index.js";

const app = express();

// app.use("/api", apiRouter);
app.use("/", apiRouter);

export default app;

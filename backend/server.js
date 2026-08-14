import app from "./app.js";

const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
  console.log(`📘 Swagger UI: http://localhost:8081`);
  console.log("");
});

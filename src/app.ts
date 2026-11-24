import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { generateEmbeddings } from "./services/embedding.service.js";

const app: Application = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/health", (_res: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timeStamp: new Date().toISOString(),
  });
});

app.use("/rag/embeddings", generateEmbeddings);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server Error : ", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "An unexpected error occurred.",
  });
});

export default app;

import app from "./app";
import { env } from "./config/env";

// Render provides PORT automatically; env.ts reads process.env.PORT.
app.listen(env.PORT, () => {
  console.log(`EduCompiler API running on port ${env.PORT} (${env.NODE_ENV})`);
});

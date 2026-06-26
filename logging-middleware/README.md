## Logging Middleware

Reusable logging package for the evaluation service.

### Usage

```typescript
import { Log } from "logging-middleware";

await Log("backend", "info", "middleware", "application started");
```

### Environment variables

Set in project root `.env`:

- EVAL_EMAIL
- EVAL_NAME
- EVAL_ROLL_NO
- EVAL_ACCESS_CODE
- EVAL_CLIENT_ID
- EVAL_CLIENT_SECRET
- EVAL_BASE_URL

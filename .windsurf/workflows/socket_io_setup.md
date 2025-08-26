---
description: Socket.IO server setup and integration
auto_execution_mode: 3
---

# Socket.IO Setup

Add a Socket.IO server to your project and expose real-time events.

## Slash usage
- Invoke: `/socket_io_setup`
- Example: `/socket_io_setup port=3001 path=/socket.io corsOrigin=http://localhost:3000`

## Parameters
- port (optional): default `3001`
- path (optional): default `/socket.io`
- corsOrigin (optional): allowed origin for CORS

## Steps
1) Install (choose one)
- npm: `npm i socket.io`
- bun: `bun add socket.io`

2) Initialize server (official pattern)
```ts
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  path: process.env.SIO_PATH || "/socket.io",
  cors: process.env.SIO_ORIGIN ? { origin: process.env.SIO_ORIGIN } : undefined,
});

io.on("connection", (socket) => {
  // handle events
  socket.on("ping", () => socket.emit("pong"));
});

httpServer.listen(process.env.SIO_PORT ? Number(process.env.SIO_PORT) : 3001);
```

3) Env
```
SIO_PORT=3001
SIO_PATH=/socket.io
SIO_ORIGIN=http://localhost:3000
```

// turbo
4) Quick verify
```bash
bun run check && bun run build
```

5) Client snippet
```ts
import { io } from "socket.io-client";
const socket = io("http://localhost:3001", { path: "/socket.io" });
socket.on("connect", () => console.log("connected", socket.id));
socket.emit("ping");
socket.on("pong", () => console.log("pong"));
```

## Quality gates
- Environment variables `SIO_PORT`, `SIO_PATH`, and `SIO_ORIGIN` set appropriately
- Build succeeds (`bun run check && bun run build`)
- Client ping/pong verified locally

## Troubleshooting
- CORS errors → set `SIO_ORIGIN` to your frontend origin
- Port conflict → change `SIO_PORT` or free the port
- Namespace/path mismatch → ensure client `path` matches server

## References
- Socket.IO server init (official): https://socket.io/docs/v4/server-initialization/
- Overview: https://socket.io/docs/v4/

### Core internal references
- `../rules/elizaos_development_workflow.md`
- `../rules/elizaos_coding_standards.md`
- `../rules/elizaos-architecture-patterns.md`
- `../rules/testing_standards.md`
- `../rules/elizaos_security_protocols.md`
- `../rules/elizaos_template-quick-reference.md`
- `../rules/elizaos_template_system.md`
- `../rules/elizaos_interface_system.md`
- `../rules/elizaos_memory_operational_rules.md`
- `../rules/elizaos_memory_quick_reference.md`
- `../knowledge/README.md`

# AIVA Port Mapping

This document defines the standardized port and domain mappings for all services in the AIVA project.

| Service | Purpose | Host URL | Docker/container URL |
|---|---|---|---|
| Dify (current) | AI Orchestration platform | http://localhost | http://host.docker.internal |
| Dify API | API endpoint | http://localhost/v1 | http://host.docker.internal/v1 |
| 9router raw | Endpoint gốc của 9router | http://localhost:20128/v1 | http://host.docker.internal:20128/v1 |
| Dify 9router proxy | Proxy shim cho Dify/AIVA | http://localhost:20129/v1 | http://host.docker.internal:20129/v1 |
| Knowledge API | External Knowledge API | http://localhost:8000 | http://knowledge-api:8000 |
| Weaviate | Vector DB | http://localhost:8080 | http://weaviate:8080 |
| Plugin Daemon | Dify plugin management | (internal only) | http://plugin_daemon:5002 |
| Sandbox | Code execution | (internal only) | http://sandbox:8194 |
| SSRF Proxy | Security proxy | (internal only) | http://ssrf_proxy:3128 |

## Rules
1. **Host calls service on host**: Use `localhost`.
2. **Docker container calls service on host**: Use `host.docker.internal`.
3. **Docker containers calling each other**: Use `service name` (defined in `docker-compose.yml`).

## Notes
- Legacy Dify (port 8081) has been **removed**. All Dify traffic uses port 80.
- `chiasegpu.vn` and `api.dify.ai` are **not hardcoded** in any app code.
- LLM routing goes through proxy at port 20129; only the proxy calls 9router raw at 20128.

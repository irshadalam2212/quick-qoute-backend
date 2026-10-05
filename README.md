# quick-qoute-backend
backend for quickquote app

Set `REDIS_URL` (for example, `redis://localhost:6379`) in the backend environment
to enable shared login rate limiting. Login allows 10 attempts per client IP in
a 15-minute window. The login endpoint fails closed with `503` if Redis is not
configured or unavailable; use a trusted Redis service and keep its URL secret.

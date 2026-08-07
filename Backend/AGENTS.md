# Backend Instructions for Codex

## Backend Architecture

The backend must follow a microservices-based architecture.

Do not build all backend features inside one large file or one tightly coupled service.

Preferred backend services may include:
- auth-service
- user-service
- ml-service
- api-gateway
- notification-service if needed

Each service must have one clear responsibility.

## Backend Stack

Use the backend stack selected for the project.

Preferred backend technologies:
- Node.js
- Express.js or Fastify
- TypeScript if possible
- REST APIs
- Docker
- PostgreSQL or MongoDB depending on the project requirement

## Professional Backend Method

Use clean layered architecture.

Preferred structure for each backend service:

src/
├── config/
├── controllers/
├── routes/
├── services/
├── repositories/
├── middleware/
├── validators/
├── utils/
├── types/
└── app.ts

## Layer Responsibility Rules

### Routes
- Define API endpoints only.
- Do not write business logic inside routes.

### Controllers
- Handle request and response.
- Call services.
- Do not directly access the database.

### Services
- Handle business logic.
- Handle external API calls.
- Handle ML/DL model integration logic.
- Keep services clean and reusable.

### Repositories
- Handle database queries only.
- Do not write HTTP request logic here.

### Middleware
- Handle authentication.
- Handle authorization.
- Handle error handling.
- Handle request logging if needed.

### Validators
- Validate request body, params, and query data.
- Do not allow invalid data to reach the service layer.

## Authentication Rules

Build a secure modern authentication system.

Use:
- Access tokens
- Refresh tokens
- Password hashing
- Secure cookie strategy where appropriate
- Authentication middleware
- Authorization middleware
- Role-based access control if needed

Security rules:
- Hash passwords using bcrypt or argon2.
- Never store plain-text passwords.
- Never expose refresh tokens in API responses unnecessarily.
- Use short expiry time for access tokens.
- Use longer but controlled expiry time for refresh tokens.
- Store refresh tokens securely.
- Add logout functionality.
- Add refresh-token rotation if possible.
- Validate all authentication inputs.

## Recommended Auth Method

Use this authentication strategy unless the user says otherwise:

- Access token: short-lived JWT
- Refresh token: long-lived token stored in HTTP-only secure cookie
- Password hashing: bcrypt or argon2
- Protected routes: middleware-based verification
- Authorization: role-based middleware

## ML/DL Integration Rules

Machine Learning and Deep Learning models are hosted on Hugging Face.

Backend must call Hugging Face APIs.

Rules:
- Store Hugging Face API keys in `.env`.
- Do not expose Hugging Face API keys to frontend.
- Keep Hugging Face API calls inside `ml-service` or service layer.
- Add timeout handling.
- Add proper error responses if the model API fails.
- Validate files or inputs before sending to the model.
- Return clean response data to the frontend.
- Do not return unnecessary raw model response unless required.

## API Rules

- Use RESTful API structure.
- Use proper HTTP status codes.
- Use consistent response format.
- Use centralized error handling.
- Validate all incoming requests.
- Do not expose internal error stack traces in production.

Preferred response format:

{
  "success": true,
  "message": "Request completed successfully",
  "data": {}
}

Preferred error format:

{
  "success": false,
  "message": "Something went wrong",
  "error": "Readable error message"
}

## Environment Variables

Use `.env` files for configuration.

Required example variables may include:

PORT=
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ACCESS_TOKEN_EXPIRES_IN=
REFRESH_TOKEN_EXPIRES_IN=
HUGGINGFACE_API_KEY=
HUGGINGFACE_MODEL_URL=
FRONTEND_URL=

Do not commit real `.env` files.

Always provide `.env.example`.

## Docker Rules

Each backend service should have a Dockerfile if it runs separately.

Use docker-compose for local development.

Rules:
- Do not hardcode container URLs.
- Use service names inside docker-compose networking.
- Keep Dockerfiles clean.
- Avoid installing unnecessary packages.
- Use production-safe Docker practices when possible.

## File Size Rule

No backend file should exceed 200 lines.

If a file exceeds 200 lines:
- Move business logic to services.
- Move database logic to repositories.
- Move validation logic to validators.
- Move reusable logic to utils.
- Split routes by feature.

## Backend Security Rules

- Validate all request inputs.
- Sanitize user inputs where needed.
- Use CORS properly.
- Use Helmet or equivalent security middleware if using Express.
- Rate limit authentication endpoints.
- Do not log sensitive data.
- Do not expose API keys.
- Do not expose database errors directly to users.

## Backend Completion Checklist

Before finishing backend work:
- Check that no file exceeds 200 lines.
- Check authentication security.
- Check request validation.
- Check error handling.
- Check environment variables.
- Check Docker compatibility.
- Check that frontend does not directly call Hugging Face.
- Explain what files were changed and why.
# Project-Wide Instructions for Codex

## Project Architecture

This project must follow a microservices-based architecture.

The system includes:
- Frontend application built with React + Vite.
- Backend services for authentication, API gateway logic, business logic, and integrations.
- Machine Learning and Deep Learning models hosted externally on Hugging Face Spaces or Hugging Face Inference APIs.
- Backend services must call the ML/DL models through APIs.
- Docker must be used for local development and deployment preparation.
- Tailwind CSS must be used for frontend styling.

## Main Architecture Rule

Do not build this project as a monolithic application.

The project must be separated into clear services such as:
- frontend
- auth service
- user service
- ML/DL integration service
- API gateway or main backend API
- database service if needed

Each service must have a clear responsibility.

## Code Quality Rules

- No single file should contain more than 200 lines of code.
- If a file grows close to 200 lines, split it into smaller files.
- Use clean, professional, maintainable code.
- Follow separation of concerns.
- Avoid duplicate code.
- Use meaningful folder names, file names, variable names, and function names.
- Do not write temporary, messy, or test-only code inside production files.
- Do not hardcode secrets, API keys, passwords, tokens, or database URLs.
- Use environment variables for all sensitive configuration.

## Professional Development Method

Use a clean layered architecture approach.

The preferred structure is:

- routes: handle HTTP routes only
- controllers: handle request and response logic
- services: handle business logic
- repositories: handle database access
- validators: handle request validation
- middleware: handle authentication, authorization, logging, and error handling
- utils/helpers: reusable utility functions
- config: environment and service configuration

Frontend must also follow a clean structure:

- components: reusable UI components
- pages: route-level screens
- features: feature-specific logic and UI
- services: API calling logic
- hooks: reusable React hooks
- layouts: page layouts
- utils: helper functions
- constants: fixed values

## Authentication Requirement

The backend must include a modern authentication system.

Use a secure token-based authentication approach:
- Access token for short-term authentication.
- Refresh token for renewing access.
- Store refresh tokens securely.
- Use HTTP-only secure cookies where appropriate.
- Protect private routes with middleware.
- Include role-based authorization if the project requires different user types.

Do not use weak authentication methods.

## ML/DL Model Integration

Machine Learning and Deep Learning models are hosted on Hugging Face.

The backend must communicate with these models using API requests.

Rules:
- Do not call Hugging Face APIs directly from the frontend.
- The frontend must call the backend only.
- The backend must call Hugging Face APIs securely.
- Hugging Face API keys must be stored in environment variables.
- Add error handling for model API failures.
- Add timeout handling for model API requests.
- Keep ML/DL API logic inside a separate service layer.

## Docker Rules

Docker must be used.

Each major service should have its own Dockerfile when needed.

Use docker-compose for local development.

The docker-compose setup should include:
- frontend service
- backend service or backend microservices
- database service if required
- optional reverse proxy/API gateway if required

Do not mix unrelated services inside one container.

## Git and Project Maintenance Rules

- Keep commits clean and meaningful.
- Do not commit `.env` files.
- Provide `.env.example` files.
- Keep README.md updated.
- Explain changed files after every major task.
- Avoid unnecessary package installation.
- Ask before adding a new major dependency.

## Testing and Validation

Before completing any task:
- Check for syntax errors.
- Check import/export paths.
- Make sure files remain under 200 lines.
- Make sure Docker-related changes do not break the project.
- Make sure authentication logic is secure.
- Make sure frontend API calls go through backend services.
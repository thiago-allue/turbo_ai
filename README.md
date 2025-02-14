🍍 Notes App

Welcome to the **Notes App** project, a full-stack application built with Next.js (React) and Django REST Framework.

### 🚀 TL;DR

Just run it locally with Docker Compose:

```bash
docker-compose up --build
```

That’s it! The frontend will be available at **localhost:3000** and the backend at **localhost:8000**.

---

## 🌟 Main Features


1. **Backend (Django REST Framework)**
   - Provides RESTful APIs for notes and categories.
   
   - Implements user registration, login, logout, and profile management.
   
   - Integrates with OpenAI to auto-generate notes (LLM feature).
   
   - Includes comprehensive unit and integration tests.


2. **Frontend (Next.js)**
   - Responsive UI for creating, editing, and organizing notes.
   
   - Category-based filtering and color-coded note cards.
   
   - Modern React hooks, SSR, and test coverage with Jest.


3. **Infrastructure (Terraform & AWS)**
   - Infrastructure as Code for AWS (VPC, subnets, security groups).
   
   - Automated EKS cluster creation and node group setup.
   
   - IAM roles and policies for secure deployments.


4. **Kubernetes**
   - YAML manifests for deployments, services, configmaps, secrets.
   
   - Ingress configuration for routing traffic.
   
   - Horizontal Pod Autoscaler (HPA) for autoscaling the backend.
   
   - Namespaces to isolate all resources.


5. **GitHub Flow**
   - CI/CD pipeline with GitHub Actions to build, test, and deploy.
   
   - Automatic EKS deployments on `push` to `main` or Pull Requests.
   
   - Ensures a stable and consistent release process.

---

## 📦 Additional/Smaller Features

- Local `.env` files for sensitive API keys.

- Dockerfiles for both backend and frontend.

- Automatic timestamps and relative date display (`Today`, `Yesterday`,...).

- Category color highlighting for a pleasing user interface.

- Profile editing with password management.

---

Enjoy your tidy and pleasing note-taking experience!
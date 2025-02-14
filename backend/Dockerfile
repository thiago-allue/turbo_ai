# Backend Dockerfile
FROM python:3.10-slim

# Create a working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . /app/

# Expose the backend port
EXPOSE 8000

# Run migrations and then start server
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]

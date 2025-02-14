FROM python:3.10-slim

WORKDIR /app

# Copy and install backend requirements
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire 'backend' folder into the container
COPY backend /app

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

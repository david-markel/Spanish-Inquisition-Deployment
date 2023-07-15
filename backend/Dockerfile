# Pull base image
FROM python:3.8

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install dependencies
COPY ./backend/requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

# Copy project
COPY ./backend /app

# Run the application
CMD ["daphne", "backend.asgi:application"]

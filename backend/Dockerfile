# Pull base image
FROM python:3.8

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install dependencies
COPY ./requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

# Copy project
COPY . /app

# Set PYTHONPATH
ENV PYTHONPATH=/app:$PYTHONPATH

# Run the application
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "backend.asgi:application"]


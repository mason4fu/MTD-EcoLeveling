# Use lightweight Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /

# Copy all files into container
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Set the startup command
CMD ["python", "App.py"]

#!/bin/bash

# Build script for React frontend deployment on Render

echo "Building React frontend..."

# Install dependencies
npm install

# Build the application
npm run build

echo "Frontend build completed successfully!"
#!/bin/bash

# Exit script on any error
set -e

# === Step 1: Compile client TypeScript ===
echo "Compiling client TypeScript..."
cd client
npm run build
cd ..

# === Step 2: Prepare server public directory ===
echo "Preparing server public directory..."
if [ ! -d "server/public" ]; then
    mkdir -p server/public
else
    rm -rf server/public/*
fi

# === Step 3: Copy client dist files to server public ===
echo "Copying client dist files..."
cp client/dist/main.js server/public/client.js

# === Step 4: Copy client public files to server public ===
echo "Copying client public files..."
cp -r client/public/* server/public/

# === Step 5: Compile server TypeScript ===
echo "Compiling server TypeScript..."
cd server
npm run build
cd ..

# === Step 6: Run server ===
echo "Starting server..."
node server/dist/main.js

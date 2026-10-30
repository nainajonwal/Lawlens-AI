#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "=========================================================="
echo "          Building LawLens for Production on Render        "
echo "=========================================================="

echo "[1/2] Installing frontend dependencies and building production SPA..."
cd frontend
npm install
npm run build
cd ..

echo "[2/2] Installing backend Python dependencies..."
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt
cd ..

echo "=========================================================="
echo "           LawLens Production Build Complete!             "
echo "=========================================================="

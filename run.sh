#!/bin/bash

# NutriWise - Run both frontend and backend

echo "🚀 Starting NutriWise Application..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies if needed
if [ ! -f "venv/.installed" ]; then
    echo "📥 Installing Python dependencies..."
    pip install -r requirements.txt
    touch venv/.installed
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    pnpm install
fi

echo ""
echo "✅ Dependencies ready!"
echo ""
echo "Starting servers..."
echo ""
echo "Backend will run on: http://localhost:8080"
echo "Frontend will run on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
echo "🔧 Starting FastAPI backend..."
uvicorn server.main:app --reload --port 8080 &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Starting React frontend..."
pnpm dev &
FRONTEND_PID=$!

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Wait for both processes
wait


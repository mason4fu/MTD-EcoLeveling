# Move into the Backend folder and start Flask server
echo "🚀 Starting Backend..."
cd Backend
export FLASK_APP=App.py
flask run --port=5001 &
BACKEND_PID=$!
cd ..

# Start the Frontend (React + Vite)
echo "🚀 Starting Frontend..."
npm run dev &
FRONTEND_PID=$!

# Start OTP Server
echo "🚀 Starting OTP Server..."
cd ../otp    # <--- Move into the OTP folder first
java -Xmx2G -jar otp-2.6.0-shaded.jar --load . &
OTP_PID=$!
cd ../sp25-cs411-team099-BigBallers   # <--- Then come back to project folder

# Wait a few seconds for servers to boot up
sleep 5

# 🌟 Auto open browser (change URL if needed)
open http://localhost:5173

# Trap CTRL+C to kill all three processes
trap "echo '⛔ Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID $OTP_PID; exit 0" SIGINT

# Wait for all processes
wait
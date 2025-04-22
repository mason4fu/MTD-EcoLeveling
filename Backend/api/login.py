from flask import Blueprint, jsonify, request
from database.connection import get_db_connection

login_bp = Blueprint('login', __name__, url_prefix='/api/login')

@login_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')  # plain string

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT User_ID, Password_Hash FROM User WHERE Email = %s", (email,))
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if user and user[1] == password:
        return jsonify({"message": "Login successful", "user_id": user[0]})
    else:
        return jsonify({"error": "Invalid credentials"}), 401
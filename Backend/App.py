from flask import Flask, jsonify
import mysql.connector
import os

app = Flask(__name__)

# MySQL configuration
db_config = {
    'host': '34.170.170.60',
    'user': 'jaymalavia',
    'password': 'password',
    'database': 'mtd_eco_leveling',
    'port': 3306
}

@app.route("/api/sql-data")
def get_user_data():
    try:
        print("🔌 Connecting to MySQL...")
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        print("✅ Connected. Running query...")

        cursor.execute("SELECT * FROM User LIMIT 10;")
        rows = cursor.fetchall()
        column_names = [i[0] for i in cursor.description]

        print(f"📦 Retrieved {len(rows)} rows")

        data = [dict(zip(column_names, row)) for row in rows]

        cursor.close()
        conn.close()
        print("✅ Connection closed. Returning data...")

        return jsonify(data)

    except Exception as e:
        print("❌ Error:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    import traceback
    try:
        app.run(debug=True, port=5000)
    except Exception:
        traceback.print_exc()



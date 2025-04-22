from flask import Flask
from api.trips import trips_bp

app = Flask(__name__)

app.register_blueprint(trips_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5001)
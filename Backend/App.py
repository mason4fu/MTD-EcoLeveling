from flask import Flask
from api.trips import trips_bp
from api.login import login_bp 

app = Flask(__name__)

app.register_blueprint(trips_bp)
app.register_blueprint(login_bp) 

if __name__ == "__main__":
    app.run(debug=True, port=5001)
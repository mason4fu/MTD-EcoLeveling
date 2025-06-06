from flask import Flask
from api.trips import trips_bp
from api.login import login_bp
from api.leveling import leveling_bp
from api.user import user_bp
from api.transaction import transaction_bp

app = Flask(__name__)

app.register_blueprint(trips_bp)
app.register_blueprint(login_bp) 
app.register_blueprint(leveling_bp)
app.register_blueprint(user_bp)
app.register_blueprint(transaction_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5001)
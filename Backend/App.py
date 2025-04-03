from flask import Flask, jsonify
from google.cloud import storage
import os

app = Flask(__name__)

# Setup Google credentials + project
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"C:\Users\jayma\AppData\Roaming\gcloud\application_default_credentials.json"
project_id = "mtdecoleveling"

def read_gcs_csv(bucket_name, file_name):
    client = storage.Client(project=project_id)
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(file_name)
    content = blob.download_as_text()

    # Convert CSV into a list of rows (each row is a list of values)
    rows = [line.split(',') for line in content.strip().splitlines()]
    return rows

@app.route("/api/data")
def serve_data():
    try:
        data = read_gcs_csv(bucket_name="mtd_data", file_name="users.csv")
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=5000)


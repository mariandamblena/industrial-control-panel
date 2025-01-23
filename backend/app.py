from flask import Flask, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

@app.route('/api/data')
def get_data():
    data = []
    for i in range(24):  # 24 horas de datos
        data.append({
            'name': f'{i}:00',
            'co2': random.uniform(0, 100),
            'temperatura': random.uniform(0, 100),
            'humedad': random.uniform(0, 100),
            'oxigeno': random.uniform(0, 100)
        })
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)


from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

class PIDControl:
    def __init__(self, metric_name, setpoint, scale_min, scale_max, mode="auto", pid_on=False):
        self.metric_name = metric_name
        self.setpoint = setpoint
        self.scale_min = scale_min
        self.scale_max = scale_max
        self.mode = mode
        self.pid_on = pid_on

    def to_dict(self):
        return {
            "metric_name": self.metric_name,
            "setpoint": self.setpoint,
            "scale": {"min": self.scale_min, "max": self.scale_max},
            "mode": self.mode,
            "pid_on": self.pid_on
        }

class BombControl:
    def __init__(self, caudales, volumenes):
        self.caudales = caudales  # List of dictionaries with 'valor' and 'unidad'
        self.volumenes = volumenes  # List of dictionaries with 'valor' and 'unidad'

    def to_dict(self):
        return {
            "caudales": self.caudales,
            "volumenes": self.volumenes
        }

# Crear instancias de control PID
pid_controls = [
    PIDControl("co2", 400, 300, 500),
    PIDControl("temperatura", 22, 15, 30),
    PIDControl("humedad", 50, 30, 70),
    PIDControl("oxigeno", 21, 18, 23)
]

# Crear instancia de control de bombas
bomb_control = BombControl(
    caudales=[{"valor": "", "unidad": "ml/min"} for _ in range(6)],
    volumenes=[{"valor": "", "unidad": "ml"} for _ in range(6)]
)

# Convertir a JSON
data_to_send = {
    "pid_controls": [control.to_dict() for control in pid_controls],
    "bomb_control": bomb_control.to_dict()
}

@app.route('/')
def home():
    return "Bienvenido a la API de Control"

@app.route('/api/control-data')
def get_control_data():
    return jsonify(data_to_send)

if __name__ == '__main__':
    app.run(debug=True)


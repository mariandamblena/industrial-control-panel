import json
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Cargar datos desde el archivo JSON
def load_pid_controls():
    with open('pid_controls.json', 'r') as f:
        data = json.load(f)
        return [PIDControl(**control) for control in data['pid_controls']]

# Guardar datos en el archivo JSON
def save_pid_controls():
    with open('pid_controls.json', 'w') as f:
        json.dump({"pid_controls": [control.to_dict() for control in pid_controls]}, f)

# Clases y datos iniciales
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

# Cargar los controles PID desde el archivo JSON
pid_controls = load_pid_controls()

@app.route('/api/control-data', methods=['GET'])
def get_control_data():
    return jsonify([control.to_dict() for control in pid_controls])

@app.route('/api/update-pid', methods=['POST'])
def update_pid():
    data = request.get_json()
    metric_name = data.get('metric_name')
    new_setpoint = data.get('setpoint')
    new_scale_min = data.get('scale_min')
    new_scale_max = data.get('scale_max')
    new_mode = data.get('mode')
    new_pid_on = data.get('pid_on')

    # Actualizar el setpoint, la escala, el modo y el estado del PID correspondiente
    for control in pid_controls:
        if control.metric_name == metric_name:
            if new_setpoint is not None:
                control.setpoint = new_setpoint
            if new_scale_min is not None:
                control.scale_min = new_scale_min
            if new_scale_max is not None:
                control.scale_max = new_scale_max
            if new_mode is not None:
                control.mode = new_mode
            if new_pid_on is not None:
                control.pid_on = new_pid_on
            save_pid_controls()  # Guardar los cambios en el archivo JSON
            break

    return jsonify({
        "message": "PID updated",
        "new_setpoint": new_setpoint,
        "new_scale": {"min": new_scale_min, "max": new_scale_max},
        "new_mode": new_mode,
        "pid_on": new_pid_on
    })

if __name__ == '__main__':
    app.run(debug=True)
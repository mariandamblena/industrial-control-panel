from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pid_controls.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Modelo de la base de datos
class PIDControl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    metric_name = db.Column(db.String(50), nullable=False)
    setpoint = db.Column(db.Float, nullable=False)
    scale_min = db.Column(db.Float, nullable=False)
    scale_max = db.Column(db.Float, nullable=False)
    mode = db.Column(db.String(10), default='auto')
    pid_on = db.Column(db.Boolean, default=False)

# Crear la base de datos y cargar datos iniciales
def initialize_data():
    if PIDControl.query.count() == 0:  # Solo insertar si la tabla está vacía
        initial_data = [
            PIDControl(metric_name='co2', setpoint=400, scale_min=300, scale_max=500),
            PIDControl(metric_name='temperatura', setpoint=22, scale_min=15, scale_max=30),
            PIDControl(metric_name='humedad', setpoint=50, scale_min=30, scale_max=70),
            PIDControl(metric_name='oxigeno', setpoint=21, scale_min=18, scale_max=23)
        ]
        db.session.bulk_save_objects(initial_data)
        db.session.commit()

with app.app_context():
    db.create_all()  # Crear las tablas
    initialize_data()  # Cargar datos iniciales

@app.route('/api/control-data', methods=['GET'])
def get_control_data():
    controls = PIDControl.query.all()
    return jsonify([{
        'metric_name': control.metric_name,
        'setpoint': control.setpoint,
        'scale_min': control.scale_min,
        'scale_max': control.scale_max,
        'mode': control.mode,
        'pid_on': control.pid_on
    } for control in controls])

@app.route('/api/update-pid', methods=['POST'])
def update_pid():
    data = request.get_json()
    metric_name = data.get('metric_name')
    control = PIDControl.query.filter_by(metric_name=metric_name).first()
    
    if control:
        control.setpoint = data.get('setpoint', control.setpoint)
        control.scale_min = data.get('scale_min', control.scale_min)
        control.scale_max = data.get('scale_max', control.scale_max)
        control.mode = data.get('mode', control.mode)
        control.pid_on = data.get('pid_on', control.pid_on)
        db.session.commit()
        return jsonify({"message": "PID updated"}), 200
    return jsonify({"message": "Control not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
import requests

API_URL = 'http://127.0.0.1:5000/api/update-pid'

def update_pid_parameter():
    print("Modificar parámetros del PID de CO2")
    print("1. Setpoint")
    print("2. Modo")
    print("3. PID On")
    choice = input("Seleccione el parámetro que desea modificar (1-3): ")

    if choice == '1':
        try:
            new_setpoint = float(input("Ingrese el nuevo setpoint para CO2: "))
            response = requests.post(API_URL, json={"metric_name": "co2", "setpoint": new_setpoint})
            print("Respuesta de la API:", response.json())  # Verificar la respuesta
            if response.ok:
                print(f"Setpoint de CO2 actualizado a: {new_setpoint}")
            else:
                print("Error al actualizar el setpoint:", response.json())
        except ValueError:
            print("Por favor, ingrese un número válido.")

    elif choice == '2':
        new_mode = input("Ingrese el nuevo modo (auto/manual) para CO2: ")
        # Aquí puedes agregar la lógica para actualizar el modo en el backend
        print(f"Modo de CO2 actualizado a: {new_mode}")
        # Asegúrate de implementar la lógica en el backend para manejar esto

    elif choice == '3':
        pid_on = input("¿Activar PID? (true/false): ").lower() == 'true'
        # Aquí puedes agregar la lógica para actualizar el estado PID en el backend
        print(f"Estado PID de CO2 actualizado a: {pid_on}")
        # Asegúrate de implementar la lógica en el backend para manejar esto

    else:
        print("Opción no válida.")

if __name__ == '__main__':
    update_pid_parameter()
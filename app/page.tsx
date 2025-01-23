"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { CombinedChart } from "../components/CombinedChart"

// Datos de ejemplo para los gráficos
const generateData = (hours: number, setpoint = 0, scale: { min: number; max: number }) => {
  return Array.from({ length: hours }, (_, i) => ({
    name: `${i}:00`,
    co2: Math.random() * (scale.max - scale.min) + scale.min,
    temperatura: Math.random() * (scale.max - scale.min) + scale.min,
    humedad: Math.random() * (scale.max - scale.min) + scale.min,
    oxigeno: Math.random() * (scale.max - scale.min) + scale.min,
    setpoint: setpoint,
  }))
}

// Nueva función para generar datos para el gráfico combinado
const generateCombinedData = (hours: number) => {
  return Array.from({ length: hours }, (_, i) => ({
    name: `${i}:00`,
    co2: Math.random() * 100,
    temperatura: Math.random() * 100,
    humedad: Math.random() * 100,
    oxigeno: Math.random() * 100,
  }))
}

export default function ControlPanel() {
  const [data, setData] = useState({
    co2: [] as any[],
    temperatura: [] as any[],
    humedad: [] as any[],
    oxigeno: [] as any[],
  })
  const [pidStates, setPidStates] = useState({
    co2: false,
    temperatura: false,
    humedad: false,
    oxigeno: false,
  })
  const [controlModes, setControlModes] = useState({
    co2: "auto",
    temperatura: "auto",
    humedad: "auto",
    oxigeno: "auto",
  })
  const [setpoints, setSetpoints] = useState({
    co2: 400,
    temperatura: 22,
    humedad: 50,
    oxigeno: 21,
  })
  const [showSetpoints, setShowSetpoints] = useState({
    co2: true,
    temperatura: true,
    humedad: true,
    oxigeno: true,
  })
  const [scales, setScales] = useState({
    co2: { min: 300, max: 500 },
    temperatura: { min: 15, max: 30 },
    humedad: { min: 30, max: 70 },
    oxigeno: { min: 18, max: 23 },
  })
  const [timeRanges, setTimeRanges] = useState({
    co2: 24,
    temperatura: 24,
    humedad: 24,
    oxigeno: 24,
  })
  const [manualValues, setManualValues] = useState({
    co2: 0,
    temperatura: 0,
    humedad: 0,
    oxigeno: 0,
  })

  const [bombSettings, setBombSettings] = useState({
    caudales: Array(6).fill({ valor: "", unidad: "ml/min" }),
    volumenes: Array(6).fill({ valor: "", unidad: "ml" }),
  })

  const [combinedData, setCombinedData] = useState<any[]>([])
  const [combinedTimeRange, setCombinedTimeRange] = useState(24)

  const updateCombinedData = (hours: number) => {
    const newData = generateCombinedData(hours)
    setCombinedData(newData)
  }

  useEffect(() => {
    fetchData(); // Cargar datos iniciales
    updateCombinedData(combinedTimeRange);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/control-data');
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }
      const result = await response.json();
      setData(result); // Actualiza el estado con los datos obtenidos
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  };

  const togglePID = async (control: keyof typeof pidStates) => {
    const newState = !pidStates[control];
    setPidStates((prev) => ({ ...prev, [control]: newState }));

    // Enviar el nuevo estado al backend
    fetch('http://127.0.0.1:5000/api/update-pid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric_name: control,
        pid_on: newState,
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al actualizar el estado del PID');
      }
      return response.json();
    })
    .then(data => {
      console.log('Respuesta de la API:', data);
      fetchData(); // Llama a la función para recargar los datos
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  const updateControlMode = async (control: keyof typeof controlModes, mode: "auto" | "manual") => {
    setControlModes((prev) => ({ ...prev, [control]: mode }));

    // Enviar el nuevo modo al backend
    fetch('http://127.0.0.1:5000/api/update-pid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric_name: control,
        mode: mode,
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al actualizar el modo de control');
      }
      return response.json();
    })
    .then(data => {
      console.log('Respuesta de la API:', data);
      fetchData(); // Llama a la función para recargar los datos
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  const updateSetpoint = async (control: keyof typeof setpoints, value: number) => {
    setSetpoints((prev) => {
      const newSetpoints = { ...prev, [control]: value };

      // Enviar el nuevo setpoint y la escala al backend
      fetch('http://127.0.0.1:5000/api/update-pid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metric_name: control,
          setpoint: value,
          scale_min: scales[control].min,  // Enviar el nuevo valor mínimo
          scale_max: scales[control].max   // Enviar el nuevo valor máximo
        }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al actualizar el setpoint');
        }
        return response.json();
      })
      .then(data => {
        console.log('Respuesta de la API:', data);
        fetchData(); // Llama a la función para recargar los datos
      })
      .catch(error => {
        console.error('Error:', error);
      });

      return newSetpoints;
    });
  }

  const toggleShowSetpoint = (control: keyof typeof showSetpoints) => {
    setShowSetpoints((prev) => ({ ...prev, [control]: !prev[control] }));
  }

  const updateScale = async (control: keyof typeof scales, min: number, max: number) => {
    setScales((prev) => ({ ...prev, [control]: { min, max } }));

    // Enviar la nueva escala al backend
    fetch('http://127.0.0.1:5000/api/update-pid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric_name: control,
        scale_min: min,
        scale_max: max,
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al actualizar la escala');
      }
      return response.json();
    })
    .then(data => {
      console.log('Respuesta de la API:', data);
      fetchData(); // Llama a la función para recargar los datos
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  const updateTimeRange = (control: keyof typeof timeRanges, hours: number) => {
    setTimeRanges((prev) => ({ ...prev, [control]: hours }));
    setData((prev) => ({
      ...prev,
      [control]: generateData(
        hours,
        setpoints[control as keyof typeof setpoints],
        scales[control as keyof typeof scales],
      ),
    }));
  }

  const updateManualValue = (control: keyof typeof manualValues, value: number) => {
    setManualValues((prev) => ({ ...prev, [control]: value }));
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Panel de Control Industrial</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {["co2", "temperatura", "humedad", "oxigeno"].map((metric) => (
          <Card key={metric}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span>{metric.charAt(0).toUpperCase() + metric.slice(1)}</span>
                  <div
                    className={`w-3 h-3 rounded-full ${pidStates[metric as keyof typeof pidStates] ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={controlModes[metric as keyof typeof controlModes]}
                    onValueChange={(value) =>
                      updateControlMode(metric as keyof typeof controlModes, value as "auto" | "manual")
                    }
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Modo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant={pidStates[metric as keyof typeof pidStates] ? "default" : "secondary"}
                    onClick={() => togglePID(metric as keyof typeof pidStates)}
                  >
                    PID {pidStates[metric as keyof typeof pidStates] ? "ON" : "OFF"}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex-grow">
                    <Label htmlFor={`setpoint-${metric}`} className="text-xs">
                      Setpoint
                    </Label>
                    <Input
                      id={`setpoint-${metric}`}
                      type="number"
                      value={setpoints[metric as keyof typeof setpoints]}
                      onChange={(e) => updateSetpoint(metric as keyof typeof setpoints, Number(e.target.value))}
                      className="w-full h-8 text-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-5">
                    <Checkbox
                      id={`show-setpoint-${metric}`}
                      checked={showSetpoints[metric as keyof typeof showSetpoints]}
                      onCheckedChange={() => toggleShowSetpoint(metric as keyof typeof showSetpoints)}
                    />
                    <Label htmlFor={`show-setpoint-${metric}`} className="text-xs">
                      Mostrar
                    </Label>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Escala</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      value={scales[metric as keyof typeof scales].min}
                      onChange={(e) =>
                        updateScale(
                          metric as keyof typeof scales,
                          Number(e.target.value),
                          scales[metric as keyof typeof scales].max,
                        )
                      }
                      className="w-1/2 h-8 text-sm"
                      placeholder="Min"
                    />
                    <Input
                      type="number"
                      value={scales[metric as keyof typeof scales].max}
                      onChange={(e) =>
                        updateScale(
                          metric as keyof typeof scales,
                          scales[metric as keyof typeof scales].min,
                          Number(e.target.value),
                        )
                      }
                      className="w-1/2 h-8 text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data[metric as keyof typeof data]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    domain={[scales[metric as keyof typeof scales].min, scales[metric as keyof typeof scales].max]}
                    tickCount={5}
                  />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey={metric} stroke="#8884d8" dot={false} />
                  {showSetpoints[metric as keyof typeof showSetpoints] && (
                    <Line type="monotone" dataKey="setpoint" stroke="#82ca9d" dot={false} strokeDasharray="5 5" />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Aquí puedes agregar el resto de tu código para el control de bomba y gráfico combinado */}
    </div>
  )
}
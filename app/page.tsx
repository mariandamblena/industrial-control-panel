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
    const initialData = {
      co2: generateData(timeRanges.co2, setpoints.co2, scales.co2),
      temperatura: generateData(timeRanges.temperatura, setpoints.temperatura, scales.temperatura),
      humedad: generateData(timeRanges.humedad, setpoints.humedad, scales.humedad),
      oxigeno: generateData(timeRanges.oxigeno, setpoints.oxigeno, scales.oxigeno),
    }
    setData(initialData)
    updateCombinedData(combinedTimeRange)
  }, [])

  const togglePID = (control: keyof typeof pidStates) => {
    setPidStates((prev) => ({ ...prev, [control]: !prev[control] }))
  }

  const updateBombSetting = (
    type: "caudales" | "volumenes",
    index: number,
    field: "valor" | "unidad",
    value: string,
  ) => {
    setBombSettings((prev) => ({
      ...prev,
      [type]: prev[type].map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const updateControlMode = (control: keyof typeof controlModes, mode: "auto" | "manual") => {
    setControlModes((prev) => ({ ...prev, [control]: mode }))
  }

  const updateSetpoint = (control: keyof typeof setpoints, value: number) => {
    setSetpoints((prev) => {
      const newSetpoints = { ...prev, [control]: value }
      setData((prevData) => ({
        ...prev,
        [control]: generateData(
          timeRanges[control as keyof typeof timeRanges],
          value,
          scales[control as keyof typeof scales],
        ),
      }))
      return newSetpoints
    })
  }

  const toggleShowSetpoint = (control: keyof typeof showSetpoints) => {
    setShowSetpoints((prev) => ({ ...prev, [control]: !prev[control] }))
  }

  const updateScale = (control: keyof typeof scales, min: number, max: number) => {
    setScales((prev) => ({ ...prev, [control]: { min, max } }))
    // Regenerar los datos para el gráfico con la nueva escala
    setData((prev) => ({
      ...prev,
      [control]: generateData(
        timeRanges[control as keyof typeof timeRanges],
        setpoints[control as keyof typeof setpoints],
        scales[control as keyof typeof scales],
      ),
    }))
  }

  const updateTimeRange = (control: keyof typeof timeRanges, hours: number) => {
    setTimeRanges((prev) => ({ ...prev, [control]: hours }))
    setData((prev) => ({
      ...prev,
      [control]: generateData(
        hours,
        setpoints[control as keyof typeof setpoints],
        scales[control as keyof typeof scales],
      ),
    }))
  }

  const updateManualValue = (control: keyof typeof manualValues, value: number) => {
    setManualValues((prev) => ({ ...prev, [control]: value }))
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
              {controlModes[metric as keyof typeof controlModes] === "manual" && (
                <div className="mb-4">
                  <Label htmlFor={`manual-${metric}`} className="text-xs">
                    Control Manual (0-100%)
                  </Label>
                  <Slider
                    id={`manual-${metric}`}
                    min={0}
                    max={100}
                    step={1}
                    value={[manualValues[metric as keyof typeof manualValues]]}
                    onValueChange={(value) => updateManualValue(metric as keyof typeof manualValues, value[0])}
                  />
                  <div className="text-center mt-1 text-sm">{manualValues[metric as keyof typeof manualValues]}%</div>
                </div>
              )}
              <div className="mb-4">
                <Label htmlFor={`time-range-${metric}`} className="text-xs">
                  Rango de Tiempo (horas)
                </Label>
                <Slider
                  id={`time-range-${metric}`}
                  min={1}
                  max={72}
                  step={1}
                  value={[timeRanges[metric as keyof typeof timeRanges]]}
                  onValueChange={(value) => updateTimeRange(metric as keyof typeof timeRanges, value[0])}
                />
                <div className="text-center mt-1 text-sm">{timeRanges[metric as keyof typeof timeRanges]} horas</div>
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Control de Bomba</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Caudales</h3>
              {bombSettings.caudales.map((caudal, index) => (
                <div key={`caudal-${index}`} className="flex items-center mb-2 space-x-2">
                  <Input
                    type="number"
                    value={caudal.valor}
                    onChange={(e) => updateBombSetting("caudales", index, "valor", e.target.value)}
                    placeholder={`Caudal ${index + 1}`}
                    className="w-1/2 h-8 text-sm"
                  />
                  <Select
                    value={caudal.unidad}
                    onValueChange={(value) => updateBombSetting("caudales", index, "unidad", value)}
                  >
                    <SelectTrigger className="w-1/2 h-8 text-sm">
                      <SelectValue placeholder="Unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ml/min">ml/min</SelectItem>
                      <SelectItem value="ml/dia">ml/día</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Volúmenes</h3>
              {bombSettings.volumenes.map((volumen, index) => (
                <div key={`volumen-${index}`} className="flex items-center mb-2 space-x-2">
                  <Input
                    type="number"
                    value={volumen.valor}
                    onChange={(e) => updateBombSetting("volumenes", index, "valor", e.target.value)}
                    placeholder={`Volumen ${index + 1}`}
                    className="w-1/2 h-8 text-sm"
                  />
                  <Select
                    value={volumen.unidad}
                    onValueChange={(value) => updateBombSetting("volumenes", index, "unidad", value)}
                  >
                    <SelectTrigger className="w-1/2 h-8 text-sm">
                      <SelectValue placeholder="Unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="ul">µl</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Gráfico Combinado (Escala 0-100%)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="combined-time-range" className="text-xs">
              Rango de Tiempo (horas)
            </Label>
            <Slider
              id="combined-time-range"
              min={1}
              max={72}
              step={1}
              value={[combinedTimeRange]}
              onValueChange={(value) => {
                setCombinedTimeRange(value[0])
                updateCombinedData(value[0])
              }}
            />
            <div className="text-center mt-1 text-sm">{combinedTimeRange} horas</div>
          </div>
          <div className="h-[400px]">
            <CombinedChart data={combinedData} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


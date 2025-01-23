import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface CombinedChartProps {
  data: Array<{
    name: string
    co2: number
    temperatura: number
    humedad: number
    oxigeno: number
  }>
}

export function CombinedChart({ data }: CombinedChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} tickCount={6} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="co2" name="CO2 (%)" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="temperatura" name="Temperatura (%)" stroke="#82ca9d" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="humedad" name="Humedad (%)" stroke="#ffc658" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="oxigeno" name="Oxígeno (%)" stroke="#ff7300" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}


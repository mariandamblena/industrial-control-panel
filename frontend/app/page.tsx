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

// ... (mantener las funciones generateData y generateCombinedData)

export default function ControlPanel() {
  // ... (mantener el estado existente)

  const [combinedData, setCombinedData] = useState<any[]>([])
  const [combinedTimeRange, setCombinedTimeRange] = useState(24)

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data")
      const data = await response.json()
      setCombinedData(data)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  useEffect(() => {
    const initialData = {
      co2: generateData(timeRanges.co2, setpoints.co2, scales.co2),
      temperatura: generateData(timeRanges.temperatura, setpoints.temperatura, scales.temperatura),
      humedad: generateData(timeRanges.humedad, setpoints.humedad, scales.humedad),
      oxigeno: generateData(timeRanges.oxigeno, setpoints.oxigeno, scales.oxigeno),
    }
    setData(initialData)
    fetchData()
  }, [])

  // ... (mantener las funciones existentes)

  return (
    // ... (mantener el JSX existente)
  )
}


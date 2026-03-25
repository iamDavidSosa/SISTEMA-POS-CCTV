export interface ResultadoRetencion {
  diasRetencion: number
  totalBitrateMbps: number
  totalTB: number
  usadoTB: number
  porcentajeUsado: number
  camaras: number
  suficiente: boolean
}

export interface ItemCalculo {
  categoria: string
  bitrateMbps?: number
  capacidadTB?: number
  cantidad: number
}

export function calcularRetencion(items: ItemCalculo[]): ResultadoRetencion | null {
  const camaras = items
    .filter(i => i.categoria === 'camara')
    .reduce((acc, i) => acc + i.cantidad, 0)

  const totalBitrateMbps = items
    .filter(i => i.categoria === 'camara')
    .reduce((acc, i) => acc + (i.bitrateMbps ?? 0) * i.cantidad, 0)

  const totalTB = items
    .filter(i => i.categoria === 'hdd')
    .reduce((acc, i) => acc + (i.capacidadTB ?? 0) * i.cantidad, 0)

  if (totalBitrateMbps === 0 || totalTB === 0) return null

  const bytesPerDay = (totalBitrateMbps * 1e6 / 8) * 86400
  const totalBytes = totalTB * 1e12
  const diasRetencion = Math.floor(totalBytes / bytesPerDay)
  const usadoTB = parseFloat((bytesPerDay * diasRetencion / 1e12).toFixed(2))
  const porcentajeUsado = Math.min(100, Math.round((usadoTB / totalTB) * 100))

  return {
    diasRetencion,
    totalBitrateMbps: parseFloat(totalBitrateMbps.toFixed(1)),
    totalTB,
    usadoTB,
    porcentajeUsado,
    camaras,
    suficiente: diasRetencion >= 30,
  }
}
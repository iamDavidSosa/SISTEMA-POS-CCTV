import {
  Document, Page, Text, View, StyleSheet, Font
} from '@react-pdf/renderer'
import type { Producto } from '../components/ProductCard'
import type { ResultadoRetencion } from './retencion'

interface ItemCarrito {
  producto: Producto
  cantidad: number
}

interface Props {
  items: ItemCarrito[]
  retencion: ResultadoRetencion | null
  numeroCotizacion: string
  clienteNombre: string
  empresaNombre: string
  empresaRNC: string
  empresaTel: string
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  empresa: { fontSize: 16, fontFamily: 'Helvetica-Bold' },
  empresaSub: { fontSize: 9, color: '#888', marginTop: 3 },
  quoteNum: { fontSize: 11, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  quoteSub: { fontSize: 9, color: '#888', textAlign: 'right', marginTop: 3 },
  seccion: { marginBottom: 16 },
  label: { fontSize: 7, color: '#888', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  valor: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: '6 8',
    borderRadius: 4,
    marginBottom: 1,
  },
  tableHeaderText: { color: '#fff', fontSize: 8, fontFamily: 'Helvetica-Bold' },
  tableRow: {
    flexDirection: 'row',
    padding: '6 8',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  tableRowAlt: { backgroundColor: '#f7f7f7' },
  col1: { flex: 2 },
  col2: { flex: 1 },
  col3: { width: 50, textAlign: 'right' },
  col4: { width: 60, textAlign: 'right' },
  col5: { width: 70, textAlign: 'right' },
  totalesBox: {
    alignItems: 'flex-end',
    marginTop: 12,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 40,
    marginBottom: 3,
  },
  totalLabel: { fontSize: 9, color: '#666', width: 80, textAlign: 'right' },
  totalValor: { fontSize: 9, width: 80, textAlign: 'right' },
  totalGrandLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', width: 80, textAlign: 'right' },
  totalGrandValor: { fontSize: 11, fontFamily: 'Helvetica-Bold', width: 80, textAlign: 'right' },
  retencionBox: {
    backgroundColor: '#eef4ff',
    borderWidth: 0.5,
    borderColor: '#c2d8f8',
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
  },
  retencionTitulo: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#185FA5', marginBottom: 8 },
  retencionGrid: { flexDirection: 'row', gap: 20, marginBottom: 8 },
  retencionMetric: { flex: 1 },
  retencionVal: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#185FA5' },
  retencionLbl: { fontSize: 8, color: '#555' },
  retencionNota: { fontSize: 8, color: '#555', marginTop: 4 },
  condicionesBox: { marginTop: 8 },
  condRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.3,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 4,
  },
  condLabel: { width: 120, fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#444' },
  condValor: { flex: 1, fontSize: 9, color: '#555' },
  firmas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  firmaBox: { width: 180 },
  firmaLinea: { borderTopWidth: 0.5, borderTopColor: '#888', marginBottom: 4 },
  firmaTxt: { fontSize: 8, color: '#888' },
})

function fmt(n: number) {
  return `RD$${n.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`
}

export default function CotizacionPDF({
  items, retencion, numeroCotizacion, clienteNombre, empresaNombre, empresaRNC, empresaTel
}: Props) {
  const subtotal = items.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0)
  const itbis = Math.round(subtotal * 0.18)
  const total = subtotal + itbis
  const fecha = new Date().toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.empresa}>{empresaNombre}</Text>
            <Text style={styles.empresaSub}>RNC: {empresaRNC} · Tel: {empresaTel}</Text>
          </View>
          <View>
            <Text style={styles.quoteNum}>COTIZACIÓN #{numeroCotizacion}</Text>
            <Text style={styles.quoteSub}>Fecha: {fecha}</Text>
            <Text style={styles.quoteSub}>Válida por 30 días</Text>
          </View>
        </View>

        {/* Cliente */}
        <View style={styles.seccion}>
          <Text style={styles.label}>Para</Text>
          <Text style={styles.valor}>{clienteNombre}</Text>
        </View>

        {/* Tabla de productos */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.col1]}>Producto</Text>
          <Text style={[styles.tableHeaderText, styles.col2]}>Especificaciones</Text>
          <Text style={[styles.tableHeaderText, styles.col3]}>Cant.</Text>
          <Text style={[styles.tableHeaderText, styles.col4]}>P. Unit.</Text>
          <Text style={[styles.tableHeaderText, styles.col5]}>Total</Text>
        </View>
        {items.map((item, i) => (
          <View key={item.producto.id} style={[styles.tableRow, i % 2 === 0 ? styles.tableRowAlt : {}]}>
            <Text style={styles.col1}>{item.producto.nombre}</Text>
            <Text style={styles.col2}>{item.producto.specs}</Text>
            <Text style={styles.col3}>{item.cantidad}</Text>
            <Text style={styles.col4}>{fmt(item.producto.precio)}</Text>
            <Text style={styles.col5}>{fmt(item.producto.precio * item.cantidad)}</Text>
          </View>
        ))}

        {/* Totales */}
        <View style={styles.totalesBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValor}>{fmt(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>ITBIS (18%)</Text>
            <Text style={styles.totalValor}>{fmt(itbis)}</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 4 }]}>
            <Text style={styles.totalGrandLabel}>TOTAL</Text>
            <Text style={styles.totalGrandValor}>{fmt(total)}</Text>
          </View>
        </View>

        {/* Retención */}
        {retencion && (
          <View style={styles.retencionBox}>
            <Text style={styles.retencionTitulo}>Análisis técnico de retención de grabación</Text>
            <View style={styles.retencionGrid}>
              <View style={styles.retencionMetric}>
                <Text style={styles.retencionVal}>{retencion.diasRetencion}</Text>
                <Text style={styles.retencionLbl}>días de retención</Text>
              </View>
              <View style={styles.retencionMetric}>
                <Text style={styles.retencionVal}>{retencion.totalBitrateMbps}</Text>
                <Text style={styles.retencionLbl}>Mbps bitrate total</Text>
              </View>
              <View style={styles.retencionMetric}>
                <Text style={styles.retencionVal}>{retencion.totalTB}</Text>
                <Text style={styles.retencionLbl}>TB almacenamiento</Text>
              </View>
            </View>
            <Text style={styles.retencionNota}>
              Cálculo basado en {retencion.camaras} cámara(s) en grabación continua 24/7 con codec H.265.
              El resultado puede variar ±20% según condiciones de la escena.
            </Text>
          </View>
        )}

        {/* Condiciones */}
        <View style={styles.condicionesBox}>
          <Text style={[styles.label, { marginBottom: 6 }]}>Condiciones de la cotización</Text>
          {[
            ['Validez', '30 días calendario desde la fecha de emisión'],
            ['Forma de pago', '50% anticipo · 50% contra entrega'],
            ['Garantía equipos', '12 meses contra defectos de fábrica'],
            ['Instalación', 'No incluida — cotización disponible por separado'],
            ['Tiempo de entrega', '3–5 días hábiles desde confirmación del pedido'],
          ].map(([k, v]) => (
            <View key={k} style={styles.condRow}>
              <Text style={styles.condLabel}>{k}</Text>
              <Text style={styles.condValor}>{v}</Text>
            </View>
          ))}
        </View>

        {/* Firmas */}
        <View style={styles.firmas}>
          <View style={styles.firmaBox}>
            <View style={styles.firmaLinea} />
            <Text style={styles.firmaTxt}>Firma y sello del vendedor</Text>
            <Text style={[styles.firmaTxt, { marginTop: 2 }]}>{empresaNombre}</Text>
          </View>
          <View style={styles.firmaBox}>
            <View style={styles.firmaLinea} />
            <Text style={styles.firmaTxt}>Firma y aceptación del cliente</Text>
            <Text style={[styles.firmaTxt, { marginTop: 2 }]}>{clienteNombre}</Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}
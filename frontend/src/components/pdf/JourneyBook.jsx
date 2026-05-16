import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  maroon:    '#5C1818',
  rose:      '#A84B4B',
  lightRose: '#F9EDED',
  dark:      '#1A1A1A',
  mid:       '#4A4A4A',
  light:     '#888888',
  border:    '#DDD0D0',
  bgAlt:     '#FAF5F5',
  green:     '#166534',
  greenBg:   '#F0FDF4',
  amber:     '#92400E',
  amberBg:   '#FFFBEB',
  red:       '#991B1B',
  redBg:     '#FEF2F2',
  grayBg:    '#F3F4F6',
  gray:      '#6B7280',
  white:     '#FFFFFF',
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: C.dark,
    paddingTop: 36,
    paddingBottom: 50,
    paddingHorizontal: 40,
    backgroundColor: C.white,
  },
  coverPage: {
    fontFamily: 'Helvetica',
    backgroundColor: C.maroon,
    padding: 50,
    justifyContent: 'space-between',
  },

  // Header / footer
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderBottomStyle: 'solid',
  },
  pageHeaderTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.maroon },
  pageNum: { fontSize: 7.5, color: C.light },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: C.border,
    borderTopStyle: 'solid',
    paddingTop: 5,
  },
  footerText: { fontSize: 7, color: C.light },

  // Section
  section: { marginBottom: 14 },
  sectionBar: {
    backgroundColor: C.lightRose,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: C.maroon,
    borderLeftStyle: 'solid',
  },
  sectionTitle: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: C.maroon },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 8 },

  // Stat boxes
  statRow: { flexDirection: 'row', marginBottom: 14 },
  statBox: {
    flex: 1,
    backgroundColor: C.bgAlt,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'solid',
  },
  statNum: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.maroon },
  statLabel: { fontSize: 6.5, color: C.light, textAlign: 'center', marginTop: 2 },

  // Progress bar
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  barLabel: { fontSize: 8, color: C.mid, width: 110 },
  barTrack: {
    flex: 1,
    height: 7,
    backgroundColor: C.border,
    borderRadius: 3.5,
  },
  barSub: { fontSize: 7.5, color: C.light, width: 45, textAlign: 'right' },

  // Tables
  table: {
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'solid',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  tHead: {
    flexDirection: 'row',
    backgroundColor: C.bgAlt,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderBottomStyle: 'solid',
  },
  tRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderBottomStyle: 'solid',
  },
  tRowLast: { flexDirection: 'row' },
  tRowAlt: {
    flexDirection: 'row',
    backgroundColor: C.bgAlt,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderBottomStyle: 'solid',
  },
  th: { padding: 4, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.maroon },
  td: { padding: 4, fontSize: 7.5 },
  tdMuted: { padding: 4, fontSize: 7.5, color: C.light },

  // Misc
  row: { flexDirection: 'row' },
  col: { flex: 1 },
  bold: { fontFamily: 'Helvetica-Bold' },
  label: { fontSize: 7, color: C.light, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  value: { fontSize: 8.5, color: C.dark },
  tag: { paddingVertical: 1.5, paddingHorizontal: 5, borderRadius: 2, fontSize: 6.5 },
  smallNote: { fontSize: 7, color: C.light, fontStyle: 'italic' },
})

// ─── Lookups ──────────────────────────────────────────────────────────────────
const VENDOR_STATUS = {
  POTENTIAL:    { label: 'Potential',    color: C.gray,  bg: C.grayBg },
  CONTACTED:    { label: 'Contacted',    color: C.amber, bg: C.amberBg },
  QUOTED:       { label: 'Quoted',       color: C.amber, bg: C.amberBg },
  BOOKED:       { label: 'Booked',       color: C.green, bg: C.greenBg },
  DEPOSIT_PAID: { label: 'Deposit Paid', color: C.green, bg: C.greenBg },
  FULLY_PAID:   { label: 'Fully Paid',   color: C.green, bg: C.greenBg },
  COMPLETED:    { label: 'Completed',    color: C.green, bg: C.greenBg },
  CANCELLED:    { label: 'Cancelled',    color: C.red,   bg: C.redBg },
}
const RSVP_STATUS = {
  ATTENDING:     { label: 'Hadir',       color: C.green, bg: C.greenBg },
  NOT_ATTENDING: { label: 'Tak Hadir',   color: C.red,   bg: C.redBg },
  MAYBE:         { label: 'Mungkin',     color: C.amber, bg: C.amberBg },
  PENDING:       { label: 'Pending',     color: C.gray,  bg: C.grayBg },
}
const TASK_PHASE_LABEL = {
  '12_MONTHS': '12+ Bulan',
  '9_MONTHS':  '9 Bulan',
  '6_MONTHS':  '6 Bulan',
  '3_MONTHS':  '3 Bulan',
  '1_MONTH':   '1 Bulan',
  '1_WEEK':    '1 Minggu',
  'DAY_OF':    'Hari Majlis',
  'POST_WEDDING': 'Selepas Majlis',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) => v != null && v !== '' ? parseFloat(v).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'
const dash = (v) => (v != null && v !== '') ? String(v) : '—'
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0)
const groupBy = (arr, fn) => arr.reduce((acc, item) => { const k = fn(item); (acc[k] = acc[k] || []).push(item); return acc }, {})

function Tag({ label, color, bg }) {
  return (
    <View style={[s.tag, { backgroundColor: bg }]}>
      <Text style={{ color, fontSize: 6.5, fontFamily: 'Helvetica-Bold' }}>{label}</Text>
    </View>
  )
}

function SectionBar({ title }) {
  return (
    <View style={s.sectionBar}>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  )
}

function ProgressBarRow({ label, done, total }) {
  const p = pct(done, total)
  return (
    <View style={s.barRow}>
      <Text style={s.barLabel}>{label}</Text>
      <View style={s.barTrack}>
        <View style={{ height: 7, borderRadius: 3.5, width: `${p}%`, backgroundColor: C.maroon }} />
      </View>
      <Text style={s.barSub}>{done}/{total} · {p}%</Text>
    </View>
  )
}

function Footer({ coupleName, pageLabel }) {
  const today = format(new Date(), 'd MMM yyyy')
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>{coupleName} — Journey Book</Text>
      <Text style={s.footerText}>{pageLabel} · Dijana: {today}</Text>
    </View>
  )
}

function PageHeader({ title, coupleName }) {
  return (
    <View style={s.pageHeader} fixed>
      <Text style={s.pageHeaderTitle}>{title}</Text>
      <Text style={s.pageNum}>{coupleName}</Text>
    </View>
  )
}

// ─── Cover Page ───────────────────────────────────────────────────────────────
function CoverPage({ wedding }) {
  const coupleName = `${wedding.groom_name} & ${wedding.bride_name}`
  const daysLeft = wedding.wedding_date
    ? differenceInDays(new Date(wedding.wedding_date), new Date())
    : null

  return (
    <Page size="A4" style={s.coverPage}>
      {/* Top ornament */}
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: 80, height: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: 6 }} />
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 7, letterSpacing: 3 }}>PLANLUHH</Text>
        <View style={{ width: 80, height: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginTop: 6 }} />
      </View>

      {/* Centre content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
        <Text style={{ color: 'rgba(255,220,220,0.7)', fontSize: 9, letterSpacing: 3, marginBottom: 20 }}>
          WEDDING JOURNEY BOOK
        </Text>

        <Text style={{ color: C.white, fontSize: 28, fontFamily: 'Helvetica-Bold', textAlign: 'center', lineHeight: 1.3 }}>
          {wedding.groom_name}
        </Text>
        <Text style={{ color: 'rgba(255,200,200,0.8)', fontSize: 18, marginVertical: 6 }}>&</Text>
        <Text style={{ color: C.white, fontSize: 28, fontFamily: 'Helvetica-Bold', textAlign: 'center', lineHeight: 1.3 }}>
          {wedding.bride_name}
        </Text>

        <View style={{ width: 60, height: 1, backgroundColor: 'rgba(255,200,200,0.4)', marginVertical: 20 }} />

        {wedding.wedding_date && (
          <Text style={{ color: 'rgba(255,220,220,0.85)', fontSize: 10, marginBottom: 4 }}>
            {format(new Date(wedding.wedding_date), 'EEEE, d MMMM yyyy')}
          </Text>
        )}
        {wedding.venue_name && (
          <Text style={{ color: 'rgba(255,200,200,0.6)', fontSize: 9 }}>
            {wedding.venue_name}
          </Text>
        )}

        {daysLeft !== null && (
          <View style={{ marginTop: 16, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16 }}>
            <Text style={{ color: C.white, fontSize: 8.5, textAlign: 'center' }}>
              {daysLeft > 0 ? `${daysLeft} hari lagi` : daysLeft === 0 ? 'Hari ini!' : `${Math.abs(daysLeft)} hari lepas`}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom */}
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: 80, height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 10 }} />
        <Text style={{ color: 'rgba(255,200,200,0.5)', fontSize: 7 }}>
          Dijana oleh PlanLuhh · {format(new Date(), 'MMMM yyyy')}
        </Text>
      </View>
    </Page>
  )
}

// ─── Overview Page ────────────────────────────────────────────────────────────
function OverviewPage({ wedding, stats, tasks, vendors, budget }) {
  const coupleName = `${wedding.groom_name} & ${wedding.bride_name}`
  const tasksDone  = tasks?.filter(t => t.is_completed).length ?? 0
  const tasksTotal = tasks?.length ?? 0
  const vendorsDone = vendors?.filter(v => ['BOOKED','DEPOSIT_PAID','FULLY_PAID','COMPLETED'].includes(v.vendor_status)).length ?? 0
  const vendorsTotal = vendors?.length ?? 0
  const totalPaid = (budget ?? []).reduce((sum, i) => sum + (i.paid_amount ? parseFloat(i.paid_amount) : 0), 0)

  return (
    <Page size="A4" style={s.page}>
      <PageHeader title="Overview & Progress" coupleName={coupleName} />

      {/* 4 stat boxes */}
      <View style={s.statRow}>
        <View style={s.statBox}>
          <Text style={s.statNum}>{stats?.total_guests_pax ?? '—'}</Text>
          <Text style={s.statLabel}>Total Jemputan (Pax)</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statNum}>{stats?.rsvp_attending ?? 0}</Text>
          <Text style={s.statLabel}>RSVP Hadir</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statNum}>{vendorsDone}/{Math.max(vendorsTotal, stats?.total_vendor_categories ?? 13)}</Text>
          <Text style={s.statLabel}>Vendor Confirmed</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statNum}>{tasksDone}/{tasksTotal}</Text>
          <Text style={s.statLabel}>Checklist Selesai</Text>
        </View>
      </View>

      {/* Progress bars */}
      <View style={[s.section, { backgroundColor: C.bgAlt, borderRadius: 4, padding: 12, borderWidth: 1, borderColor: C.border, borderStyle: 'solid' }]}>
        <Text style={[s.sectionTitle, { marginBottom: 10 }]}>Progress Perancangan</Text>
        <ProgressBarRow label="Checklist" done={tasksDone} total={tasksTotal} />
        <ProgressBarRow label="Vendor Categories" done={vendorsDone} total={Math.max(vendorsTotal, 13)} />
        <ProgressBarRow label="RSVP Confirmation" done={stats?.rsvp_attending ?? 0} total={stats?.total_invited ?? 0} />
      </View>

      {/* Wedding details */}
      <SectionBar title="Maklumat Majlis" />
      <View style={[s.row, { marginBottom: 10 }]}>
        <View style={[s.col, { marginRight: 10 }]}>
          <Text style={s.label}>PENGANTIN LELAKI</Text>
          <Text style={s.value}>{wedding.groom_name}</Text>
          {wedding.groom_father_name && <Text style={s.smallNote}>Ayah: {wedding.groom_father_name}</Text>}
          {wedding.groom_mother_name && <Text style={s.smallNote}>Ibu: {wedding.groom_mother_name}</Text>}
        </View>
        <View style={s.col}>
          <Text style={s.label}>PENGANTIN PEREMPUAN</Text>
          <Text style={s.value}>{wedding.bride_name}</Text>
          {wedding.bride_father_name && <Text style={s.smallNote}>Ayah: {wedding.bride_father_name}</Text>}
          {wedding.bride_mother_name && <Text style={s.smallNote}>Ibu: {wedding.bride_mother_name}</Text>}
        </View>
      </View>
      <View style={s.row}>
        {wedding.wedding_date && (
          <View style={[s.col, { marginRight: 10 }]}>
            <Text style={s.label}>TARIKH MAJLIS</Text>
            <Text style={s.value}>{format(new Date(wedding.wedding_date), 'EEEE, d MMMM yyyy')}</Text>
          </View>
        )}
        {wedding.venue_name && (
          <View style={s.col}>
            <Text style={s.label}>LOKASI</Text>
            <Text style={s.value}>{wedding.venue_name}</Text>
            {wedding.venue_address && <Text style={s.smallNote}>{wedding.venue_address}</Text>}
          </View>
        )}
      </View>

      <Footer coupleName={coupleName} pageLabel="Overview" />
    </Page>
  )
}

// ─── Checklist Page ───────────────────────────────────────────────────────────
function ChecklistPage({ tasks, wedding }) {
  const coupleName = `${wedding.groom_name} & ${wedding.bride_name}`
  const grouped = groupBy(tasks ?? [], t => t.phase ?? 'OTHER')
  const phases = Object.keys(TASK_PHASE_LABEL).filter(p => grouped[p]?.length)
  if (grouped['OTHER']?.length) phases.push('OTHER')

  return (
    <Page size="A4" style={s.page}>
      <PageHeader title="Checklist Perancangan" coupleName={coupleName} />

      {tasks?.length === 0 && (
        <Text style={s.smallNote}>Tiada checklist ditambah.</Text>
      )}

      {phases.map(phase => (
        <View key={phase} style={s.section} wrap={false}>
          <SectionBar title={TASK_PHASE_LABEL[phase] ?? 'Lain-lain'} />
          {(grouped[phase] ?? []).map((task, i) => (
            <View key={task.id} style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              paddingVertical: 3,
              paddingHorizontal: 6,
              borderBottomWidth: i < grouped[phase].length - 1 ? 1 : 0,
              borderBottomColor: C.border,
              borderBottomStyle: 'solid',
            }}>
              <Text style={{ fontSize: 9, color: task.is_completed ? C.green : C.light, marginRight: 6, marginTop: 0.5 }}>
                {task.is_completed ? '✓' : '○'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.value, task.is_completed && { color: C.light, textDecoration: 'line-through' }]}>
                  {task.title}
                </Text>
                {task.due_date && (
                  <Text style={s.smallNote}>Due: {format(new Date(task.due_date), 'd MMM yyyy')}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ))}

      <Footer coupleName={coupleName} pageLabel="Checklist" />
    </Page>
  )
}

// ─── Budget Page ──────────────────────────────────────────────────────────────
function BudgetPage({ budget, currency, wedding }) {
  const coupleName = `${wedding.groom_name} & ${wedding.bride_name}`
  const grouped = groupBy(budget ?? [], i => i.category)
  const categories = Object.keys(grouped).sort()

  const totalEst  = (budget ?? []).reduce((s, i) => s + (i.estimated_amount ? parseFloat(i.estimated_amount) : 0), 0)
  const totalAct  = (budget ?? []).reduce((s, i) => s + (i.actual_amount ? parseFloat(i.actual_amount) : 0), 0)
  const totalPaid = (budget ?? []).reduce((s, i) => s + (i.paid_amount ? parseFloat(i.paid_amount) : 0), 0)

  return (
    <Page size="A4" style={s.page}>
      <PageHeader title="Bajet & Perbelanjaan" coupleName={coupleName} />

      {/* Summary row */}
      <View style={[s.row, { marginBottom: 14 }]}>
        {[
          ['Jumlah Anggaran', totalEst],
          ['Jumlah Sebenar', totalAct],
          ['Jumlah Dibayar', totalPaid],
          ['Had Bajet', wedding.budget_total ? parseFloat(wedding.budget_total) : null],
        ].map(([lbl, val]) => (
          <View key={lbl} style={[s.statBox, { marginHorizontal: 3 }]}>
            <Text style={[s.statNum, { fontSize: 11 }]}>{val != null ? `${currency} ${val.toLocaleString('en-MY', { minimumFractionDigits: 0 })}` : '—'}</Text>
            <Text style={s.statLabel}>{lbl}</Text>
          </View>
        ))}
      </View>

      {categories.length === 0 && <Text style={s.smallNote}>Tiada rekod bajet.</Text>}

      {categories.map(cat => (
        <View key={cat} style={s.section} wrap={false}>
          <SectionBar title={cat} />
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { flex: 3 }]}>Item</Text>
              <Text style={[s.th, { flex: 2, textAlign: 'right' }]}>Anggaran</Text>
              <Text style={[s.th, { flex: 2, textAlign: 'right' }]}>Sebenar</Text>
              <Text style={[s.th, { flex: 2, textAlign: 'right' }]}>Dibayar</Text>
            </View>
            {(grouped[cat] ?? []).map((item, i) => {
              const last = i === grouped[cat].length - 1
              return (
                <View key={item.id} style={last ? s.tRowLast : s.tRow}>
                  <Text style={[s.td, { flex: 3 }]}>{item.item_name}</Text>
                  <Text style={[s.tdMuted, { flex: 2, textAlign: 'right' }]}>{fmt(item.estimated_amount)}</Text>
                  <Text style={[s.tdMuted, { flex: 2, textAlign: 'right' }]}>{fmt(item.actual_amount)}</Text>
                  <Text style={[s.td, { flex: 2, textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>{fmt(item.paid_amount)}</Text>
                </View>
              )
            })}
          </View>
        </View>
      ))}

      <Footer coupleName={coupleName} pageLabel="Bajet" />
    </Page>
  )
}

// ─── Vendors Page ─────────────────────────────────────────────────────────────
function VendorsPage({ vendors, wedding }) {
  const coupleName = `${wedding.groom_name} & ${wedding.bride_name}`
  const sorted = [...(vendors ?? [])].sort((a, b) => a.category.localeCompare(b.category))

  return (
    <Page size="A4" style={s.page}>
      <PageHeader title="Direktori Vendor" coupleName={coupleName} />

      {sorted.length === 0 && <Text style={s.smallNote}>Tiada vendor ditambah.</Text>}

      <View style={s.table}>
        <View style={s.tHead}>
          <Text style={[s.th, { flex: 2 }]}>Kategori</Text>
          <Text style={[s.th, { flex: 3 }]}>Nama</Text>
          <Text style={[s.th, { flex: 2 }]}>Status</Text>
          <Text style={[s.th, { flex: 2 }]}>Telefon</Text>
          <Text style={[s.th, { flex: 2 }]}>Instagram</Text>
        </View>
        {sorted.map((v, i) => {
          const st = VENDOR_STATUS[v.vendor_status] ?? { label: v.vendor_status, color: C.gray, bg: C.grayBg }
          const last = i === sorted.length - 1
          return (
            <View key={v.id} style={i % 2 === 0 ? (last ? s.tRowLast : s.tRow) : (last ? { flexDirection: 'row', backgroundColor: C.bgAlt } : s.tRowAlt)}>
              <Text style={[s.td, { flex: 2, color: C.mid }]}>{v.category}</Text>
              <Text style={[s.td, { flex: 3, fontFamily: 'Helvetica-Bold' }]}>{v.name}</Text>
              <View style={[{ flex: 2, padding: 4, justifyContent: 'center' }]}>
                <Tag label={st.label} color={st.color} bg={st.bg} />
              </View>
              <Text style={[s.tdMuted, { flex: 2 }]}>{dash(v.phone)}</Text>
              <Text style={[s.tdMuted, { flex: 2 }]}>{v.instagram ? `@${v.instagram.replace('@','')}` : '—'}</Text>
            </View>
          )
        })}
      </View>

      <Footer coupleName={coupleName} pageLabel="Vendor" />
    </Page>
  )
}

// ─── Guests Page ──────────────────────────────────────────────────────────────
function GuestsPage({ guests, wedding }) {
  const coupleName = `${wedding.groom_name} & ${wedding.bride_name}`
  const attending    = guests.filter(g => g.rsvp_status === 'ATTENDING').length
  const notAttending = guests.filter(g => g.rsvp_status === 'NOT_ATTENDING').length
  const pending      = guests.filter(g => !g.rsvp_status || g.rsvp_status === 'PENDING').length
  const totalPax     = guests.reduce((s, g) => s + (g.pax_count || 1), 0)

  return (
    <Page size="A4" style={s.page}>
      <PageHeader title="Senarai Tetamu" coupleName={coupleName} />

      <View style={[s.row, { marginBottom: 14 }]}>
        {[
          ['Jumlah Tetamu', guests.length],
          ['Total Pax', totalPax],
          ['Hadir', attending],
          ['Tidak Hadir', notAttending],
          ['Belum Sahkan', pending],
        ].map(([lbl, val]) => (
          <View key={lbl} style={[s.statBox, { marginHorizontal: 2 }]}>
            <Text style={[s.statNum, { fontSize: 13 }]}>{val}</Text>
            <Text style={s.statLabel}>{lbl}</Text>
          </View>
        ))}
      </View>

      <View style={s.table}>
        <View style={s.tHead}>
          <Text style={[s.th, { width: 22 }]}>#</Text>
          <Text style={[s.th, { flex: 4 }]}>Nama</Text>
          <Text style={[s.th, { flex: 2 }]}>Hubungan</Text>
          <Text style={[s.th, { width: 30, textAlign: 'center' }]}>Pax</Text>
          <Text style={[s.th, { flex: 2 }]}>RSVP</Text>
          <Text style={[s.th, { flex: 2 }]}>Telefon</Text>
        </View>
        {guests.map((g, i) => {
          const rsvp = RSVP_STATUS[g.rsvp_status] ?? RSVP_STATUS.PENDING
          const last = i === guests.length - 1
          return (
            <View key={g.id} style={i % 2 === 0 ? (last ? s.tRowLast : s.tRow) : (last ? { flexDirection: 'row', backgroundColor: C.bgAlt } : s.tRowAlt)}>
              <Text style={[s.tdMuted, { width: 22 }]}>{i + 1}</Text>
              <Text style={[s.td, { flex: 4 }]}>{g.name}</Text>
              <Text style={[s.tdMuted, { flex: 2 }]}>{dash(g.relationship)}</Text>
              <Text style={[s.td, { width: 30, textAlign: 'center' }]}>{g.pax_count ?? 1}</Text>
              <View style={{ flex: 2, padding: 4, justifyContent: 'center' }}>
                <Tag label={rsvp.label} color={rsvp.color} bg={rsvp.bg} />
              </View>
              <Text style={[s.tdMuted, { flex: 2 }]}>{dash(g.phone)}</Text>
            </View>
          )
        })}
      </View>

      <Footer coupleName={coupleName} pageLabel="Tetamu" />
    </Page>
  )
}

// ─── Rundown Page ─────────────────────────────────────────────────────────────
function RundownPage({ rundown, wedding }) {
  const coupleName = `${wedding.groom_name} & ${wedding.bride_name}`
  const grouped = groupBy(rundown ?? [], r => r.majlis ?? 'UMUM')

  return (
    <Page size="A4" style={s.page}>
      <PageHeader title="Rundown Hari Majlis" coupleName={coupleName} />

      {Object.entries(grouped).map(([majlis, entries]) => (
        <View key={majlis} style={s.section} wrap={false}>
          <SectionBar title={majlis} />
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: 55 }]}>Masa</Text>
              <Text style={[s.th, { flex: 4 }]}>Aktiviti</Text>
              <Text style={[s.th, { flex: 2 }]}>PIC</Text>
              <Text style={[s.th, { flex: 3 }]}>Nota</Text>
            </View>
            {entries.map((e, i) => {
              const last = i === entries.length - 1
              const timeStr = e.start_time
                ? (e.end_time ? `${e.start_time} - ${e.end_time}` : e.start_time)
                : '—'
              return (
                <View key={e.id} style={last ? s.tRowLast : s.tRow}>
                  <Text style={[s.td, { width: 55, fontFamily: 'Helvetica-Bold' }]}>{timeStr}</Text>
                  <Text style={[s.td, { flex: 4 }]}>{e.activity}</Text>
                  <Text style={[s.tdMuted, { flex: 2 }]}>{dash(e.pic)}</Text>
                  <Text style={[s.tdMuted, { flex: 3 }]}>{dash(e.notes)}</Text>
                </View>
              )
            })}
          </View>
        </View>
      ))}

      <Footer coupleName={coupleName} pageLabel="Rundown" />
    </Page>
  )
}

// ─── Hantaran Page ────────────────────────────────────────────────────────────
function HantaranPage({ hantaran, wedding, currency }) {
  const coupleName = `${wedding.groom_name} & ${wedding.bride_name}`
  const grouped = groupBy(hantaran ?? [], h => h.side)

  return (
    <Page size="A4" style={s.page}>
      <PageHeader title="Senarai Hantaran" coupleName={coupleName} />

      {Object.entries(grouped).map(([side, items]) => (
        <View key={side} style={s.section} wrap={false}>
          <SectionBar title={side === 'GROOM' ? 'Pihak Lelaki' : side === 'BRIDE' ? 'Pihak Perempuan' : side} />
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { width: 35 }]}>Dulang</Text>
              <Text style={[s.th, { flex: 3 }]}>Item</Text>
              <Text style={[s.th, { flex: 2 }]}>Kategori</Text>
              <Text style={[s.th, { flex: 2 }]}>Status</Text>
              <Text style={[s.th, { flex: 2, textAlign: 'right' }]}>Kos Anggaran</Text>
            </View>
            {items.map((h, i) => {
              const last = i === items.length - 1
              return (
                <View key={h.id} style={i % 2 === 0 ? (last ? s.tRowLast : s.tRow) : (last ? { flexDirection: 'row', backgroundColor: C.bgAlt } : s.tRowAlt)}>
                  <Text style={[s.td, { width: 35, textAlign: 'center' }]}>{h.dulang_number ?? '—'}</Text>
                  <Text style={[s.td, { flex: 3, fontFamily: 'Helvetica-Bold' }]}>{h.name}</Text>
                  <Text style={[s.tdMuted, { flex: 2 }]}>{h.category}</Text>
                  <Text style={[s.tdMuted, { flex: 2 }]}>{h.item_status}</Text>
                  <Text style={[s.tdMuted, { flex: 2, textAlign: 'right' }]}>
                    {h.estimated_cost ? `${currency} ${parseFloat(h.estimated_cost).toLocaleString('en-MY', { minimumFractionDigits: 2 })}` : '—'}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>
      ))}

      <Footer coupleName={coupleName} pageLabel="Hantaran" />
    </Page>
  )
}

// ─── Menu Page ────────────────────────────────────────────────────────────────
function MenuPage({ menu, wedding }) {
  const coupleName = `${wedding.groom_name} & ${wedding.bride_name}`
  const grouped = groupBy(menu ?? [], m => m.category)

  return (
    <Page size="A4" style={s.page}>
      <PageHeader title="Menu Majlis" coupleName={coupleName} />

      {Object.entries(grouped).map(([cat, items]) => (
        <View key={cat} style={s.section} wrap={false}>
          <SectionBar title={cat} />
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.th, { flex: 4 }]}>Hidangan</Text>
              <Text style={[s.th, { flex: 1, textAlign: 'center' }]}>Halal</Text>
              <Text style={[s.th, { flex: 1, textAlign: 'center' }]}>Veg</Text>
              <Text style={[s.th, { flex: 1, textAlign: 'center' }]}>Confirm</Text>
              <Text style={[s.th, { flex: 3 }]}>Nota</Text>
            </View>
            {items.map((m, i) => {
              const last = i === items.length - 1
              return (
                <View key={m.id} style={i % 2 === 0 ? (last ? s.tRowLast : s.tRow) : (last ? { flexDirection: 'row', backgroundColor: C.bgAlt } : s.tRowAlt)}>
                  <Text style={[s.td, { flex: 4 }]}>{m.item_name}</Text>
                  <Text style={[s.td, { flex: 1, textAlign: 'center', color: m.is_halal ? C.green : C.light }]}>{m.is_halal ? '✓' : '—'}</Text>
                  <Text style={[s.td, { flex: 1, textAlign: 'center', color: m.is_vegetarian ? C.green : C.light }]}>{m.is_vegetarian ? '✓' : '—'}</Text>
                  <Text style={[s.td, { flex: 1, textAlign: 'center', color: m.is_confirmed ? C.green : C.amber }]}>{m.is_confirmed ? '✓' : '○'}</Text>
                  <Text style={[s.tdMuted, { flex: 3 }]}>{dash(m.notes)}</Text>
                </View>
              )
            })}
          </View>
        </View>
      ))}

      <Footer coupleName={coupleName} pageLabel="Menu" />
    </Page>
  )
}

// ─── Main Document ────────────────────────────────────────────────────────────
export default function JourneyBook({ wedding, stats, currency = 'MYR', budget = [], vendors = [], guests = [], tasks = [], rundown = [], hantaran = [], menu = [] }) {
  return (
    <Document
      title={`PlanLuhh Journey Book — ${wedding.groom_name} & ${wedding.bride_name}`}
      author="PlanLuhh"
      creator="PlanLuhh"
    >
      <CoverPage wedding={wedding} />
      <OverviewPage wedding={wedding} stats={stats} tasks={tasks} vendors={vendors} budget={budget} />
      {tasks.length > 0 && <ChecklistPage tasks={tasks} wedding={wedding} />}
      {budget.length > 0 && <BudgetPage budget={budget} currency={currency} wedding={wedding} />}
      {vendors.length > 0 && <VendorsPage vendors={vendors} wedding={wedding} />}
      {guests.length > 0 && <GuestsPage guests={guests} wedding={wedding} />}
      {rundown.length > 0 && <RundownPage rundown={rundown} wedding={wedding} />}
      {hantaran.length > 0 && <HantaranPage hantaran={hantaran} wedding={wedding} currency={currency} />}
      {menu.length > 0 && <MenuPage menu={menu} wedding={wedding} />}
    </Document>
  )
}

// ─── Missing import ───────────────────────────────────────────────────────────
function differenceInDays(a, b) {
  return Math.round((a - b) / (1000 * 60 * 60 * 24))
}

# PlanLuhh — Product Documentation

> Wedding planning app for Malaysian couples. Plan everything from akad nikah to honeymoon in one place.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, React Router v6, React Query v3, Framer Motion, Tailwind CSS, Lucide React |
| Backend | FastAPI (Python), SQLAlchemy ORM, Alembic |
| Database | PostgreSQL |
| Infra | Docker Compose (3 containers: db, backend, frontend) |
| Security | JWT in HttpOnly cookies, AES encryption for financial fields |

---

## Auth Flow

```
Email → OTP (6-digit) → Set Password → Login
```

- Currency: **MYR (default)** — Malaysia-focused
- Forgot password: email reset link
- JWT stored in HttpOnly cookie (not localStorage)

---

## Navigation Structure

```
Dashboard
├── Foundation
│   ├── Budget
│   ├── Moodboard
│   ├── Vendors
│   └── Document Hub
├── Planning
│   ├── Schedule
│   ├── Rundown
│   ├── Checklist
│   ├── Guests
│   ├── Menu
│   └── Hantaran
├── Execution
│   ├── E-Invitation
│   ├── RSVP Dashboard
│   └── Seating
└── Post-Wedding
    ├── Gift Registry
    └── Honeymoon
```

---

## Implementation Status

| Feature | Status |
|---|---|
| Auth (Register/OTP/Login) | ✅ Done |
| Dashboard + Wedding Settings | ✅ Done |
| Budget | ✅ Done |
| Profile Page | ✅ Done |
| Moodboard | ✅ Done |
| Vendors | ✅ Done |
| Document Hub | ✅ Done |
| Schedule | ✅ Done |
| Rundown | ✅ Done |
| Checklist / Tasks | ✅ Done |
| Guests | ✅ Done |
| Menu | ✅ Done |
| Hantaran | ✅ Done |
| E-Invitation Builder | ✅ Done |
| RSVP Dashboard | ✅ Done |
| Seating | ✅ Done |
| Gift Registry | ✅ Done |
| Honeymoon | ✅ Done |

> Note: All backend APIs are fully implemented. Only the frontend UI is pending for stub pages.

---

## Data Model Gaps (Needs DB Migration)

The `Wedding` model currently has one `wedding_date` and `venue_name`. For Malaysia weddings (separate akad + sanding events, possibly different days per side), we need to add:

```
tarikh_nikah          Date
waktu_nikah           Time
tarikh_sanding_perempuan  Date
waktu_sanding_perempuan   Time
tarikh_sanding_lelaki     Date  (if different from perempuan)
waktu_sanding_lelaki      Time
venue_nikah           String
venue_sanding_perempuan   String
venue_sanding_lelaki      String
tema_warna_nikah      String  (hex or color name)
tema_warna_sanding    String
jumlah_tetamu_expected    Integer
```

---

## Feature Specs

---

### 0. Profile Page ✅

**Route**: `/dashboard/profile` — accessible via user name/avatar link at bottom of sidebar.

**Fields:**
- Email (read-only — cannot be changed)
- Full Name (editable)
- Phone (editable)
- Currency display: MYR (read-only — fixed for Malaysia)
- Change Password section: Current Password → New Password → Confirm (with live strength rules checklist)

---

### 1. Dashboard

**Route**: `/dashboard`

**Top 4 Stat Cards:**

| Card | Source |
|---|---|
| Total Guest | Expected pax from Guest list vs RSVP confirmed pax |
| Total Damage | Sum of `paid_amount` across all Budget items |
| RSVP Status | "X / Y hadir (Z%)" from RSVP responses |
| Confirmed Vendors | Vendors with BOOKED+ status / total categories |

**Progress Section:**
- Checklist: tasks completed / total (%)
- Vendor Categories: confirmed categories / total (%)

**Wedding Settings Form:**

*Pengantin*
- Nama Pengantin Lelaki
- Nama Pengantin Perempuan

*Penjaga — untuk E-Card*
- Pihak Lelaki: Ayah/Penjaga 1, Emak/Penjaga 2
- Pihak Perempuan: Ayah/Penjaga 1, Emak/Penjaga 2

*Event Details — 3 sub-sections (✅ built, migration `b2c3d4e5f6a7` applied):*
- **Akad Nikah**: Tarikh, Waktu, Venue, Tema/Warna
- **Sanding Pihak Perempuan**: Tarikh, Waktu, Venue
- **Sanding Pihak Lelaki**: Tarikh, Waktu, Venue, Tema/Warna
- **Main row**: Tarikh Utama (countdown), Venue Utama, Budget Ceiling (RM)

---

### 2. Budget

**Route**: `/dashboard/budget`

**Summary Cards:** Budget Ceiling | Total Estimated | Total Actual | Total Paid

**Budget Usage Bar:** Estimated / Ceiling. Turns red if over budget.

**Categories:** Dynamic — user creates their own category names. Suggestions on first use:
> Wedding Planner, Venue, Tok Kadi/Jurunikah, Florist/Bunga, Photographer, Videographer, Caterer, Cake, Entertainment/Band/DJ, Transportation, Accommodations, MUA, Hair Stylist, Stationer/Kad Kahwin, Jewellery/Cincin, Apparel/Baju Sanding, Honeymoon, Misc.

**Table Columns (per item):**
- Item Name
- Category
- Estimated (RM)
- Actual (RM)
- Paid (RM)
- Payment By: `Pihak Lelaki` / `Pihak Perempuan` / `Bersama`
- Due Date
- Status: `Paid` / `Pending` / `Overdue`
- Created At

**Main Table:** Auto-calculated sum of all category items.

**Export:** PDF + Excel

---

### 3. Moodboard

**Route**: `/dashboard/moodboard`

**Purpose:** Visual inspiration board for wedding planning.

**Categories (tabs):**
1. Apparel / Baju Sanding
2. Cake / Kek Kahwin
3. Decoration
4. Flowers / Bunga
5. Venue
6. Pelamin
7. Henna
8. Hair & Makeup
9. ➕ Add Custom Category

**Per item:**
- Image upload (from device) OR paste link (Pinterest, Instagram, Google Images)
- Title
- Caption/Notes
- Color hex (for palette inspiration)

**Layout:** Pinterest-style masonry grid per category tab.

---

### 4. Vendors

**Route**: `/dashboard/vendors`

**Views (tabs):**
1. **Semua** — all vendors in the research pipeline
2. **By Category** — filter by vendor type
3. **Confirmed** — vendors with status BOOKED or higher

**Vendor Status Flow:**
```
Prospect → Contacted → Booked → Deposit Paid → Fully Paid → Completed
```
(Also: `Cancelled`)

**Table Columns:**
- Name
- Category
- Status (color-coded badge)
- Address
- Contact Name (PIC)
- Phone
- Email
- Quotation / Price
- Remarks
- Created At

**Vendor Detail:**
- All fields above
- Upload documents (Contract, Invoice, Receipt, Other)
- Review: Rating 1–5 stars, Notes, Would Recommend

**Comparison View:**
Select up to 3 vendors from the same category → side-by-side card comparison (Name, Price, Rating, Status, Contact)

**Custom Categories:** User can add custom category names beyond the defaults.

---

### 5. Document Hub

**Route**: `/dashboard/documents`

**Purpose:** Official document checklist + file vault for both sides.

**Checklist — Kedua-dua Pihak (Both):**
- [ ] Kursus Pra-Perkahwinan
- [ ] Borang Nikah / Online BRIS
- [ ] Ujian HIV *(6-month validity — shows expiry date + reminder)*
- [ ] Gambar Passport
- [ ] Fotostat IC
- [ ] Jumpa Kariah untuk Pengesahan
- [ ] Hantar Borang ke Pejabat Agama
- [ ] Tempah Jurunikah / Tok Kadi
- [ ] Tentukan Tarikh & Waktu Nikah *(links to Wedding Settings)*
- [ ] Tentukan Lokasi Akad Nikah *(links to Wedding Settings)*
- [ ] Cincin *(reminder: add to Budget → Jewellery)*
- [ ] Upah Tok Kadi *(reminder: add to Budget → Tok Kadi)*
- [ ] Upah Saksi *(reminder: add to Budget → Tok Kadi)*

**Checklist — Pihak Perempuan:**
- [ ] Kenal Pasti Wali
- [ ] 2 Orang Saksi (Lelaki)

**Checklist — Pihak Lelaki:**
- [ ] Mas Kahwin (amount + form: Dinar / Kadar Negeri / Jumlah Khusus / Barang Kemas)
- [ ] Wang Hantaran *(optional)*

**Per checklist item:**
- Check/uncheck
- Notes
- File upload
- Due date
- Expiry date *(for HIV test)*

**Document Vault tab:** Grid of all uploaded files with preview + download.

---

### 6. Schedule

**Route**: `/dashboard/schedule`

**Purpose:** Pre-wedding timeline and appointment tracker.

**Event Types:**
- Kursus Pra-Perkahwinan
- Pergi Pejabat Agama
- Sesi Fitting Baju
- Sesi Ukur Cincin
- Sesi MUA Trial
- Sesi Foto Pre-Wedding
- Nikah
- Sanding Pihak Perempuan
- Sanding Pihak Lelaki
- Lain-lain

**Fields:** Event Name, Type, Date, Start Time, End Time, Location, Responsible Person, Notes

**Layout:** Timeline view (chronological) with list fallback.

---

### 7. Rundown / Programme

**Route**: `/dashboard/rundown`

**Purpose:** Minit-seminit script for hari majlis (aturcara).

**Separate rundowns for:**
- Majlis Akad Nikah
- Majlis Sanding Pihak Perempuan
- Majlis Sanding Pihak Lelaki

**Per entry:**
- Start Time – End Time
- Sesi / Activity
- Responsible Person / PIC
- Remarks

**Pre-populated suggestions:**
- Ketibaan Tetamu
- Perarakan masuk pengantin (lelaki/perempuan)
- Sesi salam restu
- Makan beradab
- Sesi potong kek
- Persandingan

**Extras:** Background song for each sesi (from Senarai Lagu)

**Export:** PDF for rundown script

---

### 8. Checklist / Tasks

**Route**: `/dashboard/tasks`

**Purpose:** General wedding to-do list by planning phase.

**Phases:**
| Phase | Timing |
|---|---|
| Phase 1: Research | 6–12 months before |
| Phase 2: Booking | 3–6 months before |
| Phase 3: Preparation | 1–3 months before |
| Phase 4: Final Checks | 1–4 weeks before |
| Big Day | — |
| Post-Wedding | — |

**Per Task:** Title, Description, Phase, Due Date, Assigned To (Self / Partner), Is Completed

**Pre-populated examples:**
- [ ] Tentukan tarikh nikah & sanding
- [ ] Tentukan tema warna / konsep majlis
- [ ] Tentukan bilangan jemputan
- [ ] Tempah pakej kahwin / venue
- [ ] Tempah MUA nikah & sanding
- [ ] Tempah photographer & videographer
- [ ] Tempah baju pengantin
- [ ] Tentukan pelamin
- [ ] Tempah penginapan untuk ahli keluarga
- [ ] Kursus Pra-Perkahwinan

---

### 9. Guests

**Route**: `/dashboard/guests`

**Purpose:** Guest list management with RSVP sync.

**Columns:**
- Name
- Side: `Pihak Lelaki` / `Pihak Perempuan` / `Kedua-dua`
- Expected Pax
- RSVP Status: `Pending` / `Hadir` / `Tidak Hadir` / `Maybe`
- Confirmed Pax (from RSVP response)
- Assigned Table
- Meal Preference
- Allergies
- Phone / Email
- Is VIP
- Notes

**Top Stats:** Total Expected Pax | Hadir | Tidak Hadir | Pending

**Import:** Bulk via Excel/CSV

**Export:** PDF guest list

**RSVP Sync:** Responses from the public E-Invitation automatically update guest RSVP status here.

---

### 10. Menu

**Route**: `/dashboard/menu`

**Purpose:** Plan and track food menu.

**Two modes (user picks one):**

**Mode 1 — Caterer:** Menu handled by vendor. Link to vendor (under Caterer category). Track what dishes were agreed.

**Mode 2 — Rewang:** Self-organized. Manually add all dishes + quantities.

**Categories:** Hidangan Utama | Lauk Pauk | Pencuci Mulut | Minuman | Pembuka Selera | Lain-lain

**Per item:** Name, Category, Is Vegetarian, Is Halal, Is Confirmed, Notes, Quantity *(rewang mode)*

---

### 11. Hantaran Tracker

**Route**: `/dashboard/hantaran`

**Purpose:** Track dulang hantaran gifts for both sides.

**Two sides:**
- Pihak Lelaki → Perempuan
- Pihak Perempuan → Lelaki

**Dulang arrangement options** (from adat):
- Wang hantaran sahaja
- Barang kemas sahaja
- Mas kahwin + barang kemas
- Mas kahwin + barang kemas + wang hantaran
- Wang hantaran + barang kemas

**Per item:**
- Nama Barang
- Category: Barang Kemas / Pakaian / Kosmetik / Makanan / Aksesori / Lain-lain
- Estimated Cost *(links to Budget)*
- Status: `Belum Beli` / `Dah Beli` / `Sudah Gubah` / `Siap`
- Notes

**Dulang Count:** Track total (tradition: odd number)

---

### 12. E-Invitation Builder

**Route**: `/dashboard/invitation`

**Public URL**: `/i/{uuid-slug}` (UUID-based, not guessable)

**Purpose:** Build + publish a digital wedding invitation with animated opener and rich content sections.

**Language toggle:** Malay / English / Dual

**Access:** Only Owner can publish/unpublish.

---

#### Builder Sections

**Section 1 — Opening (Animated Opener)**

What guests see first before the invitation "opens."

| Setting | Options |
|---|---|
| Opening Style | Envelope Wax, Slide Up, Doors, Fade Out, Envelope |
| Background Color | Color picker |
| Envelope Theme | Classic Cream, Elegant White, Vintage Rose, Sage Green, Dusty Blue, Crimson Plum, Custom |
| Envelope Liner | None, Liner 1–4 |
| Subtitle text | e.g. "Wedding Celebration" — font, size, X/Y position |
| Main text | e.g. "You are invited" — font, size, X/Y position |

---

**Section 2 — Event Intro (Hero)**

| Setting | Source |
|---|---|
| Event Type label | User types (suggestions: Walimatul Urus, Majlis Perkahwinan, Raja Sehari…) |
| Bride & Groom Names | Auto-pulled from Wedding Settings (editable override) |
| Event Date & Time | Auto-pulled from Wedding Settings |
| Venue | Auto-pulled |
| Show Day name | Toggle (e.g. "Sabtu") |
| Text Alignment | Left / Center / Right |

---

**Section 3 — Host Message (Jemputan)**

Formal invitation message. Template (fully editable):

```
Dengan segala hormatnya kami,

[Ayah Lelaki]
&
[Ibu Lelaki]
(PIHAK PENGANTIN LELAKI)

bersama

[Ayah Perempuan]
&
[Ibu Perempuan]
(PIHAK PENGANTIN PEREMPUAN)

Dengan penuh rasa kesyukuran, kami ingin menjemput

Datuk Seri / Datin Seri / Dato / Datin / Tuan / Puan / Encik / Cik

ke majlis perkahwinan anakanda kami,

[Nama Pengantin Lelaki] & [Nama Pengantin Perempuan]
```

- Parent names auto-pulled from Wedding Settings
- Couple names auto-pulled
- All text blocks: font picker + size
- User can edit any part of the message

---

**Section 4 — Event Details**

- Full event card per majlis (Nikah, Sanding Perempuan, Sanding Lelaki if different dates)
- Date, Time, Venue per event
- Waze link + Google Maps link (auto-generated from venue address/coordinates)

---

**Section 5 — Itinerary (Aturcara)**

- User adds rows: Start Time – End Time, Activity
- Examples: "10:00 — Ketibaan Tetamu", "12:00 — Persandingan"

---

**Section 6 — Love Story**

- Timeline entries: Year, Title, Description, optional photo
- Drag-and-drop sort order

---

**Section 7 — Photo Gallery**

- Upload from device or URL
- Caption per photo
- Masonry / grid layout

---

**Section 8 — RSVP Form** *(toggle on/off)*

Guests fill in: Name, Phone, Attendance (Hadir / Tidak Hadir / Maybe), Pax count, Meal preference, Message. Responses feed RSVP Dashboard.

---

**Section 9 — Digital Guestbook / Wishes** *(toggle on/off)*

Guests leave messages. Owner moderates (approve before display).

---

**Section 10 — QR DuitNow** *(toggle on/off)*

Upload QR image or enter DuitNow number. Optional amount display.

---

**Section 11 — Gift Registry** *(toggle on/off)*

- User adds items: Name, Link (Shopee, Amazon, etc.), Target Quantity
- **Claim logic**: Guest clicks "Beli" → item marked as claimed → button disabled + shows "Dah ditempah"
  - "View" link always stays active
  - If quantity > 1: tracks "X claimed / Y total"
- Prevents duplicate purchases

---

**Section 12 — Contact Persons**

- PIC cards per side (Pihak Lelaki, Pihak Perempuan)
- Name, Role (e.g. "Pengapit", "Adik"), Phone
- Click-to-call + WhatsApp link

---

**Section 13 — Custom Message**

Free-text personal note to guests. Font + size control.

---

### 13. RSVP Dashboard

**Route**: `/dashboard/rsvp`

**Purpose:** Real-time view of RSVP responses from E-Invitation.

**Stats:** Total Responses | Hadir (pax) | Tidak Hadir | Maybe | Pending

**Table:** Guest Name, Phone, Response, Pax, Meal Preference, Allergies, Message, Submitted At

**Sync:** Auto-links to Guest list — updates guest RSVP status when matched.

---

### 14. Seating

**Route**: `/dashboard/seating`

**Purpose:** Assign confirmed guests to tables.

**Table setup:** Table Number/Name, Capacity (default 10 pax)

**Assignment:** Drag-and-drop guests onto tables OR select from dropdown. Shows pax vs capacity. Warns if over capacity. Lists unassigned guests on the side.

**Based on:** RSVP-confirmed pax only.

---

### 15. Gift Registry

**Route**: `/dashboard/gifts`

**Two parts:**

**Part A — Registry Management** *(linked to E-Invitation Section 11)*
- Item Name, Link, Target Quantity, Claimed Count, Status (Available / Claimed / Partially Claimed)

**Part B — Gifts Received Tracker** *(post-wedding)*
- Donor Name, Gift Description, Value/Amount, Type (Physical / Cash / eWallet / Registry Item), Thank You Sent (boolean), Notes, Date Received

---

### 16. Honeymoon

**Route**: `/dashboard/honeymoon`

**Destination Comparison (Option 1 vs Option 2):**
- Location, Dates, Duration
- Season / Weather
- Exchange Rate
- Travel Agent + Deposit + Total
- Flight: Date, Departure/Arrival, Airline, Ticket Price, Baggage
- Accommodation: Hotel, Check-in/out, Price/night, Total

**Budget Tracker:**
- Item | Budget | Actual | Deposit | Balance
- Categories: Flight, Hotel, Transport, Activities, Food, Shopping, Misc

**Itinerary:** Day-by-day | Date, Time, Activity, Remarks

**Packing List:**
- Pakaian (kasual, formal, swimwear, baju tidur, kasut, topi, sunglasses)
- Dokumen (passport, visa, IC, insuran, itinerari, hotel booking, flight, kad kredit, mata wang tempatan, lesen memandu antarabangsa)
- Elektronik (pengecas, powerbank, universal adapter, kamera)
- Toiletries & Kecantikan
- Lain-lain

---

## User Roles (RBAC)

| Role | Access |
|---|---|
| Owner / Admin (Pengantin) | Full access to all modules, can publish E-Invitation, invite partner |
| Partner (Bride/Groom) | Shared editing for all planning modules |
| Coordinator *(optional)* | View-only: Schedule, Rundown, Guest List |

---

## Security

- E-Invitation URLs use UUID slug — not sequential, not guessable
- Financial data (budget amounts, vendor prices) encrypted at rest (AES)
- Uploaded sensitive documents (IC, HIV results) should be encrypted at rest
- JWT in HttpOnly cookies
- Password: min 8 chars, uppercase, lowercase, number

---

## Reference Materials

Sourced from a physical Malaysian wedding planner book (buku wedding planner). Key sections used:
- Prosedur Perkahwinan (nikah procedure, documents required)
- Checklist Perkahwinan
- Vendor categories and quotation sheets (both pihak)
- Rundown / Aturcara Majlis
- Kit Kecemasan Hari Majlis
- Soalan Lazim Akad Nikah (FAQ for tok kadi questions)
- Tugasan Semasa Majlis (day-of duties)
- Senarai Lagu Majlis
- Honeymoon packing list and itinerary template
- Love Quiz & Soalan Sebelum Kahwin
- Hantaran dulang arrangement options

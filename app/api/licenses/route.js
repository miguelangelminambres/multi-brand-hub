import { NextResponse } from 'next/server';

const LICENSES = process.env.LICENSE_CODES?.split(',') || [
  'MBH-2025-A7K9-P3X1',
  'MBH-2025-B2M4-Q8Y6',
  'MBH-2025-C5N7-R1Z9',
  'MBH-2025-D8P3-S4W2',
  'MBH-2025-E1Q6-T7V5',
  'MBH-2025-F4R9-U2X8',
  'MBH-2025-G7S2-V5Y1',
  'MBH-2025-H3T5-W8Z4',
  'MBH-2025-I6U8-X1A7',
  'MBH-2025-J9V1-Y4B3',
  'MBH-2025-K2W4-Z7C6',
  'MBH-2025-L5X7-A3D9',
  'MBH-2025-M8Y3-B6E2',
  'MBH-2025-N1Z6-C9F5',
  'MBH-2025-O4A9-D2G8',
  'MBH-2025-P7B2-E5H1',
  'MBH-2025-Q3C5-F8I4',
  'MBH-2025-R6D8-G1J7',
  'MBH-2025-S9E1-H4K3',
  'MBH-2025-T2F4-I7L6'
];

export async function GET() {
  return NextResponse.json({ licenses: LICENSES });
}
```
4. Commit

---

### **PASO 3: Verificar la estructura final**

La **página principal** de tu repositorio debe verse así:
```
multi-brand-hub/
├── app/
│   ├── api/
│   │   └── licenses/
│   │       └── route.js
│   ├── globals.css  ← Nota: .css (no .cs)
│   ├── layout.js
│   └── page.js
├── next.config.js
├── package.json
├── postcss.config.js
└── tailwind.config.js

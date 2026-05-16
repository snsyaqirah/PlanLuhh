import floral1  from '@/assets/img/invitation/style/floral/Wedding Floral 1.png'
import floral2  from '@/assets/img/invitation/style/floral/Wedding Floral 2.png'
import floral3  from '@/assets/img/invitation/style/floral/Wedding Floral 3.png'
import floral4  from '@/assets/img/invitation/style/floral/Wedding Floral 4.png'
import floral5  from '@/assets/img/invitation/style/floral/Wedding Floral 5.png'
import floral6  from '@/assets/img/invitation/style/floral/Wedding Floral 6.png'
import floral7  from '@/assets/img/invitation/style/floral/Wedding Floral 7.png'
import floral8  from '@/assets/img/invitation/style/floral/Wedding Floral 8.png'
import floral9  from '@/assets/img/invitation/style/floral/Wedding Floral 9.png'
import floral10 from '@/assets/img/invitation/style/floral/Wedding Floral 10.png'
import trad1  from '@/assets/img/invitation/style/traditional/Wedding Traditional 1.png'
import trad2  from '@/assets/img/invitation/style/traditional/Wedding Traditional 2.png'
import trad3  from '@/assets/img/invitation/style/traditional/Wedding Traditional 3.png'
import trad4  from '@/assets/img/invitation/style/traditional/Wedding Traditional 4.png'
import trad5  from '@/assets/img/invitation/style/traditional/Wedding Traditional 5.png'
import trad6  from '@/assets/img/invitation/style/traditional/Wedding Traditional 6.png'
import trad7  from '@/assets/img/invitation/style/traditional/Wedding Traditional 7.png'
import trad8  from '@/assets/img/invitation/style/traditional/Wedding Traditional 8.png'
import trad9  from '@/assets/img/invitation/style/traditional/Wedding Traditional 9.png'
import trad10 from '@/assets/img/invitation/style/traditional/Wedding Traditional 10.png'

export const DESIGN_CATEGORIES = [
  {
    key: 'floral',
    label: 'Floral',
    emoji: '🌸',
    designs: [floral1,floral2,floral3,floral4,floral5,floral6,floral7,floral8,floral9,floral10]
      .map((src, i) => ({ id: i + 1,  label: `Floral ${i + 1}`,      src })),
  },
  {
    key: 'traditional',
    label: 'Tradisional',
    emoji: '🪷',
    designs: [trad1,trad2,trad3,trad4,trad5,trad6,trad7,trad8,trad9,trad10]
      .map((src, i) => ({ id: i + 11, label: `Traditional ${i + 1}`, src })),
  },
]

export const ALL_DESIGNS = DESIGN_CATEGORIES.flatMap(c => c.designs)

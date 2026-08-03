export interface PickupPoint {
  id: string
  name: string
  address: string
  phone: string
  hours: string
  lat: number
  lng: number
  type: 'express' | 'standard' | 'locker'
  note?: string
}

export const TURKMENABAT_PICKUP_POINTS: PickupPoint[] = [
  {
    id: 'tp-01',
    name: 'DTC Express — Центр города',
    address: 'ул. Битарапчылык, 12, Туркменабат, Лебапский велаят',
    phone: '+993 422 6-11-00',
    hours: 'Пн–Сб: 9:00–21:00 · Вс: 10:00–18:00',
    lat: 39.0826,
    lng: 63.5691,
    type: 'express',
    note: 'Готово в течение 2 часов для товаров в наличии',
  },
  {
    id: 'tp-02',
    name: 'DTC Standard — Северный рынок',
    address: 'ул. Гёроглы, 47, Туркменабат, Лебапский велаят',
    phone: '+993 422 6-22-50',
    hours: 'Пн–Пт: 9:00–19:00 · Сб: 10:00–17:00',
    lat: 39.098,
    lng: 63.5605,
    type: 'standard',
  },
  {
    id: 'tp-03',
    name: 'DTC Постамат — Ж/Д Вокзал',
    address: 'Железнодорожный вокзал Туркменабат, Платформа 1',
    phone: '+993 422 6-33-80',
    hours: '24 / 7',
    lat: 39.0718,
    lng: 63.5747,
    type: 'locker',
    note: 'Самообслуживание, PIN-код отправляется по SMS',
  },
]

export const CITY_CENTER: [number, number] = [39.0826, 63.565]

// ─── Working hours ────────────────────────────────────────────────────────────

export const WORKING_HOURS = [
  { day: 'Понедельник', hours: '10:00 – 19:00', open: true },
  { day: 'Вторник', hours: '10:00 – 18:00', open: true },
  { day: 'Среда', hours: '10:00 – 18:00', open: true },
  { day: 'Четверг', hours: '10:00 – 18:00', open: true },
  { day: 'Пятница', hours: '10:00 – 18:00', open: true },
  { day: 'Суббота', hours: '10:00 – 16:00', open: true },
  { day: 'Воскресенье', hours: 'Выходной', open: false },
]

export type WorkingHourEntry = (typeof WORKING_HOURS)[number]

// ─── Pickup instruction steps ─────────────────────────────────────────────────

export const PICKUP_STEPS = [
  {
    step: '01',
    title: 'Оформите заказ',
    body: 'Выберите «Самовывоз» при оформлении и укажите удобный пункт выдачи.',
  },
  {
    step: '02',
    title: 'Дождитесь уведомления',
    body: 'Вы получите SMS или звонок, как только Ваш заказ будет готов.',
  },
  {
    step: '03',
    title: 'Проверьте и заберите',
    body: 'Подтвердите номер заказа и осмотрите товар до выхода из пункта.',
  },
] as const

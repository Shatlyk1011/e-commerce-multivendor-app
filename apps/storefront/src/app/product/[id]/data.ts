// Complete product interface
export interface ProductDetail {
  id: string
  title: string
  price: string
  originalPrice: string | null
  installmentPrice: string
  rating: number
  reviewsCount: number
  questionsCount: number
  articleNumber: string
  badges: string[]
  brand: string
  optionsLabel: string
  options: string[]
  specs: { [key: string]: string }
  categoryPath: string[]
  merchant: {
    name: string
    rating: number
    orders: string
    verified: boolean
  }
}

export const PRODUCT_DATABASE: Record<string, ProductDetail> = {
  '3060163799': {
    id: '3060163799',
    title: 'JBEE 24" Монитор 120 герц, FULL-HD, IPS (T2405), IPS, 1920x1080 Full HD, 120 Гц, черный',
    price: '163,87 $',
    originalPrice: '294,68 $',
    installmentPrice: '14,15 $/мес',
    rating: 4.8,
    reviewsCount: 5634,
    questionsCount: 965,
    articleNumber: '3060163799',
    badges: ['РАСПРОДАЖА'],
    brand: 'JBEE',
    optionsLabel: 'Диагональ экрана, дюймы',
    options: ['21.5', '24'],
    specs: {
      Тип: 'Монитор',
      'Диагональ экрана, дюймы': '24',
      Разрешение: '1920x1080 Full HD',
      'Матрица монитора': 'IPS',
      'Макс. частота обновления, Гц': '120',
    },
    categoryPath: ['Электроника', 'Компьютеры и периферия', 'Мониторы', 'JBEE'],
    merchant: {
      name: 'Ютрейд',
      rating: 4.8,
      orders: '9.4 K',
      verified: true,
    },
  },
  '1': {
    id: '1',
    title: 'Очиститель двигателя Axma Avtoproseries, 500 г',
    price: '27 000 тмт',
    originalPrice: '35 000 тмт',
    installmentPrice: '1 912 тмт/мес',
    rating: 4.7,
    reviewsCount: 511,
    questionsCount: 24,
    articleNumber: '1098471201',
    badges: ['ГАРАНТИЯ НИЗКОЙ ЦЕНЫ'],
    brand: 'Axma',
    optionsLabel: 'Объем, г',
    options: ['250', '500', '1000'],
    specs: {
      Тип: 'Очиститель двигателя',
      'Вес, г': '500',
      Бренд: 'Axma Avtoproseries',
      Назначение: 'Для очистки моторного отсека',
      'Страна-изготовитель': 'Узбекистан',
    },
    categoryPath: ['Автотовары', 'Автохимия', 'Очистители двигателя'],
    merchant: {
      name: 'Axma Shop',
      rating: 4.6,
      orders: '1.2 K',
      verified: false,
    },
  },
  '2': {
    id: '2',
    title: 'Подводка водостойкая для глаз Dip Eyeliner, чёрный, 5.1 мл',
    price: '37 990 тмт',
    originalPrice: '43 990 тмт',
    installmentPrice: '2 690 тмт/мес',
    rating: 4.9,
    reviewsCount: 2114,
    questionsCount: 82,
    articleNumber: '2087593214',
    badges: ['ОРИГИНАЛ'],
    brand: 'Dip Eyeliner',
    optionsLabel: 'Цвет',
    options: ['черный', 'коричневый'],
    specs: {
      Тип: 'Подводка для глаз',
      Цвет: 'Черный',
      'Объем, мл': '5.1',
      Водостойкость: 'Да',
      'Форма выпуска': 'Жидкая',
    },
    categoryPath: ['Красота и здоровье', 'Макияж', 'Глаза', 'Подводка'],
    merchant: {
      name: 'Beauty World',
      rating: 4.9,
      orders: '12.4 K',
      verified: true,
    },
  },
  '3': {
    id: '3',
    title: 'Nivea men ultra extreme, 50 мл',
    price: '31 990 тмт',
    originalPrice: '43 990 тмт',
    installmentPrice: '2 265 тмт/мес',
    rating: 4.9,
    reviewsCount: 306,
    questionsCount: 15,
    articleNumber: '3051493012',
    badges: ['ОРИГИНАЛ', 'ГАРАНТИЯ НИЗКОЙ ЦЕНЫ'],
    brand: 'Nivea men',
    optionsLabel: 'Объем, мл',
    options: ['50', '75', '100'],
    specs: {
      Тип: 'Антиперспирант',
      Форма: 'Шариковый',
      'Объем, мл': '50',
      'Для кого': 'Мужской',
    },
    categoryPath: ['Красота и здоровье', 'Личная гигиена', 'Дезодоранты'],
    merchant: {
      name: 'Nivea Store',
      rating: 4.8,
      orders: '34 K',
      verified: true,
    },
  },
  '4': {
    id: '4',
    title: 'Дезодорант-спрей для мужчин NIVEA MEN, невидимая защита для...',
    price: '35 990 тмт',
    originalPrice: '47 990 тмт',
    installmentPrice: '2 549 тмт/мес',
    rating: 4.9,
    reviewsCount: 2170,
    questionsCount: 43,
    articleNumber: '4092147631',
    badges: ['ОРИГИНАЛ'],
    brand: 'Nivea',
    optionsLabel: 'Формат',
    options: ['Спрей 150 мл', 'Спрей 200 мл'],
    specs: {
      Тип: 'Дезодорант-спрей',
      'Объем, мл': '150',
      Особенности: 'Не оставляет белых следов',
      'Длительность действия': '48 часов',
    },
    categoryPath: ['Красота и здоровье', 'Личная гигиена', 'Дезодоранты'],
    merchant: {
      name: 'Nivea Store',
      rating: 4.8,
      orders: '34 K',
      verified: true,
    },
  },
  '5': {
    id: '5',
    title: 'Дезодорант-спрей для женщин Nivea Pearl Beauty, с экстрактом жемчуга',
    price: '34 990 тмт',
    originalPrice: '43 990 тмт',
    installmentPrice: '2 478 тмт/мес',
    rating: 4.9,
    reviewsCount: 3266,
    questionsCount: 104,
    articleNumber: '5081249763',
    badges: ['ОРИГИНАЛ', 'ГАРАНТИЯ НИЗКОЙ ЦЕНЫ'],
    brand: 'Nivea',
    optionsLabel: 'Формат',
    options: ['Спрей 150 мл', 'Шариковый 50 мл'],
    specs: {
      Тип: 'Дезодорант-спрей',
      'Объем, мл': '150',
      Состав: 'С экстрактом жемчуга',
      'Для кого': 'Женский',
    },
    categoryPath: ['Красота и здоровье', 'Личная гигиена', 'Дезодоранты'],
    merchant: {
      name: 'Nivea Store',
      rating: 4.8,
      orders: '34 K',
      verified: true,
    },
  },
}

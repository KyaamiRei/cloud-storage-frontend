# Схема структуры файлов приложения Cloud Storage Frontend

```
cloud-storage-frontend/
│
├── public/                          # Статические файлы
│   ├── favicon.ico
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── src/                             # Исходный код приложения
│   │
│   ├── api/                         # API клиент и методы
│   │   ├── dto/                     # Data Transfer Objects
│   │   │   ├── auth.dto.ts          # DTO для аутентификации
│   │   │   ├── files.dto.ts         # DTO для файлов
│   │   │   └── notification.dto.ts  # DTO для уведомлений
│   │   ├── auth.ts                  # API методы аутентификации
│   │   ├── files.ts                 # API методы работы с файлами
│   │   └── index.ts                 # Экспорт API методов
│   │
│   ├── components/                  # React компоненты
│   │   ├── Auth/                    # Компоненты аутентификации
│   │   │   ├── Auth.module.scss     # Стили компонентов Auth
│   │   │   ├── LoginForm.tsx        # Форма входа
│   │   │   └── RegisterForm.tsx     # Форма регистрации
│   │   │
│   │   ├── FileActions/             # Действия с файлами
│   │   │   ├── FileActions.module.scss
│   │   │   └── index.tsx
│   │   │
│   │   ├── FileCard/                # Карточка файла
│   │   │   ├── FileCard.module.scss
│   │   │   └── index.tsx
│   │   │
│   │   ├── FileList/                # Список файлов
│   │   │   ├── FileList.module.scss
│   │   │   └── index.tsx
│   │   │
│   │   ├── Header/                  # Шапка приложения
│   │   │   ├── Header.module.scss
│   │   │   └── index.tsx
│   │   │
│   │   └── UploadButton/            # Кнопка загрузки
│   │       ├── UploadButton.module.scss
│   │       └── index.tsx
│   │
│   ├── core/                        # Основные настройки
│   │   └── axios.ts                 # Конфигурация Axios
│   │
│   ├── layouts/                     # Макеты страниц
│   │   ├── DashboardLayout.tsx      # Макет дашборда
│   │   └── Layout.tsx               # Базовый макет
│   │
│   ├── modules/                     # Бизнес-модули
│   │   └── Files.tsx                # Модуль работы с файлами
│   │
│   ├── pages/                       # Страницы Next.js (file-based routing)
│   │   ├── dashboard/               # Страницы дашборда
│   │   │   ├── auth.tsx             # Страница аутентификации
│   │   │   ├── index.tsx            # Главная страница дашборда
│   │   │   ├── photos.tsx           # Страница фотографий
│   │   │   ├── profile.tsx          # Страница профиля
│   │   │   └── trash.tsx            # Страница корзины
│   │   ├── _app.tsx                 # Главный компонент приложения
│   │   ├── _document.tsx            # HTML структура документа
│   │   └── index.tsx                # Главная страница
│   │
│   ├── styles/                      # Глобальные стили
│   │   ├── globals.css              # Глобальные CSS стили
│   │   ├── Home.module.scss         # Стили главной страницы
│   │   └── Profile.module.scss      # Стили профиля
│   │
│   └── utils/                       # Утилиты и вспомогательные функции
│       ├── checkAuth.ts             # Проверка аутентификации
│       ├── getColorByExtension.ts   # Получение цвета по расширению
│       ├── getExtensionFromFileName.ts  # Извлечение расширения файла
│       └── isImage.ts               # Проверка является ли файл изображением
│
├── node_modules/                    # Зависимости (игнорируется в Git)
│
├── .gitignore                       # Игнорируемые файлы Git
├── eslint.config.mjs                # Конфигурация ESLint
├── next-env.d.ts                    # Типы Next.js
├── next.config.ts                   # Конфигурация Next.js
├── package.json                     # Зависимости и скрипты проекта
├── package-lock.json                # Блокировка версий зависимостей
├── README.md                        # Документация проекта
└── tsconfig.json                    # Конфигурация TypeScript
```

## Описание основных директорий

### `/src/api`
Содержит методы для работы с API backend-сервера:
- **auth.ts** - методы аутентификации (логин, регистрация)
- **files.ts** - методы работы с файлами (загрузка, получение, удаление)
- **dto/** - типы данных для передачи между frontend и backend

### `/src/components`
React компоненты, разделенные по функциональности:
- **Auth/** - формы входа и регистрации
- **FileActions/** - действия с файлами (удаление, переименование и т.д.)
- **FileCard/** - карточка отображения отдельного файла
- **FileList/** - список файлов
- **Header/** - шапка приложения с навигацией
- **UploadButton/** - кнопка загрузки файлов

### `/src/pages`
Страницы Next.js (используется file-based routing):
- **dashboard/** - все страницы дашборда пользователя
- **_app.tsx** - обертка для всех страниц (провайдеры, глобальные настройки)
- **_document.tsx** - кастомизация HTML документа

### `/src/layouts`
Переиспользуемые макеты страниц для единообразного отображения

### `/src/utils`
Вспомогательные функции:
- Проверка аутентификации
- Работа с расширениями файлов
- Определение типа файла

### `/src/core`
Базовая конфигурация (например, настройка HTTP клиента Axios)

### `/src/modules`
Бизнес-логика приложения, организованная в модули

### `/public`
Статические ресурсы (изображения, иконки), доступные по прямым URL

## Технологический стек

- **Framework**: Next.js 16.0.2
- **UI Library**: Ant Design 5.28.1
- **HTTP Client**: Axios 1.13.2
- **Styling**: Sass/SCSS (модульные стили)
- **Language**: TypeScript 5
- **State Management**: React Hooks
- **Notifications**: react-hot-toast 2.6.0


export type Language = 'uz' | 'ru' | 'en';

export const translations = {
  uz: {
    // Auth
    login_title: "Tizimga kirish",
    phone_label: "Telefon raqami",
    otp_label: "Tasdiqlash kodi",
    login_btn: "Kirish",
    logout: "Chiqish",
    demo_instruction: "Admin: 998900000001 | Kod: 123456 (yoki Master: 200622)",
    
    // Errors
    error_user_not_found: "Foydalanuvchi topilmadi (Raqam ro‘yxatda yo‘q)",
    error_device_bound: "Ushbu qurilma boshqa foydalanuvchiga biriktirilgan",
    error_account_bound: "Sizning hisobingiz boshqa qurilmaga biriktirilgan",
    error_device_mismatch: "Bu akkaunt boshqa qurilmaga bog‘langan",
    error_invalid_otp: "Noto'g'ri kod",
    device_binding_reset: "Qurilma bog'lanishi tozalandi",
    
    // Global
    not_found_title: "404 - SAHIFA TOPILMADI",
    not_found_path: "Manzil",
    go_login: "Kirish oynasiga qaytish",
    access_denied_title: "Kirish taqiqlangan",
    access_denied_desc: "Sizda ushbu sahifani ko'rish huquqi yo'q.",
    back_login: "Kirishga qaytish",
    loading: "Yuklanmoqda...",
    refresh: "Yangilash",
    
    // Roles
    role_admin: "Administrator",
    role_rop: "Sotuv bo'limi boshlig'i",
    role_hr: "HR menejer",
    role_employee: "Xodim",
    role_sales_manager: "Sotuv menejeri",

    // Dashboard
    dashboard: "Boshqaruv paneli",
    settings: "Sozlamalar",
    attendance: "Davomat",
    staff: "Kadrlar",
    reports: "Hisobotlar",
    welcome: "Xush kelibsiz",
    daily_overview: "Kunlik ko'rsatkichlaringiz",
    
    // Employee Stats
    current_month_forecast: "Joriy oy prognozi",
    quick_stats: "Tezkor statistika",
    days_worked: "Ishlangan kunlar",
    avg_hours: "O'rtacha soat",
    unit_days: "kun",
    unit_hours: "soat",
    
    // Admin
    system_users_title: "Foydalanuvchilar va Qurilma xavfsizligi",
    confirm_reset: "Ishonchingiz komilmi?",
    table_name: "F.I.Sh",
    table_phone: "Telefon",
    table_role: "Lavozim",
    table_device: "Qurilma",
    table_action: "Amal",
    status_bound: "Bog'langan",
    status_unbound: "Bo'sh",
    add_user: "Foydalanuvchi qo'shish",
    create: "Yaratish",
    cancel: "Bekor qilish",
    user_created: "Foydalanuvchi yaratildi",
    select_role: "Lavozimni tanlang",
    reset_device: "Qurilmani ajratish",
    location_settings: "Ish joyi lokatsiyasi",
    latitude: "Kenglik (Latitude)",
    longitude: "Uzunlik (Longitude)",
    radius: "Radius (metr)",
    save_location: "Lokatsiyani saqlash",
    location_saved: "Lokatsiya saqlandi",
    
    // Test Mode / Admin Location
    test_settings: "Test Rejimi Sozlamalari",
    test_latitude: "Test Kenglik (Lat)",
    test_longitude: "Test Uzunlik (Lng)",
    set_as_workplace: "Ish joyi sifatida saqlash",
    set_as_test_loc: "Test lokatsiya sifatida saqlash",
    location_source: "Manba",
    source_real: "REAL GPS",
    source_test: "TEST (Simulyatsiya)",
    last_update: "Yangilandi",

    // Map UI
    map_title: "Xarita",
    get_current_location: "Hozirgi joylashuvni olish",
    set_from_map: "Xaritadan belgilash",
    workplace_marker: "Ish joyi",
    my_location_marker: "Sizning joylashuvingiz",
    distance_info: "Masofa: {dist} m",
    map_legend: "Shartli belgilar",
    map_loading: "Xarita yuklanmoqda...",
    toggle_map: "Xaritani ko'rsatish/yashirish",
    
    // Geo Debug
    geo_debug_title: "GPS Debug Ma'lumot",
    error_geo_permission: "Joylashuvga ruxsat berilmagan",
    error_geo_permission_instruction: "Iltimos, brauzer sozlamalaridan ushbu sayt uchun 'Location' (Joylashuv) ruxsatini yoqing (Allow).",
    error_geo_unavailable: "Joylashuvni aniqlab bo'lmadi",
    error_geo_timeout: "GPS vaqti tugadi (Timeout)",
    error_unknown: "Noma'lum xatolik",

    // HR
    placeholder_attendance_table: "Davomat jadvali (Tez orada)",
    placeholder_employee_mgmt: "Xodimlarni boshqarish (Tez orada)",

    // Existing
    start_work: "Ishni boshlash",
    pause_work: "Tanaffus",
    resume_work: "Davom ettirish",
    finish_work: "Ishni tugatish",
    work_finished: "Ish yakunlandi",
    status_active: "FAOL",
    status_paused: "TANAFFUS",
    status_completed: "YAKUNLANDI",
    status_none: "Ish boshlanmagan",
    salary: "Ish haqi",
    worked_time: "Ishlangan vaqt",
    error: "Xatolik",
    active_session_exists: "Faol sessiya mavjud!",
    hourly: "Soatbay",
    daily: "Kunlik",
    currency: "so'm",

    // GPS & Auto Rules
    error_location_denied: "Geolokatsiya ruxsati berilmadi. Dastur ishlashi uchun ruxsat bering.",
    error_outside_workplace: "Siz ish joyidan tashqaridasiz. Ishni boshlash uchun ofisga qayting.",
    gps_status: "GPS Holati",
    gps_inside: "Ofis hududida",
    gps_outside: "Tashqarida",
    distance_label: "Masofa",
    auto_finished_msg: "Ish avtomatik yakunlandi",
    
    // Notifications & ROP Dashboard
    notif_center_title: "Bildirishnomalar markazi",
    notif_empty: "Hozircha bildirishnomalar yo'q",
    notif_mark_read: "O'qilgan deb belgilash",
    notif_mark_all_read: "Hammasini o'qish",
    notif_refresh: "Yangilash",
    
    // Notification Messages (Dynamic)
    notif_MANUAL_PAUSE: "{name} ishni vaqtincha to'xtatdi (Manual).",
    notif_MANUAL_FINISH: "{name} ish kunini yakunladi.",
    notif_AUTO_FINISH_manual: "{name}ning ishi avtomatik yakunlandi. Sabab: Manual pauza {limit} daqiqadan oshib ketdi.",
    notif_AUTO_FINISH_auto: "{name}ning ishi avtomatik yakunlandi. Sabab: Hududdan tashqarida {limit} daqiqa bo'ldi.",
    notif_AUTO_PAUSE: "{name} hududdan chiqdi (Avto Pauza).",
    notif_AUTO_RESUME: "{name} ish joyiga qaytdi (Avto Davom).",
    
    // Notification Types
    type_AUTO_PAUSE: "Avto Pauza",
    type_AUTO_RESUME: "Avto Davom",
    type_AUTO_FINISH: "Avto Yakun",
    type_MANUAL_PAUSE: "Manual Pauza",
    type_MANUAL_FINISH: "Ish Yakuni",
    type_OUTSIDE_WARNING: "Geolokatsiya",

    // Time
    time_just_now: "Hozirgina",
    time_min_ago: "daqiq oldin",
    time_hr_ago: "soat oldin",
    time_today: "Bugun",
    time_yesterday: "Kecha"
  },
  ru: {
    // Auth
    login_title: "Вход в систему",
    phone_label: "Номер телефона",
    otp_label: "Код подтверждения",
    login_btn: "Войти",
    logout: "Выйти",
    demo_instruction: "Админ: 998900000001 | Код: 123456 (или Мастер: 200622)",
    
    // Errors
    error_user_not_found: "Пользователь не найден",
    error_device_bound: "Это устройство привязано к другому пользователю",
    error_account_bound: "Ваш аккаунт привязан к другому устройству",
    error_device_mismatch: "Этот аккаунт привязан к другому устройству",
    error_invalid_otp: "Неверный код",
    device_binding_reset: "Привязка устройства сброшена",

    // Global
    not_found_title: "404 - СТРАНИЦА НЕ НАЙДЕНА",
    not_found_path: "Путь",
    go_login: "Вернуться ко входу",
    access_denied_title: "Доступ запрещен",
    access_denied_desc: "У вас нет прав для просмотра этой страницы.",
    back_login: "Назад ко входу",
    loading: "Загрузка...",
    refresh: "Обновить",

    // Roles
    role_admin: "Администратор",
    role_rop: "РОП",
    role_hr: "HR Менеджер",
    role_employee: "Сотрудник",
    role_sales_manager: "Менеджер по продажам",

    // Dashboard
    dashboard: "Панель управления",
    settings: "Настройки",
    attendance: "Посещаемость",
    staff: "Кадры",
    reports: "Отчеты",
    welcome: "Добро пожаловать",
    daily_overview: "Ваш ежедневный обзор",
    
    // Employee Stats
    current_month_forecast: "Прогноз на текущий месяц",
    quick_stats: "Быстрая статистика",
    days_worked: "Отработано дней",
    avg_hours: "Среднее время",
    unit_days: "дн.",
    unit_hours: "ч.",

    // Admin
    system_users_title: "Пользователи и Безопасность устройств",
    confirm_reset: "Вы уверены?",
    table_name: "Ф.И.О.",
    table_phone: "Телефон",
    table_role: "Роль",
    table_device: "Устройство",
    table_action: "Действие",
    status_bound: "Привязан",
    status_unbound: "Не привязан",
    add_user: "Добавить пользователя",
    create: "Создать",
    cancel: "Отмена",
    user_created: "Пользователь создан",
    select_role: "Выберите роль",
    reset_device: "Сбросить устройство",
    location_settings: "Настройки локации",
    latitude: "Широта",
    longitude: "Долгота",
    radius: "Радиус (метры)",
    save_location: "Сохранить локацию",
    location_saved: "Локация сохранена",
    
    // Test Mode / Admin Location
    test_settings: "Настройки Тест Режима",
    test_latitude: "Тест Широта",
    test_longitude: "Тест Долгота",
    set_as_workplace: "Сохранить как Рабочее Место",
    set_as_test_loc: "Сохранить как Тест Локацию",
    location_source: "Источник",
    source_real: "REAL GPS",
    source_test: "TEST (Симуляция)",
    last_update: "Обновлено",

    // Map UI
    map_title: "Карта",
    get_current_location: "Получить текущую локацию",
    set_from_map: "Выбрать на карте",
    workplace_marker: "Рабочее место",
    my_location_marker: "Ваше местоположение",
    distance_info: "Расстояние: {dist} м",
    map_legend: "Легенда",
    map_loading: "Загрузка карты...",
    toggle_map: "Показать/Скрыть карту",

    // Geo Debug
    geo_debug_title: "GPS Отладка",
    error_geo_permission: "Нет доступа к геолокации",
    error_geo_permission_instruction: "Пожалуйста, включите доступ к 'Location' (Геолокации) в настройках браузера.",
    error_geo_unavailable: "Геолокация недоступна",
    error_geo_timeout: "Тайм-аут GPS",
    error_unknown: "Неизвестная ошибка",

    // HR
    placeholder_attendance_table: "Таблица посещаемости (Скоро)",
    placeholder_employee_mgmt: "Управление сотрудниками (Скоро)",

    // Existing
    start_work: "Начать работу",
    pause_work: "Перерыв",
    resume_work: "Продолжить",
    finish_work: "Завершить работу",
    work_finished: "Работа завершена",
    status_active: "АКТИВЕН",
    status_paused: "ПЕРЕРЫВ",
    status_completed: "ЗАВЕРШЕНО",
    status_none: "Не начато",
    salary: "Зарплата",
    worked_time: "Отработанное время",
    error: "Ошибка",
    active_session_exists: "Активная сессия уже существует!",
    hourly: "Почасовая",
    daily: "Дневная",
    currency: "сум",

    // GPS & Auto Rules
    error_location_denied: "Нет доступа к геолокации. Разрешите доступ для работы приложения.",
    error_outside_workplace: "Вы находитесь за пределами рабочей зоны.",
    gps_status: "GPS Статус",
    gps_inside: "В офисе",
    gps_outside: "Снаружи",
    distance_label: "Расстояние",
    auto_finished_msg: "Работа завершена автоматически",

    // Notifications & ROP Dashboard
    notif_center_title: "Центр уведомлений",
    notif_empty: "Нет новых уведомлений",
    notif_mark_read: "Отметить как прочитанное",
    notif_mark_all_read: "Прочитать все",
    notif_refresh: "Обновить",

    // Notification Messages (Dynamic)
    notif_MANUAL_PAUSE: "{name} приостановил работу (Вручную).",
    notif_MANUAL_FINISH: "{name} завершил рабочий день.",
    notif_AUTO_FINISH_manual: "Авто-финиш {name}. Причина: Пауза > {limit} мин.",
    notif_AUTO_FINISH_auto: "Авто-финиш {name}. Причина: Снаружи > {limit} мин.",
    notif_AUTO_PAUSE: "{name} покинул зону (Авто-пауза).",
    notif_AUTO_RESUME: "{name} вернулся в зону (Авто-продолжение).",
    
    // Notification Types
    type_AUTO_PAUSE: "Авто-пауза",
    type_AUTO_RESUME: "Авто-резюм",
    type_AUTO_FINISH: "Авто-финиш",
    type_MANUAL_PAUSE: "Пауза (Ручн.)",
    type_MANUAL_FINISH: "Завершение",
    type_OUTSIDE_WARNING: "Геолокация",

    // Time
    time_just_now: "Только что",
    time_min_ago: "мин. назад",
    time_hr_ago: "ч. назад",
    time_today: "Сегодня",
    time_yesterday: "Вчера"
  },
  en: {
    // Auth
    login_title: "System Login",
    phone_label: "Phone Number",
    otp_label: "Confirmation Code",
    login_btn: "Login",
    logout: "Logout",
    demo_instruction: "Admin: 998900000001 | Code: 123456 (or Master: 200622)",
    
    // Errors
    error_user_not_found: "User not found",
    error_device_bound: "This device is bound to another user",
    error_account_bound: "Your account is bound to another device",
    error_device_mismatch: "This account is bound to another device",
    error_invalid_otp: "Invalid OTP",
    device_binding_reset: "Device binding reset",

    // Global
    not_found_title: "404 - NOT FOUND",
    not_found_path: "Path",
    go_login: "Go to Login",
    access_denied_title: "Access Denied",
    access_denied_desc: "You do not have permission to view this page.",
    back_login: "Back to Login",
    loading: "Loading...",
    refresh: "Refresh",

    // Roles
    role_admin: "Administrator",
    role_rop: "Head of Sales",
    role_hr: "HR Manager",
    role_employee: "Employee",
    role_sales_manager: "Sales Manager",

    // Dashboard
    dashboard: "Dashboard",
    settings: "Settings",
    attendance: "Attendance",
    staff: "Staff",
    reports: "Reports",
    welcome: "Welcome",
    daily_overview: "Here is your daily overview",
    
    // Employee Stats
    current_month_forecast: "Current month forecast",
    quick_stats: "Quick Stats",
    days_worked: "Days Worked",
    avg_hours: "Avg. Hours",
    unit_days: "days",
    unit_hours: "hrs",

    // Admin
    system_users_title: "System Users & Device Security",
    confirm_reset: "Are you sure?",
    table_name: "Name",
    table_phone: "Phone",
    table_role: "Role",
    table_device: "Device",
    table_action: "Action",
    status_bound: "Bound",
    status_unbound: "Unbound",
    add_user: "Add User",
    create: "Create",
    cancel: "Cancel",
    user_created: "User created",
    select_role: "Select Role",
    reset_device: "Reset Device",
    location_settings: "Workplace Location",
    latitude: "Latitude",
    longitude: "Longitude",
    radius: "Radius (meters)",
    save_location: "Save Location",
    location_saved: "Location saved",
    
    // Test Mode / Admin Location
    test_settings: "Test Mode Settings",
    test_latitude: "Test Latitude",
    test_longitude: "Test Longitude",
    set_as_workplace: "Set as Workplace",
    set_as_test_loc: "Set as Test Location",
    location_source: "Source",
    source_real: "REAL GPS",
    source_test: "TEST (Simulated)",
    last_update: "Updated",

    // Map UI
    map_title: "Map",
    get_current_location: "Get Current Location",
    set_from_map: "Set from Map",
    workplace_marker: "Workplace",
    my_location_marker: "Your Location",
    distance_info: "Distance: {dist} m",
    map_legend: "Legend",
    map_loading: "Map loading...",
    toggle_map: "Toggle Map",

    // Geo Debug
    geo_debug_title: "GPS Debug Info",
    error_geo_permission: "Location permission denied",
    error_geo_permission_instruction: "Please enable 'Location' access for this site in your browser settings.",
    error_geo_unavailable: "Location unavailable",
    error_geo_timeout: "GPS Timeout",
    error_unknown: "Unknown error",

    // HR
    placeholder_attendance_table: "Attendance Table (Coming Soon)",
    placeholder_employee_mgmt: "Employee Management (Coming Soon)",

    // Existing
    start_work: "Start Work",
    pause_work: "Break",
    resume_work: "Resume",
    finish_work: "Finish Work",
    work_finished: "Work Finished",
    status_active: "ACTIVE",
    status_paused: "PAUSED",
    status_completed: "COMPLETED",
    status_none: "Not started",
    salary: "Salary",
    worked_time: "Worked Time",
    error: "Error",
    active_session_exists: "Active session exists!",
    hourly: "Hourly",
    daily: "Daily",
    currency: "sum",

    // GPS & Auto Rules
    error_location_denied: "Location permission denied. Please allow access.",
    error_outside_workplace: "You are outside the workplace.",
    gps_status: "GPS Status",
    gps_inside: "Inside",
    gps_outside: "Outside",
    distance_label: "Distance",
    auto_finished_msg: "Work finished automatically",

    // Notifications & ROP Dashboard
    notif_center_title: "Notification Center",
    notif_empty: "No new notifications",
    notif_mark_read: "Mark read",
    notif_mark_all_read: "Read all",
    notif_refresh: "Refresh",

    // Notification Messages (Dynamic)
    notif_MANUAL_PAUSE: "{name} paused work (Manual).",
    notif_MANUAL_FINISH: "{name} finished the workday.",
    notif_AUTO_FINISH_manual: "{name} finished automatically. Reason: Manual pause > {limit} min.",
    notif_AUTO_FINISH_auto: "{name} finished automatically. Reason: Outside > {limit} min.",
    notif_AUTO_PAUSE: "{name} left the zone (Auto Pause).",
    notif_AUTO_RESUME: "{name} returned to zone (Auto Resume).",
    
    // Notification Types
    type_AUTO_PAUSE: "Auto Pause",
    type_AUTO_RESUME: "Auto Resume",
    type_AUTO_FINISH: "Auto Finish",
    type_MANUAL_PAUSE: "Manual Pause",
    type_MANUAL_FINISH: "Finished",
    type_OUTSIDE_WARNING: "Geolocation",

    // Time
    time_just_now: "Just now",
    time_min_ago: "min ago",
    time_hr_ago: "hr ago",
    time_today: "Today",
    time_yesterday: "Yesterday"
  }
};

import { db } from './firebase-config.js';
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Разрешенные email адреса (ТОЛЬКО ЭТИ ДВА ЧЕЛОВЕКА!)
const ALLOWED_EMAILS = [
  "vvalex2004@gmail.com",
  "vasilyev.ua82@gmail.com"
];

const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

let currentUser = null;
let currentLang = 'en';

// Список всех 23 услуг с ценами
const servicesData = [
  { id: "repair", uk: "Ремонт сантехнічних систем", en: "Plumbing systems repair", lt: "Santechnikos sistemų remontas", price: "від 25 €" },
  { id: "heating", uk: "Монтаж систем опалення", en: "Heating systems installation", lt: "Šildymo sistemų montavimas", price: "від 50 €" },
  { id: "handyman", uk: "Сантехнік по дому", en: "Handyman plumber", lt: "Santechnikas į namus", price: "від 20 € / год" },
  { id: "welding", uk: "Зварювання трубопроводів та вузлів", en: "Pipeline & node welding", lt: "Vamzdynų ir mazgų suvirinimas", price: "від 25 €" },
  { id: "water_sewer", uk: "Монтаж водопостачання та каналізації", en: "Water supply & sewage installation", lt: "Vandentiekio ir kanalizacijos montavimas", price: "від 50 € / проєкт" },
  { id: "ventilation", uk: "Монтаж вентиляційних систем", en: "Ventilation systems installation", lt: "Ventiliacijos sistemų montavimas", price: "запитати ціну" },
  { id: "drain_sewer", uk: "Монтаж мереж зливної каналізації", en: "Storm drainage networks installation", lt: "Lietaus kanalizacijos tinklų montavimas", price: "від 300 €" },
  { id: "heating_design", uk: "Проектування систем опалення", en: "Heating systems design", lt: "Šildymo sistemų projektavimas", price: "від 400 € / проєкт" },
  { id: "drainage", uk: "Встановлення дренажу", en: "Drainage installation", lt: "Drenažo įrengimas", price: "від 15 € / місяць" },
  { id: "small_jobs", uk: "Дрібні сантехнічні роботи", en: "Small plumbing works", lt: "Smulkūs santechnikos darbai", price: "від 50 €" },
  { id: "heat_pumps", uk: "Встановлення теплових насосів", en: "Heat pumps installation", lt: "Šilumos siurblių montavimas", price: "від 600 € / проєкт" },
  { id: "underfloor", uk: "Монтаж теплих підлог", en: "Underfloor heating installation", lt: "Grindinio šildymo montavimas", price: "від 4 € / м²" },
  { id: "washing_machine", uk: "Підключення пральної машинки", en: "Washing machine connection", lt: "Skalbimo mašinos pajungimas", price: "від 50 € / шт" },
  { id: "boiler", uk: "Підключення котла", en: "Boiler connection", lt: "Katilo pajungimas", price: "від 300 € / шт" },
  { id: "gas_boiler", uk: "Підключення газового котла", en: "Gas boiler connection", lt: "Dujinio katilo pajungimas", price: "від 250 € / шт" },
  { id: "dryer", uk: "Підключення сушарки", en: "Dryer connection", lt: "Džiovyklės pajungimas", price: "від 50 € / шт" },
  { id: "dishwasher", uk: "Підключення посудомийної машини", en: "Dishwasher connection", lt: "Indaplovės pajungimas", price: "від 50 € / шт" },
  { id: "engineering_networks", uk: "Монтаж інженерних мереж", en: "Engineering networks installation", lt: "Inžinerinių tinklų montavimas", price: "від 300 €" },
  { id: "snake_connection", uk: "З'єднання змійовика (рушникосушки)", en: "Towel warmer connection", lt: "Gyvatuko pajungimas", price: "від 50 € / проєкт" },
  { id: "radiator", uk: "Підключення радіатору", en: "Radiator connection", lt: "Radiatoriaus pajungimas", price: "від 50 € / шт" },
  { id: "toilet", uk: "Підключення туалету", en: "Toilet installation", lt: "Unitazo montavimas", price: "від 50 € / шт" },
  { id: "water_filters", uk: "Професійне встановлення фільтрів для води", en: "Professional water filters installation", lt: "Profesionalus vandens filtrų montavimas", price: "від 100 €" },
  { id: "leak_detection", uk: "Виявлення витоку води в системі опалення", en: "Water leak detection in heating system", lt: "Vandens nuotėkio paieška šildymo sistemoje", price: "від 100 €" }
];

// Отрисовка списка услуг
function renderServices() {
  const container = document.getElementById('servicesContainer');
  container.innerHTML = '';

  const isMaster = currentUser && ALLOWED_EMAILS.includes(currentUser.email.toLowerCase());

  servicesData.forEach(service => {
    const card = document.createElement('div');
    card.className = "bg-white p-5 rounded-xl shadow-md border border-slate-100 flex flex-col justify-between";

    card.innerHTML = `
      <div>
        <h3 class="font-bold text-lg text-slate-900 mb-2">${service[currentLang] || service.en}</h3>
        <p class="text-cyan-600 font-bold mb-4">${service.price}</p>
        
        <!-- Сетка фото под услугой -->
        <div id="photos-${service.id}" class="grid grid-cols-3 gap-2 mb-4">
          <!-- Фото подгружаются из базы -->
        </div>
      </div>
      
      <!-- Панель только для мастеров -->
      ${isMaster ? `
        <div class="mt-4 border-t pt-3 bg-slate-50 p-2 rounded">
          <p class="text-xs text-slate-500 mb-1">Додати фото (10-15 шт):</p>
          <input type="text" id="input-${service.id}" placeholder="Вставте посилання на фото" class="w-full text-sm p-1.5 border rounded mb-2">
          <button onclick="window.addPhotoToService('${service.id}')" class="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs py-2 rounded font-medium">
            + Додати фото в роботу
          </button>
        </div>
      ` : ''}
    `;

    container.appendChild(card);
    loadServicePhotos(service.id);
  });
}

// Загрузка фото из базы Firestore
async function loadServicePhotos(serviceId) {
  try {
    const querySnapshot = await getDocs(collection(db, `service_${serviceId}`));
    const photoContainer = document.getElementById(`photos-${serviceId}`);
    if (!photoContainer) return;

    photoContainer.innerHTML = '';
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const img = document.createElement('img');
      img.src = data.url;
      // Добавляем эффект при наведении и указатель курсора-лупы
      img.className = "w-full h-20 object-cover rounded shadow-sm border cursor-pointer hover:opacity-80 transition transform hover:scale-105";
      
      // При клике открываем фото на весь экран
      img.onclick = () => window.openImageViewer(data.url);

      photoContainer.appendChild(img);
    });
  } catch (e) {
    console.log("Error loading photos:", e);
  }
}

// Открытие картинки во весь экран
window.openImageViewer = (imageUrl) => {
  const modal = document.getElementById('imageViewerModal');
  const fullImg = document.getElementById('fullSizeImage');
  fullImg.src = imageUrl;
  modal.classList.remove('hidden');
};

// Закрытие полноэкранного просмотра
document.getElementById('imageViewerModal').onclick = () => {
  document.getElementById('imageViewerModal').classList.add('hidden');
};

// Функция добавления фото мастером
window.addPhotoToService = async (serviceId) => {
  const input = document.getElementById(`input-${serviceId}`);
  const url = input.value.trim();
  if (!url) {
    alert('Будь ласка, введіть посилання на фото!');
    return;
  }

  try {
    await addDoc(collection(db, `service_${serviceId}`), {
      url: url,
      addedBy: currentUser.email,
      createdAt: new Date()
    });
    input.value = '';
    loadServicePhotos(serviceId);
  } catch (e) {
    alert('Помилка збереження: ' + e.message);
  }
};

// Логика кнопки авторизации Google
const googleAuthBtn = document.getElementById('googleAuthBtn');
const adminBadge = document.getElementById('adminBadge');

googleAuthBtn.onclick = () => {
  if (currentUser) {
    signOut(auth);
  } else {
    signInWithPopup(auth, googleProvider).catch((error) => {
      alert("Помилка входу через Google: " + error.message);
    });
  }
};

// Отслеживание входа
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    const userEmail = user.email.toLowerCase();
    if (ALLOWED_EMAILS.includes(userEmail)) {
      googleAuthBtn.innerText = "Вийти";
      adminBadge.classList.remove('hidden');
      adminBadge.innerText = `Режим майстра активовано: ${user.email}`;
    } else {
      alert(`Акаунт ${user.email} не має прав майстра для додавання фото.`);
      signOut(auth);
    }
  } else {
    googleAuthBtn.innerText = "Вхід (Майстер)";
    adminBadge.classList.add('hidden');
  }
  renderServices();
});

// Переключение языков
document.getElementById('langSelect').onchange = (e) => {
  currentLang = e.target.value;
  renderServices();
};

// Инициализация
renderServices();
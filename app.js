import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let currentLang = 'uk'; // Украинский по умолчанию
let isMasterLoggedIn = false;

// Четкие раздельные переводы для интерфейса
const uiTexts = {
  uk: {
    heroTitle: "Професійні сантехнічні послуги",
    heroSubtitle: "Проектування, монтаж систем опалення, водопостачання та якісний ремонт сантехніки",
    callBtn: "📞 Зателефонувати",
    reviewsCount: "Реальні відгуки клієнтів",
    servicesTitle: "Наші послуги та ціни",
    masterBtn: "Майстер",
    masterActive: "Режим майстра активовано",
    addPhotoLabel: "Додати фото (10-15 шт):",
    addPhotoBtn: "+ Додати фото в роботу",
    reviewsHeaderTitle: "Відгуки клієнтів",
    reviewsHeaderSub: "Залиште реальний відгук про нашу роботу",
    openReviewBtn: "+ Залишити відгук",
    modalReviewTitle: "Ваш відгук",
    namePlaceholder: "Ваше ім'я",
    commentPlaceholder: "Текст відгуку...",
    sendBtn: "Надіслати",
    cancelBtn: "Скасувати"
  },
  en: {
    heroTitle: "Professional Plumbing Services",
    heroSubtitle: "Design, heating systems installation, water supply & quality plumbing repair",
    callBtn: "📞 Call Now",
    reviewsCount: "Real customer reviews",
    servicesTitle: "Our Services & Prices",
    masterBtn: "Master",
    masterActive: "Master mode active",
    addPhotoLabel: "Add photo (10-15 pcs):",
    addPhotoBtn: "+ Add photo",
    reviewsHeaderTitle: "Customer Reviews",
    reviewsHeaderSub: "Leave a real review about our work",
    openReviewBtn: "+ Leave a review",
    modalReviewTitle: "Your Review",
    namePlaceholder: "Your Name",
    commentPlaceholder: "Review text...",
    sendBtn: "Submit",
    cancelBtn: "Cancel"
  },
  lt: {
    heroTitle: "Profesionalios Santechnikos Paslaugos",
    heroSubtitle: "Projektavimas, šildymo sistemų montavimas, vandentiekis ir kokybiškas santechnikos remontas",
    callBtn: "📞 Skambinti",
    reviewsCount: "Realūs klientų atsiliepimai",
    servicesTitle: "Mūsų Paslaugos ir Kainos",
    masterBtn: "Meistras",
    masterActive: "Meistro režimas aktyvus",
    addPhotoLabel: "Pridėti nuotrauką (10-15 vnt.):",
    addPhotoBtn: "+ Pridėti nuotrauką",
    reviewsHeaderTitle: "Klientų Atsiliepimai",
    reviewsHeaderSub: "Palikite realų atsiliepimą apie mūsų darbą",
    openReviewBtn: "+ Palikti atsiliepimą",
    modalReviewTitle: "Jūsų Atsiliepimas",
    namePlaceholder: "Jūsų vardas",
    commentPlaceholder: "Atsiliepimo tekstas...",
    sendBtn: "Siųsti",
    cancelBtn: "Atšaukti"
  }
};

// Все 23 услуги с точными ценами и переводами
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

// Обновление текстов на странице при смене языка
function updateTexts() {
  const t = uiTexts[currentLang];
  document.getElementById('heroTitle').innerText = t.heroTitle;
  document.getElementById('heroSubtitle').innerText = t.heroSubtitle;
  document.getElementById('callBtn').innerText = t.callBtn;
  document.getElementById('reviewsCountText').innerText = t.reviewsCount;
  document.getElementById('servicesTitle').innerText = t.servicesTitle;
  document.getElementById('masterLoginBtn').innerText = isMasterLoggedIn ? "Вийти" : t.masterBtn;
  document.getElementById('adminBadge').innerText = t.masterActive;
  document.getElementById('reviewsHeaderTitle').innerText = t.reviewsHeaderTitle;
  document.getElementById('reviewsHeaderSub').innerText = t.reviewsHeaderSub;
  document.getElementById('openReviewModal').innerText = t.openReviewBtn;
  document.getElementById('modalReviewTitle').innerText = t.modalReviewTitle;
  document.getElementById('clientNameInput').placeholder = t.namePlaceholder;
  document.getElementById('clientCommentInput').placeholder = t.commentPlaceholder;
  document.getElementById('submitReviewBtn').innerText = t.sendBtn;
  document.getElementById('closeReviewModal').innerText = t.cancelBtn;
}

// Рендер услуг
function renderServices() {
  const container = document.getElementById('servicesContainer');
  container.innerHTML = '';
  const t = uiTexts[currentLang];

  servicesData.forEach(service => {
    const card = document.createElement('div');
    card.className = "bg-white p-5 rounded-xl shadow-md border border-slate-100 flex flex-col justify-between";

    card.innerHTML = `
      <div>
        <h3 class="font-bold text-lg text-slate-900 mb-2">${service[currentLang] || service.uk}</h3>
        <p class="text-cyan-600 font-bold mb-4">${service.price}</p>
        <div id="photos-${service.id}" class="grid grid-cols-3 gap-2 mb-4"></div>
      </div>
      
      ${isMasterLoggedIn ? `
        <div class="mt-4 border-t pt-3 bg-slate-50 p-2 rounded">
          <p class="text-xs text-slate-500 mb-1">${t.addPhotoLabel}</p>
          <input type="text" id="input-${service.id}" placeholder="Вставте посилання на фото" class="w-full text-sm p-1.5 border rounded mb-2">
          <button onclick="window.addPhotoToService('${service.id}')" class="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs py-2 rounded font-medium">
            ${t.addPhotoBtn}
          </button>
        </div>
      ` : ''}
    `;

    container.appendChild(card);
    loadServicePhotos(service.id);
  });
}

// Загрузка фото услуг
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
      img.className = "w-full h-20 object-cover rounded shadow-sm border cursor-pointer hover:opacity-80 transition transform hover:scale-105";
      img.onclick = () => window.openImageViewer(data.url);
      photoContainer.appendChild(img);
    });
  } catch (e) {
    console.log("Error:", e);
  }
}

// Добавление фото мастером
window.addPhotoToService = async (serviceId) => {
  const input = document.getElementById(`input-${serviceId}`);
  const url = input.value.trim();
  if (!url) return alert('Введіть посилання на фото!');

  try {
    await addDoc(collection(db, `service_${serviceId}`), {
      url: url,
      createdAt: new Date()
    });
    input.value = '';
    loadServicePhotos(serviceId);
  } catch (e) {
    alert('Помилка: ' + e.message);
  }
};

// Загрузка реальных отзывов из базы
async function loadReviews() {
  const container = document.getElementById('reviewsContainer');
  container.innerHTML = '<p class="text-sm text-slate-400">Завантаження відгуків...</p>';

  try {
    const querySnapshot = await getDocs(collection(db, "client_reviews"));
    container.innerHTML = '';

    if (querySnapshot.empty) {
      container.innerHTML = '<p class="text-sm text-slate-500">Поки немає відгуків. Станьте першим!</p>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const rev = doc.data();
      const stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
      
      const item = document.createElement('div');
      item.className = "p-4 bg-slate-50 rounded-xl border border-slate-200";
      item.innerHTML = `
        <div class="flex justify-between items-center mb-1">
          <span class="font-bold text-slate-900 text-sm">${rev.name}</span>
          <span class="text-amber-400 text-sm">${stars}</span>
        </div>
        <p class="text-slate-700 text-sm">${rev.comment}</p>
      `;
      container.appendChild(item);
    });
  } catch (e) {
    container.innerHTML = '<p class="text-sm text-red-500">Не вдалося завантажити відгуки.</p>';
  }
}

// Отправка реального отзыва
document.getElementById('submitReviewBtn').onclick = async () => {
  const name = document.getElementById('clientNameInput').value.trim();
  const rating = parseInt(document.getElementById('clientRatingInput').value);
  const comment = document.getElementById('clientCommentInput').value.trim();

  if (!name || !comment) {
    alert('Будь ласка, заповніть ім’я та текст відгуку.');
    return;
  }

  try {
    await addDoc(collection(db, "client_reviews"), {
      name,
      rating,
      comment,
      createdAt: new Date()
    });
    document.getElementById('clientNameInput').value = '';
    document.getElementById('clientCommentInput').value = '';
    document.getElementById('reviewModal').classList.add('hidden');
    loadReviews();
    alert('Дякуємо! Ваш відгук успішно додано.');
  } catch (e) {
    alert('Помилка: ' + e.message);
  }
};

// Модальные окна
const loginModal = document.getElementById('loginModal');
const reviewModal = document.getElementById('reviewModal');

document.getElementById('masterLoginBtn').onclick = () => {
  if (isMasterLoggedIn) {
    isMasterLoggedIn = false;
    document.getElementById('adminBadge').classList.add('hidden');
    updateTexts();
    renderServices();
  } else {
    loginModal.classList.remove('hidden');
  }
};

document.getElementById('closeLoginModal').onclick = () => loginModal.classList.add('hidden');

document.getElementById('submitMasterPass').onclick = () => {
  const pass = document.getElementById('masterPassInput').value.trim();
  if (pass === '1234' || pass === '5678') {
    isMasterLoggedIn = true;
    loginModal.classList.add('hidden');
    document.getElementById('adminBadge').classList.remove('hidden');
    document.getElementById('masterPassInput').value = '';
    updateTexts();
    renderServices();
    alert('Успішний вхід майстра!');
  } else {
    alert('Невірний пароль!');
  }
};

document.getElementById('openReviewModal').onclick = () => reviewModal.classList.remove('hidden');
document.getElementById('closeReviewModal').onclick = () => reviewModal.classList.add('hidden');

// Просмотр фото во весь экран
window.openImageViewer = (url) => {
  const modal = document.getElementById('imageViewerModal');
  document.getElementById('fullSizeImage').src = url;
  modal.classList.remove('hidden');
};
document.getElementById('imageViewerModal').onclick = () => {
  document.getElementById('imageViewerModal').classList.add('hidden');
};

// Смена языка
document.getElementById('langSelect').onchange = (e) => {
  currentLang = e.target.value;
  updateTexts();
  renderServices();
};

// Старт
updateTexts();
renderServices();
loadReviews();
import { db } from './firebase-config.js';
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let currentLang = 'uk';
let isMasterLoggedIn = false;

// Раздельные словари интерфейса
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
    cancelBtn: "Скасувати",
    reviewsWord: "відгуків"
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
    cancelBtn: "Cancel",
    reviewsWord: "reviews"
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
    cancelBtn: "Atšaukti",
    reviewsWord: "atsiliepimų"
  }
};

const servicesData = [
  { id: "repair", uk: "Ремонт сантехнічних систем", en: "Plumbing systems repair", lt: "Santechnikos sistemų remontas", price: { uk: "від 25 €", en: "from 25 €", lt: "nuo 25 €" } },
  { id: "heating", uk: "Монтаж систем опалення", en: "Heating systems installation", lt: "Šildymo sistemų montavimas", price: { uk: "від 50 €", en: "from 50 €", lt: "nuo 50 €" } },
  { id: "handyman", uk: "Сантехнік по дому", en: "Handyman plumber", lt: "Santechnikas į namus", price: { uk: "від 20 € / год", en: "from 20 € / hr", lt: "nuo 20 € / val." } },
  { id: "welding", uk: "Зварювання трубопроводів та вузлів", en: "Pipeline & node welding", lt: "Vamzdynų ir mazgų suvirinimas", price: { uk: "від 25 €", en: "from 25 €", lt: "nuo 25 €" } },
  { id: "water_sewer", uk: "Монтаж водопостачання та каналізації", en: "Water supply & sewage installation", lt: "Vandentiekio ir kanalizacijos montavimas", price: { uk: "від 50 € / проєкт", en: "from 50 € / project", lt: "nuo 50 € / projektas" } },
  { id: "ventilation", uk: "Монтаж вентиляційних систем", en: "Ventilation systems installation", lt: "Ventiliacijos sistemų montavimas", price: { uk: "запитати ціну", en: "ask for price", lt: "klausti kainos" } },
  { id: "drain_sewer", uk: "Монтаж мереж зливної каналізації", en: "Storm drainage networks installation", lt: "Lietaus kanalizacijos tinklų montavimas", price: { uk: "від 300 €", en: "from 300 €", lt: "nuo 300 €" } },
  { id: "heating_design", uk: "Проектування систем опалення", en: "Heating systems design", lt: "Šildymo sistemų projektavimas", price: { uk: "від 400 € / проєкт", en: "from 400 € / project", lt: "nuo 400 € / projektas" } },
  { id: "drainage", uk: "Встановлення дренажу", en: "Drainage installation", lt: "Drenažo įrengimas", price: { uk: "від 15 € / місяць", en: "from 15 € / month", lt: "nuo 15 € / mėn." } },
  { id: "small_jobs", uk: "Дрібні сантехнічні роботи", en: "Small plumbing works", lt: "Smulkūs santechnikos darbai", price: { uk: "від 50 €", en: "from 50 €", lt: "nuo 50 €" } },
  { id: "heat_pumps", uk: "Встановлення теплових насосів", en: "Heat pumps installation", lt: "Šilumos siurblių montavimas", price: { uk: "від 600 € / проєкт", en: "from 600 € / project", lt: "nuo 600 € / projektas" } },
  { id: "underfloor", uk: "Монтаж теплих підлог", en: "Underfloor heating installation", lt: "Grindinio šildymo montavimas", price: { uk: "від 4 € / м²", en: "from 4 € / m²", lt: "nuo 4 € / m²" } },
  { id: "washing_machine", uk: "Підключення пральної машинки", en: "Washing machine connection", lt: "Skalbimo mašinos pajungimas", price: { uk: "від 50 € / шт", en: "from 50 € / pcs", lt: "nuo 50 € / vnt." } },
  { id: "boiler", uk: "Підключення котла", en: "Boiler connection", lt: "Katilo pajungimas", price: { uk: "від 300 € / шт", en: "from 300 € / pcs", lt: "nuo 300 € / vnt." } },
  { id: "gas_boiler", uk: "Підключення газового котла", en: "Gas boiler connection", lt: "Dujinio katilo pajungimas", price: { uk: "від 250 € / шт", en: "from 250 € / pcs", lt: "nuo 250 € / vnt." } },
  { id: "dryer", uk: "Підключення сушарки", en: "Dryer connection", lt: "Džiovyklės pajungimas", price: { uk: "від 50 € / шт", en: "from 50 € / pcs", lt: "nuo 50 € / vnt." } },
  { id: "dishwasher", uk: "Підключення посудомийної машини", en: "Dishwasher connection", lt: "Indaplovės pajungimas", price: { uk: "від 50 € / шт", en: "from 50 € / pcs", lt: "nuo 50 € / vnt." } },
  { id: "engineering_networks", uk: "Монтаж інженерних мереж", en: "Engineering networks installation", lt: "Inžinerinių tinklų montavimas", price: { uk: "від 300 €", en: "from 300 €", lt: "nuo 300 €" } },
  { id: "snake_connection", uk: "З'єднання змійовика (рушникосушки)", en: "Towel warmer connection", lt: "Gyvatuko pajungimas", price: { uk: "від 50 € / проєкт", en: "from 50 € / project", lt: "nuo 50 € / projektas" } },
  { id: "radiator", uk: "Підключення радіатору", en: "Radiator connection", lt: "Radiatoriaus pajungimas", price: { uk: "від 50 € / шт", en: "from 50 € / pcs", lt: "nuo 50 € / vnt." } },
  { id: "toilet", uk: "Підключення туалету", en: "Toilet installation", lt: "Unitazo montavimas", price: { uk: "від 50 € / шт", en: "from 50 € / pcs", lt: "nuo 50 € / vnt." } },
  { id: "water_filters", uk: "Професійне встановлення фільтрів для води", en: "Professional water filters installation", lt: "Profesionalus vandens filtrų montavimas", price: { uk: "від 100 €", en: "from 100 €", lt: "nuo 100 €" } },
  { id: "leak_detection", uk: "Виявлення витоку води в системі опалення", en: "Water leak detection in heating system", lt: "Vandens nuotėkio paieška šildymo sistemoje", price: { uk: "від 100 €", en: "from 100 €", lt: "nuo 100 €" } }
];

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

function renderServices() {
  const container = document.getElementById('servicesContainer');
  container.innerHTML = '';
  const t = uiTexts[currentLang];

  servicesData.forEach(service => {
    const card = document.createElement('div');
    card.className = "bg-white p-5 rounded-xl shadow-md border border-slate-100 flex flex-col justify-between";

    const title = service[currentLang] || service.uk;
    const priceText = service.price[currentLang] || service.price.uk;

    card.innerHTML = `
      <div>
        <h3 class="font-bold text-lg text-slate-900 mb-2">${title}</h3>
        <p class="text-cyan-600 font-bold mb-4">${priceText}</p>
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

// Загрузка отзывов: неограниченный подсчет + точное время
async function loadReviews() {
  const container = document.getElementById('reviewsContainer');
  const scoreText = document.getElementById('averageScoreText');
  const graphic = document.getElementById('starRatingGraphic');
  const t = uiTexts[currentLang];

  container.innerHTML = '<p class="text-sm text-slate-400">Завантаження відгуків...</p>';

  try {
    const querySnapshot = await getDocs(collection(db, "client_reviews"));
    container.innerHTML = '';

    if (querySnapshot.empty) {
      container.innerHTML = '<p class="text-sm text-slate-500">Поки немає відгуків. Станьте першим!</p>';
      scoreText.innerText = `0.0 (0 ${t.reviewsWord})`;
      graphic.className = "text-slate-500";
      graphic.innerText = "☆☆☆☆☆";
      return;
    }

    let totalRating = 0;
    let count = 0;

    querySnapshot.forEach((docSnap) => {
      const rev = docSnap.data();
      totalRating += rev.rating;
      count++;

      const stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
      
      // Форматирование даты и времени
      let formattedDate = "";
      if (rev.createdAt) {
        const dateObj = rev.createdAt.toDate ? rev.createdAt.toDate() : new Date(rev.createdAt);
        formattedDate = dateObj.toLocaleString(currentLang === 'uk' ? 'uk-UA' : (currentLang === 'lt' ? 'lt-LT' : 'en-US'), {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        formattedDate = new Date().toLocaleDateString();
      }

      const item = document.createElement('div');
      item.className = "p-4 bg-slate-50 rounded-xl border border-slate-200 mb-2";
      item.innerHTML = `
        <div class="flex justify-between items-center mb-1">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 text-sm">${rev.name}</span>
            <span class="text-xs text-slate-400">(${formattedDate})</span>
          </div>
          <span class="text-amber-400 text-sm">${stars}</span>
        </div>
        <p class="text-slate-700 text-sm">${rev.comment}</p>
      `;
      container.appendChild(item);
    });

    const avg = (totalRating / count).toFixed(1);
    const roundedAvg = Math.round(avg);

    scoreText.innerText = `${avg} (${count} ${t.reviewsWord})`;
    graphic.className = "text-amber-400";
    graphic.innerText = '★'.repeat(roundedAvg) + '☆'.repeat(5 - roundedAvg);

  } catch (e) {
    container.innerHTML = '<p class="text-sm text-red-500">Не вдалося завантажити відгуки.</p>';
  }
}

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
  if (pass === '1234' || pass === '5678' || pass === '5399' || pass === '225399') {
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

window.openImageViewer = (url) => {
  const modal = document.getElementById('imageViewerModal');
  document.getElementById('fullSizeImage').src = url;
  modal.classList.remove('hidden');
};
document.getElementById('imageViewerModal').onclick = () => {
  document.getElementById('imageViewerModal').classList.add('hidden');
};

document.getElementById('langSelect').onchange = (e) => {
  currentLang = e.target.value;
  updateTexts();
  renderServices();
  loadReviews();
};

updateTexts();
renderServices();
loadReviews();

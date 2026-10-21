import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let currentLang = 'uk';
const MASTER_PASSWORDS = ["5399", "225399"];

function setMasterAuth(val) {
  if (val) {
    localStorage.setItem('plumbMasterAuth', 'true');
    document.cookie = "plumbMasterAuth=true; max-age=" + (30 * 24 * 60 * 60) + "; path=/";
  } else {
    localStorage.removeItem('plumbMasterAuth');
    document.cookie = "plumbMasterAuth=; max-age=0; path=/";
  }
}

function checkMasterAuth() {
  const local = localStorage.getItem('plumbMasterAuth') === 'true';
  const cookie = document.cookie.split('; ').some(row => row.startsWith('plumbMasterAuth=true'));
  return local || cookie;
}

let isMasterLoggedIn = checkMasterAuth();

const uiTexts = {
  uk: {
    heroTitle: "Професійні сантехнічні послуги",
    heroSubtitle: "Проектування, монтаж систем опалення, водопостачання та якісний ремонт сантехніки",
    callBtn: "📞 Зателефонувати",
    reviewsCount: "Реальні відгуки клієнтів",
    servicesTitle: "Наші послуги та ціни",
    masterBtn: "Майстер",
    masterActive: "Режим майстра активовано",
    addPhotoLabel: "Вибрати фото з галереї:",
    addPhotoBtn: "Завантажити фото",
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
    addPhotoLabel: "Select photo from gallery:",
    addPhotoBtn: "Upload photo",
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
    callBtn: "Skambinti",
    reviewsCount: "Realūs klientų atsiliepimai",
    servicesTitle: "Mūsų Paslaugos ir Kainos",
    masterBtn: "Meistras",
    masterActive: "Meistro režimas aktyvus",
    addPhotoLabel: "Pasirinkti nuotrauką iš galerijos:",
    addPhotoBtn: "Įkelti nuotrauką",
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
  { id: "drainage", uk: "Встановлення дренажу", en: "Drainage installation", lt: "Drenažo įrengimas", price: { uk: "від 25 €", en: "from 25 €", lt: "nuo 25 €" } },
  { id: "small_jobs", uk: "Дрібні сантехнічні роботи", en: "Small plumbing works", lt: "Smulkūs santechnকমার্স darbai", price: { uk: "від 50 €", en: "from 50 €", lt: "nuo 50 €" } },
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
  
  const adminBadge = document.getElementById('adminBadge');
  if (isMasterLoggedIn) {
    adminBadge.classList.remove('hidden');
    adminBadge.innerText = t.masterActive;
  } else {
    adminBadge.classList.add('hidden');
  }

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
        <div id="photos-${service.id}" class="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none" style="scroll-snap-type: x mandatory;"></div>
      </div>
      
      ${isMasterLoggedIn ? `
        <div class="mt-4 border-t pt-3 bg-slate-50 p-2 rounded">
          <p class="text-xs text-slate-500 mb-1">${t.addPhotoLabel}</p>
          <input type="file" id="file-${service.id}" accept="image/*" class="w-full text-xs mb-2">
          <button onclick="window.uploadPhotoToService('${service.id}')" class="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs py-2 rounded font-medium">
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
    let servicePhotosList = [];
    let photoDocs = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.url) {
        servicePhotosList.push(data.url);
        photoDocs.push({ id: docSnap.id, url: data.url });
      }
    });

    if (servicePhotosList.length === 0) {
      photoContainer.style.display = 'none';
      return;
    } else {
      photoContainer.style.display = 'flex';
    }

    photoDocs.forEach((item, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = "relative flex-shrink-0 w-48 h-32 scroll-snap-align-start";

      const img = document.createElement('img');
      img.src = item.url;
      img.className = "w-full h-full object-cover rounded-lg shadow-sm border cursor-pointer hover:opacity-90 transition";
      img.onclick = () => window.openGallery(servicePhotosList, index);
      wrapper.appendChild(img);

      if (index === 0 && servicePhotosList.length > 1) {
        const badge = document.createElement('div');
        badge.className = "absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center pointer-events-none";
        badge.innerHTML = `<span class="text-white text-lg font-bold bg-black/60 px-3 py-1 rounded-full shadow">+${servicePhotosList.length - 1}</span>`;
        wrapper.appendChild(badge);
      }

      if (isMasterLoggedIn) {
        const btn = document.createElement('button');
        btn.innerHTML = "&times;";
        btn.className = "absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow font-bold z-10";
        btn.title = "Видалити фото";
        btn.onclick = async (e) => {
          e.stopPropagation();
          if (confirm("Видалити це фото?")) {
            try {
              await deleteDoc(doc(db, `service_${serviceId}`, item.id));
              location.reload();
            } catch (err) {
              alert("Помилка видалення: " + err.message);
            }
          }
        };
        wrapper.appendChild(btn);
      }

      photoContainer.appendChild(wrapper);
    });
  } catch (e) {
    console.log("Error loading photos:", e);
  }
}

function compressImage(file, callback) {
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const maxDim = 1000;

      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
      callback(compressedBase64);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

window.uploadPhotoToService = async (serviceId) => {
  const fileInput = document.getElementById(`file-${serviceId}`);
  const file = fileInput.files[0];
  if (!file) return alert('Будь ласка, виберіть файл з галереї!');

  compressImage(file, async (compressedUrl) => {
    try {
      await addDoc(collection(db, `service_${serviceId}`), {
        url: compressedUrl,
        createdAt: new Date()
      });
      location.reload();
    } catch (e) {
      alert('Помилка збереження в базу: ' + e.message);
    }
  });
};

let activeServicePhotos = [];
let currentPhotoIndex = 0;

window.openGallery = (photosArray, startIndex) => {
  activeServicePhotos = photosArray;
  currentPhotoIndex = startIndex;
  
  const modal = document.getElementById('imageViewerModal');
  modal.classList.remove('hidden');
  updateGalleryView();
};

function updateGalleryView() {
  const fullImg = document.getElementById('fullSizeImage');
  const counter = document.getElementById('photoCounter');
  
  fullImg.src = activeServicePhotos[currentPhotoIndex];
  counter.innerText = `${currentPhotoIndex + 1} / ${activeServicePhotos.length}`;
}

document.getElementById('prevPhotoBtn').onclick = (e) => {
  e.stopPropagation();
  currentPhotoIndex = (currentPhotoIndex - 1 + activeServicePhotos.length) % activeServicePhotos.length;
  updateGalleryView();
};

document.getElementById('nextPhotoBtn').onclick = (e) => {
  e.stopPropagation();
  currentPhotoIndex = (currentPhotoIndex + 1) % activeServicePhotos.length;
  updateGalleryView();
};

document.getElementById('closeViewerBtn').onclick = () => {
  document.getElementById('imageViewerModal').classList.add('hidden');
};

document.getElementById('imageViewerModal').onclick = (e) => {
  if (e.target.id === 'imageViewerModal') {
    document.getElementById('imageViewerModal').classList.add('hidden');
  }
};

// Загрузка отзывов (неограниченный счетчик + время отправки)
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

    querySnapshot.forEach((doc) => {
      const rev = doc.data();
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
      }

      const item = document.createElement('div');
      item.className = "p-4 bg-slate-50 rounded-xl border border-slate-200";
      item.innerHTML = `
        <div class="flex justify-between items-center mb-1">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 text-sm">${rev.name}</span>
            <span class="text-xs text-slate-400">${formattedDate}</span>
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

// Отправка отзыва с записью текущего времени
document.getElementById('submitReviewBtn').onclick = async () => {
  const name = document.getElementById('clientNameInput').value.trim();
  const rating = parseInt(document.getElementById('clientRatingInput').value);
  const comment = document.getElementById('clientCommentInput').value.trim();

  if (!name || !comment) return alert('Будь ласка, заповніть ім’я та текст відгуку.');

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
    setMasterAuth(false);
    updateTexts();
    renderServices();
  } else {
    loginModal.classList.remove('hidden');
  }
};

document.getElementById('closeLoginModal').onclick = () => loginModal.classList.add('hidden');

document.getElementById('submitMasterPass').onclick = () => {
  const pass = document.getElementById('masterPassInput').value.trim();
  if (MASTER_PASSWORDS.includes(pass)) {
    isMasterLoggedIn = true;
    setMasterAuth(true);
    loginModal.classList.add('hidden');
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

document.getElementById('langSelect').onchange = (e) => {
  currentLang = e.target.value;
  updateTexts();
  renderServices();
  loadReviews();
};

updateTexts();
renderServices();
loadReviews();

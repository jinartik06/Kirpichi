import * as THREE from "./assets/vendor/three.module.js";

let viewerErrorShown = false;

function showViewerError() {
  const viewer = document.querySelector(".viewer-wrap");
  if (!viewer || viewerErrorShown) return;
  viewerErrorShown = true;
  viewer.classList.add("viewer-error");
  viewer.insertAdjacentHTML(
    "beforeend",
    `<div class="viewer-error-message">3D-визуализация временно недоступна. Обновите страницу или попробуйте другой браузер.</div>`,
  );
}

window.addEventListener("error", () => {
  showViewerError();
});

window.addEventListener("unhandledrejection", () => {
  showViewerError();
});

const projectExamples = [];

const pages = {
  promo: {
    title: "Акция",
    kicker: "Спецпредложение",
    text: "При крупной покупке завод предлагает подарок до 1000 кирпичей или индивидуальную скидку. Для небольших партий действует принцип: каждый 10-й кирпич в подарок.",
    cards: [
      ["До 20%", "Скидка на продукцию завода при согласовании объема."],
      ["60 дней", "Хранение приобретенной партии на складе завода."],
      ["7-20 дней", "Ориентировочный срок исполнения заказа по партии."],
    ],
  },
  gallery: {
    title: "Фотогалерея",
    kicker: "Образцы",
    text: "Раздел для демонстрации кирпича, фасадной плитки, кладки и готовых объектов.",
    gallery: [
      ["./assets/site/brick-single.png", "Одинарный пустотелый лицевой"],
      ["./assets/site/brick-mix.png", "Элит микс"],
      ["./assets/site/brick-one-half.png", "Полуторный облицовочный"],
      ["./assets/site/brick-euro.png", "Лицевой евро"],
      ["./assets/site/facade-tile.png", "Фасадная цокольная плитка"],
      ["./assets/site/split-brick.jpg", "Колотый кирпич"],
    ],
  },
  projects: {
    title: "Дома и работы из кирпича",
    kicker: "Примеры работ",
    text: "Подборка фотографий домов, фасадов, заборов и готовых объектов из кирпича.",
    gallery: projectExamples,
  },
  articles: {
    title: "Статьи",
    kicker: "Материалы",
    text: "Полезные материалы для выбора цвета, фактуры и характеристик кирпича.",
    articles: [
      ["12 апреля 2019", "Какого цвета кирпич выбрать для постройки дома?", "Красные, коричневые и серые оттенки хорошо работают на природном фоне, белый и бежевый выглядят спокойнее и дороже."],
      ["12 апреля 2019", "Декоративный кирпич в строительстве", "Фактурный кирпич помогает делать выразительные фасады, интерьеры, колонны и входные группы."],
      ["2 апреля 2019", "Кирпич строительный облицовочный", "При выборе смотрят на геометрию, морозостойкость, водопоглощение, отсутствие трещин и паспорт изделия."],
      ["3 февраля 2014", "Кирпич колотый", "Рваная поверхность напоминает природный камень и подходит для цоколей, заборов и акцентных фасадов."],
    ],
  },
  recommendations: {
    title: "Рекомендации",
    kicker: "Выбор и монтаж",
    text: "Кирпич нужно выбирать по назначению, климату и архитектуре дома. Для фасада важны цвет партии, прочность, водопоглощение и морозостойкость.",
    cards: [
      ["Проверяйте партию", "Для фасада лучше брать объем одной партией, чтобы избежать разнотона."],
      ["Смотрите паспорт", "В документах должны быть прочность, морозостойкость и водопоглощение."],
      ["Подбирайте шов", "Белый шов делает фасад контрастнее, серый и песочный спокойнее."],
    ],
  },
  delivery: {
    title: "Оплата и доставка",
    kicker: "Логистика",
    text: "Завод работает с розничными и оптовыми покупателями, принимает удобные формы оплаты и организует доставку продукции в согласованное время.",
    cards: [
      ["Оплата", "Наличный расчет, перевод, оплата по счету для строительных компаний."],
      ["Доставка", "Отгрузка с завода в Краснодаре, доставка манипулятором или фурой."],
      ["Выгрузка", "Паллеты комплектуются под объект и оттенок, возможна разгрузка на площадке."],
    ],
  },
  contacts: {
    title: "Контакты",
    kicker: "Связь с заводом",
    text: "Россия, Краснодар, ул. Бульвар Строителей 130.",
    cards: [
      ["Телефоны", "8 (918) 948-18-99 · 8 (918) 430-14-41"],
      ["Почта", "elitkirpich@mail.ru"],
      ["Сайт", "элит-кирпич.рф"],
    ],
  },
};

const state = {
  house: "cottage",
  color: "#b65f43",
  colorName: "терракот",
  texture: "smooth",
};

const initialHouse = new URLSearchParams(location.search).get("house");
if (["cottage", "townhouse", "villa"].includes(initialHouse)) {
  state.house = initialHouse;
}

const productGrid = document.querySelector("#product-grid");
const catalogTabs = document.querySelector("#catalog-tabs");
let catalogItems = [];
let activeCatalogGroup = "all";

const removedCatalogItemPattern = /шлакоблок|отсевоблок|отсеваблок|полублок|блок пустотелый|19128753|19128826|19128950|item-191/i;

const categoryShortNames = {
  "КИРПИЧ ОДИНАРНЫЙ ПУСТОТЕЛЫЙ ЛИЦЕВОЙ 40р": "Одинарный",
  "ЭЛИТ МИКС 41р": "Элит микс",
  "Кирпич облицовочный полуторный.": "Полуторный",
  "КИРПИЧ  ОБЛИЦОВОЧНЫЙ ЛИЦЕВОЙ ЕВРО 22р": "Евро",
  "КИРПИЧ ОДИНАРНЫЙ ЛОЖОК 45р": "Ложок",
  "ПЛИТКА ФАСАДНАЯ ЦОКОЛЬНАЯ 250/65/30 1000р.": "Плитка",
};

function renderCatalogTabs() {
  const cleanCatalogItems = catalogItems.filter((item) => !isRemovedCatalogItem(item));
  const groups = ["all", ...new Set(cleanCatalogItems.map((item) => item.category))];
  if (activeCatalogGroup !== "all" && !groups.includes(activeCatalogGroup)) {
    activeCatalogGroup = "all";
  }
  catalogTabs.innerHTML = groups
    .map((group) => {
      const label = group === "all" ? "Все" : categoryShortNames[group] || group;
      return `<button class="catalog-tab ${group === activeCatalogGroup ? "active" : ""}" type="button" data-group="${group}">${label}</button>`;
    })
    .join("");

  catalogTabs.querySelectorAll(".catalog-tab").forEach((button) => {
    button.addEventListener("click", () => {
      activeCatalogGroup = button.dataset.group;
      renderCatalog();
    });
  });
}

function formatCatalogTitle(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  const normalized = text
    .toLocaleLowerCase("ru-RU")
    .replace(/\bбежовый\b/g, "бежевый")
    .replace(/\bжелтый\b/g, "жёлтый")
    .replace(/\bжелтая\b/g, "жёлтая")
    .replace(/\bтеракот\b/g, "терракот")
    .replace(/\bотсеваблок\b/g, "отсевоблок");

  return normalized.charAt(0).toLocaleUpperCase("ru-RU") + normalized.slice(1);
}

function isRemovedCatalogItem(item) {
  return removedCatalogItemPattern.test(
    `${item?.category || ""} ${item?.title || ""} ${item?.id || ""} ${item?.image || ""}`,
  );
}

function renderCatalog() {
  renderCatalogTabs();
  const cleanCatalogItems = catalogItems.filter((item) => !isRemovedCatalogItem(item));
  const visibleItems =
    activeCatalogGroup === "all"
      ? cleanCatalogItems
      : cleanCatalogItems.filter((item) => item.category === activeCatalogGroup);

  productGrid.innerHTML = visibleItems
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-media">
            <img class="product-visual" src="./${product.image}?v=clean-4" alt="${formatCatalogTitle(product.title)}" loading="lazy" />
          </div>
          <span class="product-group">${categoryShortNames[product.category] || product.category}</span>
          <h3>${formatCatalogTitle(product.title)}</h3>
          <span class="price">${product.price} ₽</span>
        </article>
      `,
    )
    .join("");

}

async function loadCatalog() {
  try {
    const response = await fetch("./assets/catalog/items.json?v=20260512-no-blocks");
    const loadedItems = await response.json();
    catalogItems = loadedItems.filter((item) => !isRemovedCatalogItem(item));
    renderCatalog();
    if (Object.hasOwn(pages, location.hash.replace("#", ""))) {
      setTimeout(() => scrollToInnerPages("auto"), 80);
    }
  } catch (error) {
    productGrid.innerHTML = `<article class="info-card"><strong>Каталог временно недоступен</strong><p>Обновите страницу или свяжитесь с заводом по телефону.</p></article>`;
  }
}

loadCatalog();

const contentPanel = document.querySelector("#content-panel");
const contentTabs = [...document.querySelectorAll(".content-tab")];
const navLinks = [...document.querySelectorAll("[data-route]")];
let activeContentPage = "promo";

function scrollToInnerPages(behavior = "smooth") {
  requestAnimationFrame(() => {
    document.querySelector("#inner-pages")?.scrollIntoView({ behavior, block: "start" });
  });
}

function renderPage(pageName) {
  activeContentPage = Object.hasOwn(pages, pageName) ? pageName : "promo";
  const page = pages[activeContentPage];
  const extra = page.gallery
    ? page.gallery.length
      ? `<div class="gallery-grid ${activeContentPage === "projects" ? "projects-gallery" : ""}">${page.gallery
          .map((item, index) => {
            const image = Array.isArray(item) ? item[0] : item.image;
            const label = Array.isArray(item) ? item[1] : item.caption;
            const group = Array.isArray(item) ? "" : item.group;
            const loading = activeContentPage === "projects" && index < 16 ? "eager" : "lazy";
            return `
            <figure class="gallery-tile">
              <img src="${image}" alt="${label}" loading="${loading}" />
              <figcaption>
                <span>${label}</span>
                ${group ? `<small>${group}</small>` : ""}
              </figcaption>
            </figure>
          `;
          })
          .join("")}</div>`
      : `<div class="gallery-loading">Загружаем примеры работ...</div>`
    : page.articles
      ? `<div class="card-grid">${page.articles
          .map(
            ([date, title, text]) => `
              <article class="article-card">
                <time>${date}</time>
                <h3>${title}</h3>
                <p>${text}</p>
              </article>
            `,
          )
          .join("")}</div>`
      : `<div class="card-grid">${page.cards
          .map(
            ([title, text]) => `
              <article class="info-card">
                <strong>${title}</strong>
                <p>${text}</p>
              </article>
            `,
          )
          .join("")}</div>`;

  contentPanel.innerHTML = `
    <div class="content-layout ${activeContentPage === "projects" ? "content-layout-projects" : ""}">
      <div class="feature-block">
        <span class="panel-label">${page.kicker}</span>
        <h2>${page.title}</h2>
        <p>${page.text}</p>
      </div>
      ${extra}
    </div>
  `;

  contentTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.page === activeContentPage));
}

async function loadProjectExamples() {
  try {
    const response = await fetch("./assets/projects/examples.json?v=20260512-projects");
    const examples = await response.json();
    projectExamples.splice(0, projectExamples.length, ...examples);
    if (activeContentPage === "projects") renderPage("projects");
  } catch (error) {
    if (activeContentPage === "projects") renderPage("projects");
  }
}

contentTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    renderPage(tab.dataset.page);
    history.replaceState(null, "", `#${tab.dataset.page}`);
  });
});

loadProjectExamples();

document.querySelector("#menu-toggle").addEventListener("click", () => {
  document.querySelector("#site-nav").classList.toggle("open");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelector("#site-nav").classList.remove("open");
  });
});

function syncRoute() {
  const route = location.hash.replace("#", "") || "home";
  navLinks.forEach((link) => link.classList.toggle("active", link.dataset.route === route));
  if (Object.hasOwn(pages, route)) {
    renderPage(route);
    scrollToInnerPages();
    return;
  }

  const target = document.querySelector(`#${route}`);
  if (route !== "home" && target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

window.addEventListener("hashchange", syncRoute);
renderPage(location.hash.replace("#", "") || "promo");
syncRoute();

const canvas = document.querySelector("#brick-viewer");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfe3f3);
scene.fog = new THREE.Fog(0xcfe3f3, 12, 26);
const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
camera.position.set(6.9, 4.6, 8.8);
camera.lookAt(0, 1.35, 0);

const root = new THREE.Group();
root.scale.setScalar(0.78);
scene.add(root);

const sun = new THREE.DirectionalLight(0xffffff, 4.2);
sun.position.set(4.5, 8, 5.5);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 24;
sun.shadow.camera.left = -8;
sun.shadow.camera.right = 8;
sun.shadow.camera.top = 8;
sun.shadow.camera.bottom = -8;
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xe5f2ff, 0xb9a88d, 2.25));
scene.add(new THREE.AmbientLight(0xfff6ea, 0.72));

const ground = new THREE.Mesh(new THREE.CircleGeometry(9, 96), createGroundMaterial());
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

let brickMaterial = createBrickMaterial(state.color, state.texture);
const roofMaterial = createRoofMaterial();
const trimMaterial = new THREE.MeshStandardMaterial({ color: 0xf6ead8, roughness: 0.65 });
const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x7897a8, roughness: 0.18, metalness: 0.08 });
const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x5a3324, roughness: 0.72 });
const doorTrimMaterial = new THREE.MeshStandardMaterial({ color: 0x2f221c, roughness: 0.78 });
const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x9f9282, roughness: 0.9 });
const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x718262, roughness: 0.95 });
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x6b4b33, roughness: 0.9 });
const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x6e6359, roughness: 0.58, metalness: 0.18 });
const outlineMaterial = new THREE.LineBasicMaterial({
  color: 0x2d211b,
  transparent: true,
  opacity: 0.18,
});

function createGroundMaterial() {
  const size = 512;
  const canvasTexture = document.createElement("canvas");
  canvasTexture.width = size;
  canvasTexture.height = size;
  const ctx = canvasTexture.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#7f9d6f");
  gradient.addColorStop(0.45, "#c4b796");
  gradient.addColorStop(1, "#6f8c5d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 1200; i += 1) {
    ctx.fillStyle = `rgba(${90 + Math.random() * 80}, ${95 + Math.random() * 80}, ${60 + Math.random() * 50}, .16)`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }
  const textureMap = new THREE.CanvasTexture(canvasTexture);
  textureMap.wrapS = THREE.RepeatWrapping;
  textureMap.wrapT = THREE.RepeatWrapping;
  textureMap.repeat.set(2, 2);
  textureMap.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map: textureMap, roughness: 0.96 });
}

function createRoofMaterial() {
  const size = 512;
  const canvasTexture = document.createElement("canvas");
  canvasTexture.width = size;
  canvasTexture.height = size;
  const ctx = canvasTexture.getContext("2d");
  ctx.fillStyle = "#51443c";
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 36) {
    ctx.fillStyle = "rgba(255,255,255,.07)";
    ctx.fillRect(0, y, size, 2);
    ctx.fillStyle = "rgba(0,0,0,.13)";
    ctx.fillRect(0, y + 18, size, 1);
    for (let x = (y / 36) % 2 ? -32 : 0; x < size; x += 64) {
      ctx.fillStyle = "rgba(255,255,255,.035)";
      ctx.fillRect(x, y + 2, 2, 17);
    }
  }
  const textureMap = new THREE.CanvasTexture(canvasTexture);
  textureMap.wrapS = THREE.RepeatWrapping;
  textureMap.wrapT = THREE.RepeatWrapping;
  textureMap.repeat.set(1.35, 1.1);
  textureMap.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ color: 0xffffff, map: textureMap, roughness: 0.74, metalness: 0.04 });
}

function createBrickTexture(color, texture) {
  const size = 512;
  const canvasTexture = document.createElement("canvas");
  canvasTexture.width = size;
  canvasTexture.height = size;
  const ctx = canvasTexture.getContext("2d");
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  const rows = 12;
  const brickH = size / rows;
  for (let y = 0; y < rows; y += 1) {
    const offset = y % 2 === 0 ? 0 : size / 10;
    for (let x = -offset; x < size; x += size / 5) {
      const shade = texture === "mix" ? 18 + ((x + y * 7) % 32) : texture === "split" ? -18 + ((x * y) % 38) : 0;
      ctx.fillStyle = shade >= 0 ? `rgba(255,255,255,${shade / 180})` : `rgba(0,0,0,${Math.abs(shade) / 150})`;
      ctx.fillRect(x + 2, y * brickH + 2, size / 5 - 4, brickH - 4);
      if (texture === "split") {
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(x + 8, y * brickH + 8, size / 8, 2);
      }
    }
  }

  ctx.strokeStyle = "rgba(255,250,243,0.72)";
  ctx.lineWidth = 5;
  for (let y = 0; y <= rows; y += 1) {
    ctx.beginPath();
    ctx.moveTo(0, y * brickH);
    ctx.lineTo(size, y * brickH);
    ctx.stroke();
  }

  for (let y = 0; y < rows; y += 1) {
    const offset = y % 2 === 0 ? 0 : size / 10;
    for (let x = -offset; x <= size; x += size / 5) {
      ctx.beginPath();
      ctx.moveTo(x, y * brickH);
      ctx.lineTo(x, (y + 1) * brickH);
      ctx.stroke();
    }
  }

  const textureMap = new THREE.CanvasTexture(canvasTexture);
  textureMap.wrapS = THREE.RepeatWrapping;
  textureMap.wrapT = THREE.RepeatWrapping;
  textureMap.repeat.set(3.1, 2.05);
  textureMap.colorSpace = THREE.SRGBColorSpace;
  return textureMap;
}

function createBrickMaterial(color, texture) {
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: createBrickTexture(color, texture),
    roughness: texture === "smooth" ? 0.62 : 0.88,
    bumpMap: createBrickTexture("#808080", texture),
    bumpScale: texture === "split" ? 0.055 : 0.025,
  });
}

function box(width, height, depth, material, x, y, z) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), outlineMaterial);
  edges.renderOrder = 2;
  mesh.add(edges);
  root.add(mesh);
  return mesh;
}

function windowUnit(x, y, z, options = {}) {
  const width = options.width ?? 0.44;
  const height = options.height ?? 0.58;
  const trim = 0.045;
  box(width, height, 0.045, glassMaterial, x, y, z);
  box(width + trim * 2, trim, 0.06, trimMaterial, x, y + height / 2 + trim / 2, z + 0.012);
  box(width + trim * 2, trim, 0.06, trimMaterial, x, y - height / 2 - trim / 2, z + 0.012);
  box(trim, height + trim * 2, 0.06, trimMaterial, x - width / 2 - trim / 2, y, z + 0.012);
  box(trim, height + trim * 2, 0.06, trimMaterial, x + width / 2 + trim / 2, y, z + 0.012);
  box(trim * 0.58, height, 0.064, trimMaterial, x, y, z + 0.018);
  box(width, trim * 0.5, 0.064, trimMaterial, x, y, z + 0.018);
  box(width + 0.14, 0.07, 0.13, stoneMaterial, x, y - height / 2 - 0.1, z + 0.02);
}

function sideWindowUnit(x, y, z, options = {}) {
  const width = options.width ?? 0.44;
  const height = options.height ?? 0.58;
  const trim = 0.045;
  box(0.045, height, width, glassMaterial, x, y, z);
  box(0.06, trim, width + trim * 2, trimMaterial, x + 0.012, y + height / 2 + trim / 2, z);
  box(0.06, trim, width + trim * 2, trimMaterial, x + 0.012, y - height / 2 - trim / 2, z);
  box(0.06, height + trim * 2, trim, trimMaterial, x + 0.012, y, z - width / 2 - trim / 2);
  box(0.06, height + trim * 2, trim, trimMaterial, x + 0.012, y, z + width / 2 + trim / 2);
  box(0.064, height, trim * 0.58, trimMaterial, x + 0.018, y, z);
  box(0.064, trim * 0.5, width, trimMaterial, x + 0.018, y, z);
  box(0.13, 0.07, width + 0.14, stoneMaterial, x + 0.02, y - height / 2 - 0.1, z);
}

function backWindowUnit(x, y, z, options = {}) {
  const width = options.width ?? 0.44;
  const height = options.height ?? 0.58;
  const trim = 0.045;
  box(width, height, 0.045, glassMaterial, x, y, z);
  box(width + trim * 2, trim, 0.06, trimMaterial, x, y + height / 2 + trim / 2, z - 0.012);
  box(width + trim * 2, trim, 0.06, trimMaterial, x, y - height / 2 - trim / 2, z - 0.012);
  box(trim, height + trim * 2, 0.06, trimMaterial, x - width / 2 - trim / 2, y, z - 0.012);
  box(trim, height + trim * 2, 0.06, trimMaterial, x + width / 2 + trim / 2, y, z - 0.012);
  box(trim * 0.58, height, 0.064, trimMaterial, x, y, z - 0.018);
  box(width, trim * 0.5, 0.064, trimMaterial, x, y, z - 0.018);
  box(width + 0.14, 0.07, 0.13, stoneMaterial, x, y - height / 2 - 0.1, z - 0.02);
}

function leftWindowUnit(x, y, z, options = {}) {
  const width = options.width ?? 0.44;
  const height = options.height ?? 0.58;
  const trim = 0.045;
  box(0.045, height, width, glassMaterial, x, y, z);
  box(0.06, trim, width + trim * 2, trimMaterial, x - 0.012, y + height / 2 + trim / 2, z);
  box(0.06, trim, width + trim * 2, trimMaterial, x - 0.012, y - height / 2 - trim / 2, z);
  box(0.06, height + trim * 2, trim, trimMaterial, x - 0.012, y, z - width / 2 - trim / 2);
  box(0.06, height + trim * 2, trim, trimMaterial, x - 0.012, y, z + width / 2 + trim / 2);
  box(0.064, height, trim * 0.58, trimMaterial, x - 0.018, y, z);
  box(0.064, trim * 0.5, width, trimMaterial, x - 0.018, y, z);
  box(0.13, 0.07, width + 0.14, stoneMaterial, x - 0.02, y - height / 2 - 0.1, z);
}

function doorUnit(x, z) {
  box(0.88, 1.42, 0.09, doorTrimMaterial, x, 0.72, z + 0.005);
  box(0.68, 1.2, 0.1, doorMaterial, x, 0.62, z + 0.045);
  box(0.5, 0.28, 0.035, glassMaterial, x, 1.02, z + 0.105);
  box(0.54, 0.045, 0.05, doorTrimMaterial, x, 0.84, z + 0.115);
  box(0.54, 0.045, 0.05, doorTrimMaterial, x, 0.48, z + 0.115);
  box(0.045, 0.52, 0.05, doorTrimMaterial, x - 0.29, 0.62, z + 0.115);
  box(0.045, 0.52, 0.05, doorTrimMaterial, x + 0.29, 0.62, z + 0.115);
  box(0.045, 0.56, 0.05, doorTrimMaterial, x, 0.62, z + 0.118);
  box(0.12, 0.04, 0.04, trimMaterial, x + 0.21, 0.67, z + 0.13);
  box(1.02, 0.08, 0.3, roofMaterial, x, 1.5, z + 0.08);
  box(0.86, 0.07, 0.2, stoneMaterial, x, 0.04, z + 0.04);
}

function steps(x, z) {
  box(1.16, 0.14, 0.58, stoneMaterial, x, 0.07, z + 0.2);
  box(1.45, 0.12, 0.76, stoneMaterial, x, 0.06, z + 0.72);
  box(1.76, 0.1, 0.94, stoneMaterial, x, 0.05, z + 1.2);
}

function chimney(x, z, height = 0.78) {
  box(0.34, height, 0.34, brickMaterial, x, 3.15, z);
  box(0.48, 0.12, 0.48, roofMaterial, x, 3.58, z);
}

function roof(width, depth, height, x, y, z, options = {}) {
  const overhang = options.overhang ?? 0.28;
  const w = width + overhang;
  const d = depth + overhang;
  const ridge = Math.max(0.65, w * (options.ridgeRatio ?? 0.42));
  const vertices = new Float32Array([
    -w / 2, 0, -d / 2,
    w / 2, 0, -d / 2,
    w / 2, 0, d / 2,
    -w / 2, 0, d / 2,
    -ridge / 2, height, 0,
    ridge / 2, height, 0,
  ]);
  const indices = [
    0, 1, 5, 0, 5, 4,
    1, 2, 5,
    2, 3, 4, 2, 4, 5,
    3, 0, 4,
    0, 3, 2, 0, 2, 1,
  ];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, roofMaterial);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), outlineMaterial);
  edges.renderOrder = 2;
  mesh.add(edges);
  root.add(mesh);
  box(width + 0.24, 0.1, 0.1, roofMaterial, x, y + 0.02, z - d / 2 + 0.05);
  box(width + 0.24, 0.1, 0.1, roofMaterial, x, y + 0.02, z + d / 2 - 0.05);
  box(0.12, 0.1, depth + 0.06, roofMaterial, x - w / 2 + 0.06, y + 0.02, z);
  box(0.12, 0.1, depth + 0.06, roofMaterial, x + w / 2 - 0.06, y + 0.02, z);
}

function flatTrim(width, depth, x, y, z) {
  box(width, 0.12, 0.14, trimMaterial, x, y, z - depth / 2);
  box(width, 0.12, 0.14, trimMaterial, x, y, z + depth / 2);
  box(0.14, 0.12, depth, trimMaterial, x - width / 2, y, z);
  box(0.14, 0.12, depth, trimMaterial, x + width / 2, y, z);
}

function balcony(width, x, y, z) {
  box(width, 0.14, 0.22, stoneMaterial, x, y, z);
  box(width, 0.08, 0.08, metalMaterial, x, y + 0.38, z + 0.09);
  const postCount = Math.max(3, Math.round(width / 0.42));
  for (let i = 0; i < postCount; i += 1) {
    const px = x - width / 2 + (width / (postCount - 1)) * i;
    box(0.05, 0.42, 0.05, metalMaterial, px, y + 0.18, z + 0.09);
  }
}

function addWindows(width, z, count, y = 1.5) {
  const step = width / (count + 1);
  for (let i = 1; i <= count; i += 1) {
    windowUnit(-width / 2 + step * i, y, z);
  }
}

function addWindowRow(xs, y, z, options = {}) {
  xs.forEach((x) => windowUnit(x, y, z, options));
}

function sceneBox(width, height, depth, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function addTree(x, z, scale = 1) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.11 * scale, 0.9 * scale, 8), trunkMaterial);
  trunk.position.set(x, 0.45 * scale, z);
  trunk.castShadow = true;
  scene.add(trunk);

  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.58 * scale, 1.45 * scale, 10), grassMaterial);
  crown.position.set(x, 1.35 * scale, z);
  crown.castShadow = true;
  scene.add(crown);
}

function addEnvironment() {
  sceneBox(3.4, 0.06, 0.72, stoneMaterial, -2.1, 0.035, 3.15);
  sceneBox(2.6, 0.05, 0.38, stoneMaterial, 1.2, 0.03, 3.52);
  sceneBox(0.08, 0.72, 5.2, new THREE.MeshStandardMaterial({ color: 0x7b5a42, roughness: 0.82 }), -5.8, 0.36, -0.8);
  [-6.8, -4.9, 4.9, 6.4].forEach((x, index) => addTree(x, index % 2 ? -3.6 : 3.8, index % 2 ? 0.88 : 1.05));
}

addEnvironment();

function buildHouse(type) {
  root.clear();
  if (type === "cottage") {
    box(4.1, 0.22, 3.1, stoneMaterial, 0, 0.11, 0);
    box(3.8, 2.2, 2.8, brickMaterial, 0, 1.1, 0);
    flatTrim(3.95, 2.95, 0, 2.22, 0);
    roof(4.35, 3.15, 0.92, 0, 2.28, 0, { ridgeRatio: 0.45 });
    chimney(-1.2, -0.42);
    doorUnit(0, 1.45);
    steps(0, 1.38);
    addWindowRow([-1.2, 1.2], 1.34, 1.43, { width: 0.42, height: 0.52 });
    sideWindowUnit(1.92, 1.34, -0.72, { width: 0.42, height: 0.52 });
    leftWindowUnit(-1.92, 1.34, -0.72, { width: 0.42, height: 0.52 });
    addWindowRow([-0.8, 0.8], 1.34, -1.43, { width: 0.42, height: 0.52 });
  }
  if (type === "townhouse") {
    box(7.45, 0.22, 2.95, stoneMaterial, 0, 0.11, 0);
    box(7.1, 2.32, 2.62, brickMaterial, 0, 1.16, 0);
    [-1.18, 1.18].forEach((x) => box(0.08, 2.38, 2.7, trimMaterial, x, 1.19, 0));
    flatTrim(7.24, 2.74, 0, 2.36, 0);
    roof(7.46, 3.05, 0.9, 0, 2.42, 0, { ridgeRatio: 0.58 });
    [-2.3, 0, 2.3].forEach((x) => {
      doorUnit(x - 0.5, 1.35);
      steps(x - 0.5, 1.28);
      windowUnit(x + 0.58, 1.3, 1.35, { width: 0.36, height: 0.5 });
      windowUnit(x - 0.5, 1.94, 1.35, { width: 0.32, height: 0.34 });
      backWindowUnit(x - 0.52, 1.3, -1.35, { width: 0.36, height: 0.5 });
    });
    leftWindowUnit(-3.56, 1.3, -0.72, { width: 0.38, height: 0.5 });
    chimney(2.9, -0.38, 0.72);
  }
  if (type === "villa") {
    box(5.45, 0.24, 3.45, stoneMaterial, 0, 0.12, 0);
    box(5.05, 2.25, 3.05, brickMaterial, 0, 1.12, 0);
    box(2.25, 1.18, 2.62, brickMaterial, 0, 2.83, -0.08);
    flatTrim(5.18, 3.18, 0, 2.26, 0);
    roof(5.62, 3.56, 0.84, 0, 2.34, 0, { ridgeRatio: 0.52 });
    flatTrim(2.38, 2.74, 0, 3.43, -0.08);
    roof(2.74, 2.98, 0.58, 0, 3.5, -0.08, { ridgeRatio: 0.36 });
    chimney(1.75, -0.55, 0.9);
    addWindowRow([-1.8, 1.8], 1.32, 1.53, { width: 0.42, height: 0.52 });
    addWindowRow([-1.1, 1.1], 1.9, 1.53, { width: 0.46, height: 0.36 });
    addWindowRow([-0.48, 0.48], 2.82, 1.33, { width: 0.34, height: 0.44 });
    sideWindowUnit(2.56, 1.32, -0.68, { width: 0.4, height: 0.52 });
    leftWindowUnit(-2.56, 1.32, -0.68, { width: 0.4, height: 0.52 });
    [-0.95, 0.95].forEach((x) => backWindowUnit(x, 1.32, -1.53, { width: 0.4, height: 0.52 }));
    balcony(2.1, 0, 2.2, 1.64);
    doorUnit(0, 1.55);
    steps(0, 1.5);
  }
}

function updateMaterial() {
  brickMaterial = createBrickMaterial(state.color, state.texture);
  buildHouse(state.house);
  const textureLabel = { smooth: "гладкий", split: "колотый", mix: "элит микс" }[state.texture];
  const houseLabel = { cottage: "Коттедж", townhouse: "Таунхаус", villa: "Вилла" }[state.house];
  document.querySelector("#selected-label").textContent = `${houseLabel} · ${state.colorName} · ${textureLabel}`;
}

document.querySelectorAll(".house-tab").forEach((button) => {
  button.classList.toggle("active", button.dataset.house === state.house);
});
updateMaterial();

let targetRotation = -0.45;
let rotation = targetRotation;
let dragging = false;
let lastX = 0;

canvas.addEventListener("pointerdown", (event) => {
  dragging = true;
  lastX = event.clientX;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  targetRotation += (event.clientX - lastX) * 0.01;
  lastX = event.clientX;
});

canvas.addEventListener("pointerup", () => {
  dragging = false;
});

document.querySelector("#reset-view").addEventListener("click", () => {
  targetRotation = -0.45;
});

document.querySelectorAll(".house-tab").forEach((button) => {
  button.addEventListener("click", () => {
    state.house = button.dataset.house;
    document.querySelectorAll(".house-tab").forEach((item) => item.classList.toggle("active", item === button));
    updateMaterial();
  });
});

document.querySelectorAll(".texture-tab").forEach((button) => {
  button.addEventListener("click", () => {
    state.texture = button.dataset.texture;
    document.querySelectorAll(".texture-tab").forEach((item) => item.classList.toggle("active", item === button));
    updateMaterial();
  });
});

document.querySelectorAll(".swatch").forEach((button) => {
  button.addEventListener("click", () => {
    state.color = button.dataset.color;
    state.colorName = button.dataset.name;
    document.querySelectorAll(".swatch").forEach((item) => item.classList.toggle("active", item === button));
    updateMaterial();
  });
});

function resize() {
  const rect = canvas.parentElement.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  camera.lookAt(0, 1.35, 0);
}

function animate() {
  rotation += (targetRotation - rotation) * 0.08;
  root.rotation.y = rotation;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);
resize();
animate();

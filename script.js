"use strict";

/* =========================================================
   1. ДАННЫЕ — сюда добавляй свои видео, чемпионов и головоломки
   ========================================================= */

// videoId — это 11 символов после "v=" в ссылке YouTube.
// Пример: youtube.com/watch?v=dQw4w9WgXcQ  →  videoId: "dQw4w9WgXcQ"
const videos = [
  {
    title: "You NEED high IQ to solve the Rubik's Cube",
    author: "Твой любимый канал",
    level: "beginner",
    puzzle: "3×3",
    videoId: "https://youtu.be/ckImFiowc0M?si=VFpkVnTjPtaaOpYs"
  },
  {
    title: "F2L for beginners",
    author: "Yiheng Wang",
    level: "advanced",
    puzzle: "3×3",
    videoId: "https://youtu.be/Hx9ZbPdX8zM?si=2qhHJWq-YW7vaTOz"
  },
  {
    title: "Как собирать быстрее: советы чемпиона",
    author: "Yiheng Wang",
    level: "advanced",
    puzzle: "3×3",
    videoId: "ВСТАВЬ_ID"
  },
  {
    title: "Кубик 2×2 за пять минут",
    author: "Твой любимый канал",
    level: "beginner",
    puzzle: "2×2",
    videoId: "ВСТАВЬ_ID"
  },
  {
    title: "Как собрать Pyraminx",
    author: "Твой любимый канал",
    level: "beginner",
    puzzle: "Pyraminx",
    videoId: "ВСТАВЬ_ID"
  },
  {
    title: "Кубик 4×4: паритеты и редукция",
    author: "Max Park",
    level: "advanced",
    puzzle: "4×4",
    videoId: "ВСТАВЬ_ID"
  }
];

// Проверь факты на worldcubeassociation.org — рекорды меняются!
const champions = [
  {
    name: "Yiheng Wang",
    country: "Китай 🇨🇳",
    info: "Один из самых быстрых спидкуберов мира в сборке 3×3.",
    tags: ["3×3"],
    photo: "images/yiheng-wang.jpg"
  },
  {
    name: "Max Park",
    country: "США 🇺🇸",
    info: "Многократный чемпион мира, сильнейший в нескольких дисциплинах.",
    tags: ["3×3", "4×4", "5×5"],
    photo: "images/max-park.jpg"
  },
  {
    name: "Feliks Zemdegs",
    country: "Австралия 🇦🇺",
    info: "Легенда спидкубинга, известен рекордами и обучающими видео.",
    tags: ["3×3", "CFOP"],
    photo: "images/feliks-zemdegs.jpg"
  },
  {
    name: "Yusheng Du",
    country: "Китай 🇨🇳",
    info: "Первым на соревновании собрал 3×3 быстрее 4 секунд (3,47 с, 2018 год).",
    tags: ["3×3"],
    photo: "images/yusheng-du.jpg"
  },
  {
    name: "Mats Valk",
    country: "Нидерланды 🇳🇱",
    info: "Бывший рекордсмен мира в 3×3 (5,55 с, 2013 год).",
    tags: ["3×3"],
    photo: "images/mats-valk.jpg"
  }
];

const puzzles = [
  { name: "2×2", sub: "Pocket Cube", stars: 1, size: 2,
    text: "Самый простой кубик: без рёбер и центров. Отличный старт." },
  { name: "3×3", sub: "Классический кубик Рубика", stars: 2, size: 3,
    text: "Тот самый кубик. Главная дисциплина соревнований." },
  { name: "4×4", sub: "Rubik's Revenge", stars: 3, size: 4,
    text: "Нет центральных фишек, поэтому появляются паритеты." },
  { name: "5×5", sub: "Professor's Cube", stars: 3, size: 5,
    text: "Редукция до 3×3. Требует терпения и аккуратности." },
  { name: "Pyraminx", sub: "Пирамидка", stars: 2, shape: "pyraminx",
    text: "Тетраэдр с четырьмя цветами. Собирается очень быстро." },
  { name: "Megaminx", sub: "Двенадцатигранник", stars: 4, shape: "megaminx",
    text: "Как 3×3, только пятиугольные грани и 12 цветов." },
  { name: "Skewb", sub: "Скьюб", stars: 3, shape: "skewb",
    text: "Куб с поворотами по диагонали, углы и центры двигаются вместе." },
  { name: "Square-1", sub: "Скваер-1", stars: 5, shape: "square1",
    text: "Меняет форму во время сборки. Одна из самых хитрых." },
  { name: "Clock", sub: "Часы", stars: 2, shape: "clock",
    text: "Две стороны с циферблатами, нужно выставить все стрелки на 12." }
];

/* =========================================================
   2. МЕЛКИЕ ПОМОЩНИКИ
   ========================================================= */

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function randInt(max) {
  return Math.floor(Math.random() * max);
}

/* =========================================================
   3. 3D КУБИК (настоящая логика поворотов для любого размера)
   ========================================================= */

const FACE_COLORS = {
  U: "#ffffff", // белый
  D: "#ffd500", // жёлтый
  F: "#009b48", // зелёный
  B: "#0046ad", // синий
  R: "#b71234", // красный
  L: "#ff5800"  // оранжевый
};

const FACE_NORMALS = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
  R: [1, 0, 0],
  L: [-1, 0, 0]
};

const AXIS_OF = { U: 1, D: 1, R: 0, L: 0, F: 2, B: 2 };
const SIGN_OF = { U: 1, D: -1, R: 1, L: -1, F: 1, B: -1 };

const HALF = "translateZ(calc(var(--size) / 2))";
const FACE_TRANSFORM = {
  F: HALF,
  B: "rotateY(180deg) " + HALF,
  R: "rotateY(90deg) " + HALF,
  L: "rotateY(-90deg) " + HALF,
  U: "rotateX(90deg) " + HALF,
  D: "rotateX(-90deg) " + HALF
};

function faceFromNormal(v) {
  if (v[1] === 1) return "U";
  if (v[1] === -1) return "D";
  if (v[2] === 1) return "F";
  if (v[2] === -1) return "B";
  if (v[0] === 1) return "R";
  return "L";
}

// Позиция наклейки в 3D → строка и столбец на её грани
function gridPos(face, p, off) {
  const x = p[0], y = p[1], z = p[2];
  switch (face) {
    case "F": return [off - y, x + off];
    case "B": return [off - y, off - x];
    case "R": return [off - y, off - z];
    case "L": return [off - y, z + off];
    case "U": return [z + off, x + off];
    default:  return [off - z, x + off]; // D
  }
}

// Обратное: строка и столбец на грани → позиция в 3D
function startPos(face, r, c, off) {
  switch (face) {
    case "F": return [c - off, off - r, off];
    case "B": return [off - c, off - r, -off];
    case "R": return [off, off - r, off - c];
    case "L": return [-off, off - r, c - off];
    case "U": return [c - off, off, r - off];
    default:  return [c - off, -off, off - r]; // D
  }
}

// Поворот вектора на 90° вокруг оси
function rotateVec(v, axis, dir) {
  const b = (axis + 1) % 3;
  const c = (axis + 2) % 3;
  const out = v.slice();
  if (dir > 0) {
    out[b] = -v[c];
    out[c] = v[b];
  } else {
    out[b] = v[c];
    out[c] = -v[b];
  }
  return out;
}

class RubiksCube {
  constructor(cubeEl, n) {
    this.el = cubeEl;
    this.n = n || 3;
    this.faces = {};
    this.stickers = [];
    this.history = [];
    this.busy = false;
    this.onChange = null;
    this.buildFaces();
    this.reset();
  }

  buildFaces() {
    this.el.innerHTML = "";
    const names = Object.keys(FACE_TRANSFORM);
    for (let i = 0; i < names.length; i++) {
      const f = names[i];
      const d = el("div", "face");
      d.style.transform = FACE_TRANSFORM[f];
      this.el.appendChild(d);
      this.faces[f] = d;
    }
  }

  setSize(n) {
    this.n = n;
    this.reset();
  }

  reset() {
    const n = this.n;
    const off = (n - 1) / 2;
    this.stickers = [];
    this.history = [];
    const names = Object.keys(FACE_COLORS);
    for (let i = 0; i < names.length; i++) {
      const f = names[i];
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          this.stickers.push({
            p: startPos(f, r, c, off),
            nv: FACE_NORMALS[f].slice(),
            color: FACE_COLORS[f]
          });
        }
      }
    }
    this.render();
    this.notify();
  }

  render() {
    const n = this.n;
    const off = (n - 1) / 2;
    const grids = {};
    const names = Object.keys(FACE_COLORS);

    names.forEach(function (f) {
      grids[f] = new Array(n * n).fill("#222");
    });

    this.stickers.forEach(function (s) {
      const f = faceFromNormal(s.nv);
      const pos = gridPos(f, s.p, off);
      grids[f][Math.round(pos[0]) * n + Math.round(pos[1])] = s.color;
    });

    const self = this;
    names.forEach(function (f) {
      const faceEl = self.faces[f];
      faceEl.style.setProperty("--n", n);
      faceEl.innerHTML = "";
      grids[f].forEach(function (color) {
        const d = el("div", "sticker");
        d.style.background = color;
        faceEl.appendChild(d);
      });
    });
  }

  notify() {
    if (this.onChange) this.onChange(this);
  }

  applyMove(move, record) {
    this.stickers.forEach(function (s) {
      if (Math.abs(s.p[move.axis] - move.coord) < 0.01) {
        s.p = rotateVec(s.p, move.axis, move.dir);
        s.nv = rotateVec(s.nv, move.axis, move.dir);
      }
    });
    if (record !== false) this.history.push(move);
    this.render();
    this.notify();
  }

  turnFace(face, prime) {
    if (this.busy) return;
    const off = (this.n - 1) / 2;
    const sign = SIGN_OF[face];
    let dir = sign > 0 ? -1 : 1; // по часовой, если смотреть на грань
    if (prime) dir = -dir;
    this.applyMove({ axis: AXIS_OF[face], coord: sign * off, dir: dir });
  }

  randomMove() {
    const off = (this.n - 1) / 2;
    return {
      axis: randInt(3),
      coord: randInt(this.n) - off,
      dir: Math.random() < 0.5 ? 1 : -1
    };
  }

  async scramble() {
    if (this.busy) return;
    this.busy = true;
    const total = 14 + this.n * 3;
    let last = null;
    for (let i = 0; i < total; i++) {
      let mv;
      do {
        mv = this.randomMove();
      } while (last && mv.axis === last.axis && mv.coord === last.coord);
      this.applyMove(mv);
      last = mv;
      await sleep(70);
    }
    this.busy = false;
  }

  async solve() {
    if (this.busy || this.history.length === 0) return;
    this.busy = true;
    while (this.history.length > 0) {
      const m = this.history.pop();
      this.applyMove({ axis: m.axis, coord: m.coord, dir: -m.dir }, false);
      await sleep(55);
    }
    this.busy = false;
  }
}

// Вращение кубика пальцем и мышкой
function makeDraggable(sceneEl, cubeEl, rx, ry, auto) {
  const state = { rx: rx, ry: ry, auto: auto, dragging: false };
  let lastX = 0;
  let lastY = 0;

  function apply() {
    cubeEl.style.transform =
      "rotateX(" + state.rx + "deg) rotateY(" + state.ry + "deg)";
  }

  sceneEl.addEventListener("pointerdown", function (e) {
    state.dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    sceneEl.setPointerCapture(e.pointerId);
    sceneEl.style.cursor = "grabbing";
  });

  sceneEl.addEventListener("pointermove", function (e) {
    if (!state.dragging) return;
    state.ry += (e.clientX - lastX) * 0.6;
    state.rx -= (e.clientY - lastY) * 0.6;
    state.rx = Math.max(-90, Math.min(90, state.rx));
    lastX = e.clientX;
    lastY = e.clientY;
    apply();
  });

  function stopDrag() {
    state.dragging = false;
    sceneEl.style.cursor = "grab";
  }
  sceneEl.addEventListener("pointerup", stopDrag);
  sceneEl.addEventListener("pointercancel", stopDrag);

  function loop() {
    if (state.auto && !state.dragging) {
      state.ry += 0.35;
      apply();
    }
    requestAnimationFrame(loop);
  }

  apply();
  loop();
  return state;
}

/* =========================================================
   4. ГЛАВНЫЙ КУБИК (сам крутится и двигает слои)
   ========================================================= */

const heroCube = new RubiksCube(document.getElementById("hero-cube"), 3);
makeDraggable(
  document.getElementById("hero-scene"),
  document.getElementById("hero-cube"),
  -28, -38, true
);

setInterval(function () {
  if (!heroCube.busy) {
    heroCube.applyMove(heroCube.randomMove(), false);
  }
}, 1300);

/* =========================================================
   5. 3D ЛАБОРАТОРИЯ
   ========================================================= */

const labCube = new RubiksCube(document.getElementById("lab-cube"), 3);
const labView = makeDraggable(
  document.getElementById("lab-scene"),
  document.getElementById("lab-cube"),
  -28, -38, true
);

const moveLog = document.getElementById("move-log");
labCube.onChange = function (cube) {
  moveLog.textContent = "Ходов: " + cube.history.length;
};

const sizeChips = document.querySelectorAll("#size-chips .chip");

function selectSize(n) {
  if (labCube.busy) return;
  sizeChips.forEach(function (chip) {
    chip.classList.toggle("active", Number(chip.dataset.n) === n);
  });
  labCube.setSize(n);
}

sizeChips.forEach(function (chip) {
  chip.addEventListener("click", function () {
    selectSize(Number(chip.dataset.n));
  });
});

document.querySelectorAll(".move").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const prime = document.getElementById("prime").checked;
    labCube.turnFace(btn.dataset.face, prime);
  });
});

document.getElementById("btn-scramble").addEventListener("click", function () {
  labCube.scramble();
});

document.getElementById("btn-solve").addEventListener("click", function () {
  labCube.solve();
});

document.getElementById("btn-reset").addEventListener("click", function () {
  if (!labCube.busy) labCube.reset();
});

const autoBtn = document.getElementById("btn-auto");
autoBtn.addEventListener("click", function () {
  labView.auto = !labView.auto;
  autoBtn.textContent = "🔄 Автовращение: " + (labView.auto ? "вкл" : "выкл");
});

/* =========================================================
   6. ВИДЕО (поиск + фильтр + плеер по нажатию)
   ========================================================= */

const videoGrid = document.getElementById("video-grid");
const searchInput = document.getElementById("search");
const levelChips = document.querySelectorAll("#level-chips .chip");
const LEVEL_NAMES = { beginner: "Новичкам", advanced: "Продвинутым" };

let currentLevel = "all";

function isRealVideoId(id) {
  return /^[A-Za-z0-9_-]{11}$/.test(id);
}

function buildVideoCard(video) {
  const card = el("article", "card");
  let thumb;

  if (isRealVideoId(video.videoId)) {
    thumb = el("button", "thumb");
    thumb.style.backgroundImage =
      "url(https://img.youtube.com/vi/" + video.videoId + "/hqdefault.jpg)";
    thumb.setAttribute("aria-label", "Смотреть: " + video.title);
    thumb.appendChild(el("span", "play", "▶"));

    thumb.addEventListener("click", function () {
      const frame = document.createElement("iframe");
      frame.src =
        "https://www.youtube.com/embed/" + video.videoId + "?autoplay=1";
      frame.allow = "autoplay; encrypted-media; picture-in-picture";
      frame.allowFullscreen = true;
      card.replaceChild(frame, thumb);
    });
  } else {
    thumb = el("div", "thumb empty", "Вставь videoId в script.js");
  }

  const body = el("div", "card-body");
  body.appendChild(el("h3", "", video.title));
  body.appendChild(el("p", "", video.author));

  const tags = el("div", "tags");
  tags.appendChild(el("span", "tag " + video.level, LEVEL_NAMES[video.level]));
  tags.appendChild(el("span", "tag", video.puzzle));
  body.appendChild(tags);

  card.appendChild(thumb);
  card.appendChild(body);
  return card;
}

function renderVideos() {
  const query = searchInput.value.trim().toLowerCase();
  videoGrid.innerHTML = "";

  const list = videos.filter(function (v) {
    const levelOk = currentLevel === "all" || v.level === currentLevel;
    const text = (v.title + " " + v.author + " " + v.puzzle).toLowerCase();
    return levelOk && text.indexOf(query) !== -1;
  });

  if (list.length === 0) {
    videoGrid.appendChild(el("p", "empty-state", "Ничего не найдено 😕"));
    return;
  }

  list.forEach(function (v) {
    videoGrid.appendChild(buildVideoCard(v));
  });
}

searchInput.addEventListener("input", renderVideos);

levelChips.forEach(function (chip) {
  chip.addEventListener("click", function () {
    levelChips.forEach(function (c) { c.classList.remove("active"); });
    chip.classList.add("active");
    currentLevel = chip.dataset.level;
    renderVideos();
  });
});

renderVideos();

/* =========================================================
   7. ЧЕМПИОНЫ
   ========================================================= */

function getInitials(name) {
  return name
    .split(" ")
    .map(function (word) { return word[0]; })
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderChampions() {
  const grid = document.getElementById("champion-grid");

  champions.forEach(function (champ) {
    const card = el("article", "card");

    const img = document.createElement("img");
    img.className = "photo";
    img.src = champ.photo;
    img.alt = champ.name;
    img.loading = "lazy";
    img.addEventListener("error", function () {
      // Если фото нет — показываем инициалы
      const stub = el("div", "initials", getInitials(champ.name));
      card.replaceChild(stub, img);
    });

    const body = el("div", "card-body");
    body.appendChild(el("h3", "", champ.name));
    body.appendChild(el("p", "", champ.country));
    body.appendChild(el("p", "", champ.info));

    const tags = el("div", "tags");
    champ.tags.forEach(function (t) {
      tags.appendChild(el("span", "tag", t));
    });
    body.appendChild(tags);

    const link = el("a", "champ-link", "Профиль WCA →");
    link.href =
      "https://www.worldcubeassociation.org/persons?search=" +
      encodeURIComponent(champ.name);
    link.target = "_blank";
    link.rel = "noopener";
    body.appendChild(link);

    card.appendChild(img);
    card.appendChild(body);
    grid.appendChild(card);
  });
}

renderChampions();

/* =========================================================
   8. ВИДЫ ГОЛОВОЛОМОК
   ========================================================= */

function buildShape(p) {
  const box = el("div", "shape");

  if (p.size) {
    box.classList.add("shape-grid");
    box.style.setProperty("--n", p.size);
    const colors = ["#ffffff", "#ffd500", "#009b48", "#0046ad", "#b71234", "#ff5800"];
    for (let i = 0; i < p.size * p.size; i++) {
      const cell = el("span");
      cell.style.background = colors[(i + Math.floor(i / p.size)) % colors.length];
      box.appendChild(cell);
    }
  } else {
    box.classList.add("shape-" + p.shape);
  }
  return box;
}

function renderPuzzles() {
  const grid = document.getElementById("puzzle-grid");

  puzzles.forEach(function (p) {
    const card = el("article", "card puzzle-card");
    card.appendChild(buildShape(p));
    card.appendChild(el("h3", "", p.name));
    card.appendChild(el("div", "small", p.sub));
    card.appendChild(
      el("div", "stars", "★".repeat(p.stars) + "☆".repeat(5 - p.stars))
    );
    card.appendChild(el("p", "small", p.text));

    if (p.size) {
      card.classList.add("clickable");
      card.title = "Открыть в 3D";
      card.addEventListener("click", function () {
        selectSize(p.size);
        document.getElementById("viewer").scrollIntoView({ behavior: "smooth" });
      });
    }
    grid.appendChild(card);
  });
}

renderPuzzles();

/* =========================================================
   9. ТАЙМЕР
   ========================================================= */

const pad = document.getElementById("timer-pad");
const scrambleText = document.getElementById("scramble-text");
const timesList = document.getElementById("times-list");

let times = [];
let running = false;
let startTime = 0;

try {
  times = JSON.parse(localStorage.getItem("cubeTimes") || "[]");
} catch (e) {
  times = [];
}

function saveTimes() {
  try {
    localStorage.setItem("cubeTimes", JSON.stringify(times));
  } catch (e) {
    /* хранилище может быть недоступно — ничего страшного */
  }
}

function generateScramble(length) {
  const faces = ["U", "D", "R", "L", "F", "B"];
  const axis = { U: 0, D: 0, R: 1, L: 1, F: 2, B: 2 };
  const mods = ["", "'", "2"];
  const out = [];
  let lastAxis = -1;

  while (out.length < length) {
    const f = faces[randInt(6)];
    if (axis[f] === lastAxis) continue;
    out.push(f + mods[randInt(3)]);
    lastAxis = axis[f];
  }
  return out.join("  ");
}

function newScramble() {
  scrambleText.textContent = generateScramble(20);
}

function average(list) {
  if (list.length === 0) return null;
  const sum = list.reduce(function (a, b) { return a + b; }, 0);
  return sum / list.length;
}

function ao5(list) {
  if (list.length < 5) return null;
  const last = list.slice(-5).sort(function (a, b) { return a - b; });
  return average(last.slice(1, 4)); // убираем лучшее и худшее
}

function fmt(t) {
  return t === null ? "—" : t.toFixed(2);
}

function renderStats() {
  document.getElementById("stat-best").textContent =
    times.length ? fmt(Math.min.apply(null, times)) : "—";
  document.getElementById("stat-ao5").textContent = fmt(ao5(times));
  document.getElementById("stat-avg").textContent = fmt(average(times));
  document.getElementById("stat-count").textContent = times.length;

  timesList.innerHTML = "";
  const best = times.length ? Math.min.apply(null, times) : null;
  times.slice(-15).forEach(function (t) {
    const li = el("li", t === best ? "best" : "", fmt(t));
    timesList.appendChild(li);
  });
}

function tick() {
  if (!running) return;
  pad.textContent = ((performance.now() - startTime) / 1000).toFixed(2);
  requestAnimationFrame(tick);
}

function toggleTimer() {
  if (!running) {
    running = true;
    startTime = performance.now();
    pad.classList.add("running");
    tick();
  } else {
    running = false;
    const result = (performance.now() - startTime) / 1000;
    pad.classList.remove("running");
    pad.textContent = result.toFixed(2);
    times.push(result);
    saveTimes();
    renderStats();
    newScramble();
  }
}

pad.addEventListener("pointerdown", function (e) {
  e.preventDefault();
  toggleTimer();
});

document.addEventListener("keydown", function (e) {
  if (e.code !== "Space" || e.repeat) return;
  const tag = e.target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
  e.preventDefault();
  toggleTimer();
});

document.getElementById("btn-new-scramble").addEventListener("click", newScramble);

document.getElementById("btn-delete-last").addEventListener("click", function () {
  times.pop();
  saveTimes();
  renderStats();
});

document.getElementById("btn-clear-times").addEventListener("click", function () {
  if (confirm("Удалить все результаты?")) {
    times = [];
    saveTimes();
    renderStats();
    pad.textContent = "0.00";
  }
});

newScramble();
renderStats();

/* =========================================================
   10. ПЛАВНОЕ ПОЯВЛЕНИЕ СЕКЦИЙ
   ========================================================= */

const observer = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 }
);

document.querySelectorAll(".reveal").forEach(function (section) {
  observer.observe(section);
});
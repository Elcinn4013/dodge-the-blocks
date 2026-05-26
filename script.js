// HTML elementlərini seçirik
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreElement = document.getElementById("finalScore");
const restartButton = document.getElementById("restartButton");
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById("startButton");
const bestFinalScoreElement = document.getElementById("bestFinalScore");
// Yaddaşdan ən yüksək xalı oxuyuruq (əgər yoxdursa 0 təyin edirik)
let bestScore = localStorage.getItem("bestScore") || 0;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let score = 0;
let spawnTimer = 60;

const player = {
  width: 40,
  height: 40,
  x: 205, // Yeni tən orta nöqtə (əvvəl 180 idi)
  y: 540,
  speed: 5,
  color: "#00f0ff",
};

const enemies = [];
function spawnEnemy() {
  const size = 40; // Düşmənin ölçüsü
  // Düşmən səhnədən kənara çıxmasın deyə maksimum (canvas.width - size) arasında random yer seçirik
  const randomX = Math.random() * (canvas.width - size);

  // YENİLİK: Sürət xala görə yavaş-yavaş artır (Hər 100 xalda 0.5 artır)
  // Başlanğıc sürət 3-dür.
  const dynamicSpeed = 3 + score * 0.005;

  enemies.push({
    x: randomX,
    y: -size,
    width: size,
    height: size,
    speed: dynamicSpeed, // Sabit 3 əvəzinə dinamik sürəti veririk
    color: "#ff0055",
  });
}

// Düşmənləri ekrana çəkən funksiya
function drawEnemies() {
  enemies.forEach((enemy) => {
    ctx.shadowColor = enemy.color;
    ctx.shadowBlur = 15; // Qırmızı neon effekti

    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

    ctx.shadowBlur = 0; // Effekti sıfırlayırıq
  });
}

// Düşmənlərin yerini yeniləyən funksiya
function updateEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    // Düşməni aşağı doğru hərəkət etdiririk
    enemies[i].y += enemies[i].speed;

    // Yaddaşa (Memory) qənaət etmək üçün:
    // Əgər düşmən səhnənin aşağısından çıxdısa, onu massivdən silirik
    if (enemies[i].y > canvas.height) {
      enemies.splice(i, 1);
      i--; // Sildiyimiz üçün indeksi bir addım geri çəkirik ki, növbəti elementi ötürməyək
    }
  }
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// DÜZƏLİŞ 1: Əksik olan clearScreen funksiyasını əlavə etdik
function clearScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function collides(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function updateEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    // Düşməni aşağı doğru hərəkət etdiririk
    enemies[i].y += enemies[i].speed;

    // TOQQUŞMANI YOXLAYIRIQ
    if (collides(player, enemies[i])) {
      isGameOver = true;

      // Əgər cari xal rekorddan böyükdürsə, onu yeniləyirik
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore); // Yaddaşa yazırıq
      }

      // Ekranda yekun xalı göstərib, "Game Over" menyusunu açırıq
      finalScoreElement.innerText = score;
      bestFinalScoreElement.innerText = bestScore;
      gameOverScreen.classList.remove("hidden");
    }

    // Düşmən səhnədən çıxdısa, onu silirik
    if (enemies[i].y > canvas.height) {
      enemies.splice(i, 1);
      i--;
      score += 10;
    }
  }
}

// DÜZƏLİŞ 2: Təkrarlanan update funksiyasını sildik, yalnız 1 dənəsi qaldı
function update() {
  // Sol ox və ya 'a' / 'A'
  if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
    player.x -= player.speed;
  }
  // Sağ ox və ya 'd' / 'D'
  if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
    player.x += player.speed;
  }

  // Sərhədləri qorumaq
  if (player.x < 0) {
    player.x = 0;
  }
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }
}
function drawScore() {
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  // Best Score-u onun dərhal altına yazdırırıq
  ctx.fillText("Best: " + bestScore, 10, 60);
}

function gameLoop() {
  // 1. Məntiqi yenilə
  if (isGameOver) return;
  spawnTimer--;
  // Əgər kadr sayı 60-a tam bölünürsə (yəni hər ~1 saniyədən bir) düşmən yarat
  if (spawnTimer <= 0) {
    spawnEnemy(); // Taymer sıfıra çatanda düşmən yaradırıq

    // Yeni taymeri hesablayırıq: Xal artdıqca düşmənlər daha tez gəlir.
    // Amma Math.max sayəsində bu rəqəm HES VAXT 25-dən aşağı düşmür (keçilməz divar olmasın deyə).
    let nextInterval = 60 - Math.floor(score / 20);
    spawnTimer = Math.max(25, nextInterval);
  }
  // 1. Məntiqi yenilə
  update();
  updateEnemies();

  // 2. Ekranı təmizlə
  clearScreen();

  // 3. Elementləri yenidən çək
  drawPlayer();
  drawScore();
  drawEnemies();

  requestAnimationFrame(gameLoop);
}

// Oyunu başlat
let isGameOver = false;
restartButton.addEventListener("click", () => {
  score = 0;
  spawnTimer = 60; // YENİLİK: Taymeri başlanğıc halına qaytarırıq
  enemies.length = 0;
  player.x = 205;
  isGameOver = false;

  gameOverScreen.classList.add("hidden");
  requestAnimationFrame(gameLoop);
});
startButton.addEventListener("click", () => {
  requestAnimationFrame(gameLoop);
  startScreen.classList.add("hidden")
  
});

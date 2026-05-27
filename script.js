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
const powerUps = [];
let powerUpSpawnTimer = 300;
// Güclərin aktivlik vəziyyətləri və taymerləri
let isShieldActive = false;
let slowMotionTimer = 0; // 0-dan böyükdürsə aktivdir
let shrinkTimer = 0; // 0-dan böyükdürsə aktivdir

const particles = []; // Zərrəcikləri saxlayacaq massiv
let isExploding = false; // Partlayış vəziyyətindəyikmi?
let explosionTimer = 60;

const floatingTexts = [];

const player = {
    width: 30,
    height: 30,
    x: 205, // Yeni tən orta nöqtə (əvvəl 180 idi)
    y: 540,
    speed: 5,
    color: "#00f0ff",
};

const enemies = [];
function spawnEnemy() {
    const size = 36; // Düşmənin ölçüsü
    // Düşmən səhnədən kənara çıxmasın deyə maksimum (canvas.width - size) arasında random yer seçirik
    const randomX = Math.random() * (canvas.width - size);

    // YENİLİK: Sürət xala görə yavaş-yavaş artır (Hər 100 xalda 0.5 artır)
    // Başlanğıc sürət 3-dür.
    const dynamicSpeed = Math.min(6, 3 + (score * 0.002));

    enemies.push({
        x: randomX,
        y: -size,
        width: size,
        height: size,
        speed: dynamicSpeed, // Sabit 3 əvəzinə dinamik sürəti veririk
        color: "#ff0055",
    });
}

function createExplosion(x, y, color) {
    // Hər partlayış üçün 20 ədəd kiçik piksel yaradırıq
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            width: Math.random() * 5 + 2, // 2-7 piksel arası təsadüfi ölçü
            height: Math.random() * 5 + 2,
            speedX: (Math.random() - 0.5) * 10, // Sağa və ya sola təsadüfi sürət
            speedY: (Math.random() - 0.5) * 10, // Yuxarı və ya aşağı təsadüfi sürət
            color: color,
            alpha: 1 // Şəffaflıq (1 tam görünür, 0 isə tam şəffaf)
        });
    }
}
function createFloatingText(text, x, y, color) {
    floatingTexts.push({
        text: text,
        x: x,
        y: y,
        color: color,
        alpha: 1 // Tam görünür
    });
}

function updateAndDrawFloatingTexts() {
    for (let i = 0; i < floatingTexts.length; i++) {
        let ft = floatingTexts[i];

        ft.y -= 0.5; // Yazı yavaş-yavaş yuxarı qalxır
        ft.alpha -= 0.01; // Yavaş-yavaş şəffaflaşır

        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.font = "bold 20px 'Segoe UI', Arial";

        // Mətni tam mərkəzə salmaq üçün kiçik riyazi tənzimləmə
        ctx.fillText(ft.text, ft.x - 15, ft.y);
        ctx.globalAlpha = 1;

        if (ft.alpha <= 0) {
            floatingTexts.splice(i, 1);
            i--;
        }
    }
}

function updateParticles() {
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha -= 0.02; // Hər kadrda zərrəcik yavaş-yavaş şəffaflaşır (fade-out)

        // Əgər tam şəffaf oldusa, yaddaşdan silirik
        if (p.alpha <= 0) {
            particles.splice(i, 1);
            i--;
        }

    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.alpha); // Şəffaflığı tətbiq edirik
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.globalAlpha = 1; // Digər elementlər şəffaf olmasın deyə sıfırlayırıq
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


function spawnPowerUp() {
    const size = 24; // Güc blokları düşmənlərdən bir az daha kiçik olsun
    const randomX = Math.random() * (canvas.width - size);

    // Təsadüfi olaraq gücün növünü seçirik
    const types = ['slow', 'shield', 'shrink', 'bonus'];
    const type = types[Math.floor(Math.random() * types.length)];

    let color;
    if (type === 'slow') color = "#ffd700"; // Qızılı / Sarı
    else if (type === 'shield') color = "#00ff00"; // Yaşıl
    else if (type === 'shrink') color = "#b900ff"; // Bənövşəyi
    else if (type === 'bonus') color = "#ff8800";
    powerUps.push({
        x: randomX,
        y: -100,
        width: size,
        height: size,
        speed: 2, // Güclər bir az daha yavaş düşsün ki, tutmaq asan olsun
        type: type,
        color: color
    });
}
function drawPowerUps() {
    powerUps.forEach(power => {
        ctx.shadowColor = power.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = power.color;
        ctx.fillRect(power.x, power.y, power.width, power.height);
        ctx.shadowBlur = 0;
    });
}

function updatePowerUps() {
    for (let i = 0; i < powerUps.length; i++) {
        powerUps[i].y += powerUps[i].speed;

        // Oyunçu xüsusi gücü götürdükdə
        if (collides(player, powerUps[i])) {
            const type = powerUps[i].type;

            if (collides(player, powerUps[i])) {
                const type = powerUps[i].type;
                createExplosion(powerUps[i].x + powerUps[i].width / 2, powerUps[i].y + powerUps[i].height / 2, powerUps[i].color);
                if (type === 'slow') {
                    slowMotionTimer = 600;
                    // YENİLİK: Başının üstündə yazı çıxır
                    createFloatingText("SLOW MO!", player.x, player.y - 10, powerUps[i].color);
                } else if (type === 'shield') {
                    isShieldActive = true;
                    createFloatingText("SHIELD!", player.x, player.y - 10, powerUps[i].color);
                } else if (type === 'shrink') {
                    shrinkTimer = 600;
                    createFloatingText("SHRINK!", player.x, player.y - 10, powerUps[i].color);
                } else if (type === 'bonus') {
                    score += 50;
                    createFloatingText("+50 POINTS", player.x, player.y - 10, powerUps[i].color);
                }

                powerUps.splice(i, 1);
                i--;
                continue;
            }

            powerUps.splice(i, 1);
            i--;
            continue;
        }

        // Güc səhnədən çıxdısa, sil
        if (powerUps[i].y > canvas.height) {
            powerUps.splice(i, 1);
            i--;
        }
    }
}

function drawPlayer() {
    if (shrinkTimer > 0) {
        player.width = 20;
        player.height = 20;
    } else {
        player.width = 40;
        player.height = 40;
    }

    ctx.shadowColor = player.color;
    ctx.shadowBlur = 20;
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;

    // Qalxan (Shield) aktivdirsə, oyunçunun ətrafına yaşıl halqa çək
    if (isShieldActive) {
        ctx.beginPath();
        // Dairənin mərkəzini oyunçunun mərkəzinə hesablayırıq
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width, 0, Math.PI * 2);
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#00ff00";
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
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
        // Yavaşlatma (Slow Motion) aktivdirsə sürəti yarıya böl
        let currentEnemySpeed = slowMotionTimer > 0 ? enemies[i].speed / 2 : enemies[i].speed;
        enemies[i].y += currentEnemySpeed;

        if (collides(player, enemies[i])) {
            // ƏGƏR QALXAN AKTİVDİRSƏ:
            if (isShieldActive) {
                isShieldActive = false; // Qalxan qırılır
                enemies.splice(i, 1); // Dəyən düşmən məhv olur
                i--;
                continue; // Oyun bitmir, davam edirik!
            } else if (!isExploding) {
                isExploding = true;

                // Həm oyunçu (mavi), həm də dəyən düşmənin rəngində partlayış yaradırıq
                createExplosion(player.x + player.width / 2, player.y + player.height / 2, "#00f0ff");
                createExplosion(enemies[i].x + enemies[i].width / 2, enemies[i].y + enemies[i].height / 2, enemies[i].color);

                // Oyunçunu ekrandan gizlədirik
                player.y = -999;

                // Xalı hesablayıb yaddaşa vururuq
                if (score > bestScore) {
                    bestScore = score;
                    localStorage.setItem("bestScore", bestScore);
                }
                finalScoreElement.innerText = score;
                bestFinalScoreElement.innerText = bestScore;
            }

            // DİQQƏT: Buradakı köhnə `isGameOver = true;` və `gameOverScreen.classList.remove("hidden");` hissələrini SİLDİK!
            // Çünki oyun partlayış bitəndə gameLoop içərisindən dayanacaq.
        }

        if (enemies[i] && enemies[i].y > canvas.height) {
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
    if (isExploding) {
        clearScreen();
        updateParticles();
        drawParticles();

        explosionTimer--; // Taymeri azaldırıq

        // 1 saniyə bitəndə menyunu açırıq və oyunu tam dayandırırıq
        if (explosionTimer <= 0) {
            isGameOver = true;
            gameOverScreen.classList.remove("hidden");
        }
        requestAnimationFrame(gameLoop);
        return; // Normal oyun məntiqini (aşağıdakı kodları) oxuma!
    }

    if (slowMotionTimer > 0) slowMotionTimer--;
    if (shrinkTimer > 0) shrinkTimer--;
    spawnTimer--;
    // Əgər kadr sayı 60-a tam bölünürsə (yəni hər ~1 saniyədən bir) düşmən yarat
    if (spawnTimer <= 0) {
        spawnEnemy();

        // Normal yaranma aralığını hesablayırıq
        let nextInterval = 60 - Math.floor(score / 30);
        nextInterval = Math.max(32, nextInterval); // Minimum 25 kadr ola bilər

        // YENİLİK: Əgər Slow Motion aktivdirsə, yaranma aralığını da 2 qat uzadırıq
        // Bu, düşmənlərin yuxarıda yığılıb eyni anda düşməsinin qarşısını alır
        if (slowMotionTimer > 0) {
            nextInterval *= 2;
        }

        spawnTimer = nextInterval;
    }
    powerUpSpawnTimer--;
    if (powerUpSpawnTimer <= 0) {
        spawnPowerUp();
        powerUpSpawnTimer = Math.floor(Math.random() * 300) + 400; // Təxminən 6-11 saniyədən bir düşsün
    }
    // 1. Məntiqi yenilə
    update();
    updateEnemies();
    updatePowerUps();
    updateParticles();// 2. Ekranı təmizlə
    clearScreen();

    // 3. Elementləri yenidən çək
    drawPlayer();
    drawScore();
    drawPowerUps();
    drawParticles();
    drawEnemies();
    updateAndDrawFloatingTexts();

    requestAnimationFrame(gameLoop);
}

// Oyunu başlat
let isGameOver = false;
restartButton.addEventListener("click", () => {
    // 1. Əsas dəyərləri sıfırlayırıq
    score = 0;
    spawnTimer = 60;
    enemies.length = 0;

    // 2. Oyunçunun yerini və ölçüsünü sıfırlayırıq
    player.width = 30; // Başlanğıc ölçün 30 idi
    player.height = 30;
    player.x = 205;
    player.y = 540; // Oyunçunu mütləq səhnənin aşağısındakı yerinə qaytarırıq!

    // 3. Oyun vəziyyətlərini sıfırlayırıq
    isGameOver = false;

    // 4. Gücləri (Power-ups) sıfırlayırıq
    powerUps.length = 0;
    powerUpSpawnTimer = 300;
    isShieldActive = false;
    slowMotionTimer = 0;
    shrinkTimer = 0;
    floatingTexts.length = 0;

    // 5. PARTLAYIŞI SIFIRLAYIRIQ (Əskik olan hissə bura idi)
    isExploding = false;
    explosionTimer = 60;
    particles.length = 0;

    // 6. Menyunu bağlayıb oyunu başladırıq
    gameOverScreen.classList.add("hidden");
    requestAnimationFrame(gameLoop);
});
startButton.addEventListener("click", () => {
    requestAnimationFrame(gameLoop);
    startScreen.classList.add("hidden")
});

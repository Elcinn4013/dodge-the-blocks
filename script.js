const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = {
    width: 40,
    height: 40,
    x: 205, // Yeni tən orta nöqtə (əvvəl 180 idi)
    y: 540, 
    speed: 5,
    color: "#00f0ff" 
};

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

function gameLoop() {
    // DÜZƏLİŞ 3: update funksiyasını loop-un içinə əlavə etdik!
    update(); 
    
    // Ekranı təmizlə
    clearScreen();
    // Elementləri yenidən çək
    drawPlayer();

    // Növbəti kadr üçün loop-u yenidən çağır
    requestAnimationFrame(gameLoop);
}

// Oyunu başlat
requestAnimationFrame(gameLoop);
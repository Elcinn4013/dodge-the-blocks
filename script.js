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

const enemies = [];
function spawnEnemy() {
    const size = 40; // Düşmənin ölçüsü
    // Düşmən səhnədən kənara çıxmasın deyə maksimum (canvas.width - size) arasında random yer seçirik
    const randomX = Math.random() * (canvas.width - size); 
    
    // Yeni düşmən obyektini yaradıb massivə əlavə edirik
    enemies.push({
        x: randomX,
        y: -size, // Səhnənin yuxarısından (görünməz yerdən) başlasın deyə mənfi dəyər veririk
        width: size,
        height: size,
        speed: 3, // Düşmənin düşmə sürəti (oyunçudan bir az yavaş)
        color: "#ff0055" // Neon qırmızı/çəhrayı
    });
}

function spawnEnemy() {
    const size = 40; // Düşmənin ölçüsü
    // Düşmən səhnədən kənara çıxmasın deyə maksimum (canvas.width - size) arasında random yer seçirik
    const randomX = Math.random() * (canvas.width - size); 
    
    // Yeni düşmən obyektini yaradıb massivə əlavə edirik
    enemies.push({
        x: randomX,
        y: -size, // Səhnənin yuxarısından (görünməz yerdən) başlasın deyə mənfi dəyər veririk
        width: size,
        height: size,
        speed: 3, // Düşmənin düşmə sürəti (oyunçudan bir az yavaş)
        color: "#ff0055" // Neon qırmızı/çəhrayı
    });
}

// Düşmənləri ekrana çəkən funksiya
function drawEnemies() {
    enemies.forEach(enemy => {
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
setInterval(spawnEnemy, 1000);

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
        a.x < b.x + b.width  &&
        a.x + a.width > b.x  &&
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
    isGameOver = true; // Bu, gameLoop-u anında dayandıracaq
    
    // Çox qısa bir gecikmə (setTimeout) veririk ki, 
    // brauzer alert-i göstərməzdən əvvəl oyunun dayandığını qeydə ala bilsin.
    setTimeout(() => {
        alert("Toqquşma baş verdi! Oyun bitdi.");
        document.location.reload(); 
    }, 10);
}

        // Düşmən səhnədən çıxdısa, onu silirik
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
            i--; 
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



function gameLoop() {
    // 1. Məntiqi yenilə
  if (isGameOver) return; 

    // 1. Məntiqi yenilə
    update();
    updateEnemies();
    
    // 2. Ekranı təmizlə
    clearScreen();
    
    // 3. Elementləri yenidən çək
    drawPlayer();
    drawEnemies();

    requestAnimationFrame(gameLoop);
}

// Oyunu başlat
requestAnimationFrame(gameLoop);
let isGameOver = false;

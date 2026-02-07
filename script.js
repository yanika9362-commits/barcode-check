// ===============================
// อ้างอิง element
// ===============================
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const result = document.getElementById("result");

// ===============================
// เปิดกล้อง (iPad)
// ===============================
navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => {
    video.srcObject = stream;
});

// ===============================
// โหลด MASTER
// ===============================
const masterImg = new Image();
masterImg.src = "master.jpg";
let masterReady = false;

masterImg.onload = () => {
    masterReady = true;
};

// ===============================
// กำหนดตำแหน่งตรวจ (ทั้งแผ่น)
// ปรับตามหน้างานจริง
// ===============================
const rows = 10;
const cols = 2;

// ===============================
// ฟังก์ชันเทียบ MASTER
// ===============================
function compareWithMaster(x, y, w, h) {

    const live = ctx.getImageData(x, y, w, h).data;

    const temp = document.createElement("canvas");
    temp.width = w;
    temp.height = h;
    const tctx = temp.getContext("2d");

    tctx.drawImage(
        masterImg,
        x, y, w, h,
        0, 0, w, h
    );

    const master = tctx.getImageData(0, 0, w, h).data;

    let diff = 0;

    for (let i = 0; i < live.length; i += 4) {
        const g1 = (live[i] + live[i+1] + live[i+2]) / 3;
        const g2 = (master[i] + master[i+1] + master[i+2]) / 3;

        if (Math.abs(g1 - g2) > 40) diff++;
    }

    const ratio = diff / (live.length / 4);
    return ratio < 0.10; // tolerance
}

// ===============================
// LOOP ตรวจสอบ
// ===============================
function inspect() {

    if (!masterReady) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let passAll = true;

    const cellW = canvas.width * 0.42;
    const cellH = canvas.height * 0.065;
    const gapX = canvas.width * 0.05;
    const gapY = canvas.height * 0.025;

    let startX = canvas.width * 0.05;
    let startY = canvas.height * 0.05;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {

            const x = startX + c * (cellW + gapX);
            const y = startY + r * (cellH + gapY);

            const ok = compareWithMaster(x, y, cellW, cellH);

            ctx.lineWidth = 3;
            ctx.strokeStyle = ok ? "lime" : "red";
            ctx.strokeRect(x, y, cellW, cellH);

            if (!ok) passAll = false;
        }
    }

    if (passAll) {
        result.textContent = "PASS";
        result.className = "pass";
    } else {
        result.textContent = "FAIL";
        result.className = "fail";
    }
}

setInterval(inspect, 600);

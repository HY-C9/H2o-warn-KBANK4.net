// ฟังก์ชันเพื่อโหลดฟอนต์
function loadFonts() {
    const fonts = [
        //SFThonburi
        new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),
        new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
        new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
        new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)'),
    ];

    // โหลดฟอนต์ทั้งหมดและเพิ่มเข้าไปที่ document
    return Promise.all(fonts.map(font => font.load())).then(function(loadedFonts) {
        loadedFonts.forEach(function(font) {
            document.fonts.add(font);
        });
    });
}

// เรียกใช้ฟังก์ชันเพื่อโหลดฟอนต์หลังจากหน้าเว็บถูกโหลด
window.onload = function() {
    setCurrentDateTime();
    // โหลดฟอนต์และอัปเดตการแสดงผล
    loadFonts().then(function() {
        // ใช้ document.fonts.ready เพื่อให้มั่นใจว่าฟอนต์ถูกโหลดทั้งหมด
        document.fonts.ready.then(function() {
            updateDisplay(); // วาดใหม่ด้วยฟอนต์ที่ถูกต้องหลังจากฟอนต์ถูกโหลดเสร็จ
        });
    }).catch(function() {
        // หากฟอนต์โหลดไม่สำเร็จ จะยังคงแสดงผลได้
        updateDisplay();
    });
};


function setCurrentDateTime() {
    const now = new Date();
    const localDateTime = now.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok', hour12: false });
    const formattedDateTime = localDateTime.substring(0, 16); // Remove seconds
    document.getElementById('datetime').value = formattedDateTime;
    document.getElementById('datetime2').value = formattedDateTime;

    // Set notification time one minute later
    const oneMinuteLater = new Date(now.getTime() + 60000);
    const hours = oneMinuteLater.getHours().toString().padStart(2, '0');
    const minutes = oneMinuteLater.getMinutes().toString().padStart(2, '0');
    const formattedTimePlusOne = `${hours}:${minutes}`;
    document.getElementById('datetime_plus_one').value = formattedTimePlusOne;
}

function padZero(number) {
    return number < 10 ? '0' + number : number;
}

function formatDateWithDay(date) {
    const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    
    const dayName = days[new Date(date).getDay()];
    const day = new Date(date).getDate();
    const month = months[new Date(date).getMonth()];

    return `${dayName}ที่ ${day} ${month}`;
}


function formatDate(date) {
    const options = { day: 'numeric', month: 'short', year: '2-digit' };
    let formattedDate = new Date(date).toLocaleDateString('th-TH', options);
    formattedDate = formattedDate.replace(/ /g, ' ').replace(/\./g, '');
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const day = formattedDate.split(' ')[0];
    const month = months[new Date(date).getMonth()];
    const year = formattedDate.split(' ')[2];
    return `${day} ${month} ${year}`;
}




let qrCodeImage = null;
let powerSavingMode = false;


function handlePaste(event) {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    qrCodeImage = img;
                    updateDisplay();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(blob);
        }
    }
}

function updateDisplay() {
    const batteryLevel = document.getElementById('battery').value || '100';
    // Transaction 1 Inputs
    const datetime = document.getElementById('datetime').value || '-';
    const datetimePlusOne = document.getElementById('datetime_plus_one').value || '-';
    const money01 = document.getElementById('money01').value || '-';
    const remaining1 = document.getElementById('remaining1').value || '-';
    const senderaccount1 = document.getElementById('senderaccount1').value || '-';
    const transactionType1 = document.getElementById('transactionType').value;

    // Transaction 2 Inputs
    const datetime2 = document.getElementById('datetime2').value || '-';
    const money02 = document.getElementById('money02').value || '-';
    const remaining2 = document.getElementById('remaining2').value || '-';
    const transactionType2 = document.getElementById('transactionType2').value;

    // Time Formatting
    const formattedDate1 = formatDate(datetime.substring(0, 10));
    const formattedTime1 = datetime.substring(11, 16);

    const formattedDate2 = formatDate(datetime2.substring(0, 10));
    const formattedTime2 = datetime2.substring(11, 16);

    const formattedTimePlusOne = datetimePlusOne;

    // Transaction 1 Variables
    let logoImage1;
    let accountText1;
    let moneyColor1;
    let transactionTitle1;
    let displayMoney01 = money01; // เพิ่มตัวแปรสำหรับแสดงจำนวนเงิน

    if (transactionType1 === 'incoming') {
        logoImage1 = '../assets/image/paper/LOGO-green.png';
        accountText1 = 'เข้าบัญชี';
        moneyColor1 = '#199456';
        transactionTitle1 = 'รายการเงินเข้า';
    } else if (transactionType1 === 'outgoing') {
        logoImage1 = '../assets/image/paper/LOGO-red.png';
        accountText1 = 'จากบัญชี';
        moneyColor1 = '#df1515';
        transactionTitle1 = 'รายการโอน/ถอน';
        // เพิ่มเครื่องหมายลบหน้าจำนวนเงินถ้ายังไม่มี
        if (!money01.startsWith('-')) {
            displayMoney01 = '-' + money01;
        }
    }

    // Transaction 2 Variables
    let logoImage2;
    let accountText2;
    let moneyColor2;
    let transactionTitle2;
    let displayMoney02 = money02; // เพิ่มตัวแปรสำหรับแสดงจำนวนเงิน

    if (transactionType2 === 'incoming') {
        logoImage2 = '../assets/image/paper/LOGO-green.png';
        accountText2 = 'เข้าบัญชี';
        moneyColor2 = '#199456';
        transactionTitle2 = 'รายการเงินเข้า';
    } else if (transactionType2 === 'outgoing') {
        logoImage2 = '../assets/image/paper/LOGO-red.png';
        accountText2 = 'จากบัญชี';
        moneyColor2 = '#df1515';
        transactionTitle2 = 'รายการโอน/ถอน';
        // เพิ่มเครื่องหมายลบหน้าจำนวนเงินถ้ายังไม่มี
        if (!money02.startsWith('-')) {
            displayMoney02 = '-' + money02;
        }
    }

    
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Load background image
    const backgroundImage = new Image();
    backgroundImage.src = '../assets/image/bs/backgroundEnter-KB5.2.jpg';
    backgroundImage.onload = function() {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background image
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        // Draw notification time
        drawText(ctx, `${formattedTimePlusOne}`, 328, 24, 19.3, 'SFThonburiSemiBold', '#100f17', 'center', 1.5, 3, 0, 0, 800, -0.25);
        drawText(ctx, `${batteryLevel}%`, 603, 24,19.3,'SFThonburiSemiBold', '#100f17', 'right', 1.5, 3, 0, 0, 800,0.5);

        // Draw Transaction 1
        drawImage(ctx, logoImage1, 42, 198, 68, 68);
        drawText(ctx, transactionTitle1, 134, 233, 33, 'SFThonburiBold', '#3b3b3b', 'left', 1.5, 3, 0, 0, 1250, 0);
        drawText(ctx, `${formattedDate1} ${formattedTime1} น.`, 134, 263, 18, 'SFThonburiSemiBold', '#9d9ca1', 'left', 1.5, 3, 0, 0, 1250, 0);
        drawText(ctx, `${accountText1}`, 44.7, 340.2, 18, 'SFThonburiSemiBold', '#9d9ca1', 'left', 1.5, 3, 0, 0, 1250, -0.25);
        drawText(ctx, `จำนวนเงิน`, 44.7, 404.8, 23, 'SFThonburiSemiBold', '#3b3b3b', 'left', 1.5, 3, 0, 0, 1250, -0.25);
        drawText(ctx, `${senderaccount1}`, 456, 340.2, 23, 'SFThonburiSemiBold', '#3b3b3b', 'right', 1.5, 3, 0, 0, 1250, -1);
        drawText(ctx, `${displayMoney01} บาท`, 456, 406, 26, 'SFThonburiSemiBold', moneyColor1, 'right', 1.5, 3, 0, 0, 1250, -1);
        drawText(ctx, `ยอดเงินคงเหลือ`, 44.7, 485.8, 18, 'SFThonburiSemiBold', '#9d9ca1', 'left', 1.5, 3, 0, 0, 1250, -0.25);
        drawText(ctx, `${remaining1} บาท`, 456, 485.8, 18, 'SFThonburiSemiBold', '#9d9ca1', 'right', 1.5, 3, 0, 0, 1250, -0.25);
        drawText(ctx, `${formattedTime1}`, 479, 636, 16.5, 'SFThonburiSemiBold', '#506c90', 'right', 1.5, 3, 0, 0, 1250, -0.25);

        // Draw Transaction 2
        drawImage(ctx, logoImage2, 42, 739, 68, 68); // Adjusted Y position
        drawText(ctx, transactionTitle2, 134, 773.6, 33, 'SFThonburiBold', '#3b3b3b', 'left', 1.5, 3, 0, 0, 1250, 0);
        drawText(ctx, `${formattedDate2} ${formattedTime2} น.`, 134, 803.3, 18, 'SFThonburiSemiBold', '#9d9ca1', 'left', 1.5, 3, 0, 0, 1250, 0);
        drawText(ctx, `${accountText2}`, 44.7, 880.7, 18, 'SFThonburiSemiBold', '#9d9ca1', 'left', 1.5, 3, 0, 0, 1250, -0.25);
        drawText(ctx, `จำนวนเงิน`, 44.7, 944.5, 23, 'SFThonburiSemiBold', '#3b3b3b', 'left', 1.5, 3, 0, 0, 1250, -0.25);
        drawText(ctx, `${senderaccount1}`, 456, 880.7, 23, 'SFThonburiSemiBold', '#3b3b3b', 'right', 1.5, 3, 0, 0, 1250, -1);
        drawText(ctx, `${displayMoney02} บาท`, 456, 945.7, 26, 'SFThonburiSemiBold', moneyColor2, 'right', 1.5, 3, 0, 0, 1250, -1);
        drawText(ctx, `ยอดเงินคงเหลือ`, 44.7, 1026.6, 18, 'SFThonburiSemiBold', '#9d9ca1', 'left', 1.5, 3, 0, 0, 1250, -0.25);
        drawText(ctx, `${remaining2} บาท`, 456, 1026.6, 18, 'SFThonburiSemiBold', '#9d9ca1', 'right', 1.5, 3, 0, 0, 1250, -0.25);
        drawText(ctx, `${formattedTime2}`, 479, 1176.3, 16.5, 'SFThonburiSemiBold', '#506c90', 'right', 1.5, 3, 0, 0, 1250, -0.25);

        // Draw QR code if available
        if (qrCodeImage) {
            ctx.drawImage(qrCodeImage, 0, 130.3, 555, 951); // Adjust position and size as needed
        }

        // Draw battery
        drawBattery(ctx, batteryLevel, powerSavingMode);
    };
}

function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = shadowBlur;

    // แยกข้อความตาม <br>
    const paragraphs = text.split('<br>');
    let currentY = y;

    paragraphs.forEach(paragraph => {
        // ใช้ Intl.Segmenter โดยไม่กำหนด locale เพื่อรองรับหลายภาษา
        const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
        const words = [...segmenter.segment(paragraph)].map(segment => segment.segment);

        let lines = [];
        let currentLine = '';

        words.forEach((word) => {
            const testLine = currentLine + word;
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

            if (testWidth > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        if (currentLine) {
            lines.push(currentLine.trimStart()); // ตัดช่องว่างที่ขึ้นต้นบรรทัดใหม่ออก
        }

        lines.forEach((line, index) => {
            let currentX = x;

            if (align === 'center') {
                currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * letterSpacing) / 2;
            } else if (align === 'right') {
                currentX = x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
            }

            drawTextLine(ctx, line, currentX, currentY, letterSpacing);
            currentY += lineHeight;
            if (maxLines && index >= maxLines - 1) {
                return;
            }
        });

        // เพิ่มระยะห่างหลังจากขึ้นบรรทัดใหม่ด้วย <br>
        currentY + lineHeight;
    });
}




function drawTextLine(ctx, text, x, y, letterSpacing) {
    if (!letterSpacing) {
        ctx.fillText(text, x, y);
        return;
    }

    const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
    const characters = [...segmenter.segment(text)].map(segment => segment.segment);
    let currentPosition = x;

    characters.forEach((char, index) => {
        ctx.fillText(char, currentPosition, y);
        const charWidth = ctx.measureText(char).width;
        currentPosition += charWidth + letterSpacing;
    });
}


function drawBattery(ctx, batteryLevel, powerSavingMode) {
    // วาดกรอบแบตเตอรี่ด้วยมุมโค้งมน
    ctx.lineWidth = 2; // กำหนดความหนาของเส้นเป็น 2 พิกเซล
    ctx.strokeStyle = '#9b9b9b'; // กำหนดสีเส้นขอบเป็นสีเทา
    ctx.fillStyle = '#ffffff'; // กำหนดสีพื้นหลังของกรอบแบตเตอรี่เป็นสีขาว

    // กำหนดสีแบตเตอรี่ตามระดับและโหมดประหยัดพลังงาน
    let batteryColor = '#43bc40'; // สีเขียวสำหรับโหมดปกติ
    if (batteryLevel <= 20) {
        batteryColor = '#ff0000'; // สีแดงสำหรับแบตเตอรี่ต่ำ
    } else if (powerSavingMode) {
        batteryColor = '#fccd0e'; // สีส้มสำหรับโหมดประหยัดพลังงาน
    }

    // วาดการเติมแบตเตอรี่
    const fillWidth = (batteryLevel / 100) * 32; // คำนวณความกว้างของการเติมแบตเตอรี่ตามระดับแบตเตอรี่
    const x = 610.5;
    const y = 8.0;
    const height = 15.5;
    const radius = 5; // รัศมีของโค้ง

    ctx.fillStyle = batteryColor; // กำหนดสีการเติมแบตเตอรี่ตามที่คำนวณ

    // เริ่มวาดรูปร่างที่มีมุมโค้ง
    ctx.beginPath(); // เริ่มวาดรูปใหม่
    ctx.moveTo(x, y + radius); // เริ่มต้นที่มุมบนซ้าย
    ctx.lineTo(x, y + height - radius); // วาดเส้นตรงไปที่มุมล่างซ้าย
    ctx.arcTo(x, y + height, x + radius, y + height, radius); // วาดส่วนโค้งที่มุมล่างซ้าย
    ctx.lineTo(x + fillWidth - radius, y + height); // วาดเส้นตรงไปที่มุมล่างขวา
    ctx.arcTo(x + fillWidth, y + height, x + fillWidth, y + height - radius, radius); // วาดส่วนโค้งที่มุมล่างขวา
    ctx.lineTo(x + fillWidth, y + radius); // วาดเส้นตรงขึ้นไปที่มุมบนขวา
    ctx.arcTo(x + fillWidth, y, x + fillWidth - radius, y, radius); // วาดส่วนโค้งที่มุมบนขวา
    ctx.lineTo(x + radius, y); // วาดเส้นตรงไปที่มุมบนซ้าย
    ctx.arcTo(x, y, x, y + radius, radius); // วาดส่วนโค้งที่มุมบนซ้าย
    ctx.closePath(); // ปิดเส้นที่วาดเพื่อสร้างรูปร่างปิด
    ctx.fill(); // เติมสีการเติมแบตเตอรี่

}





function togglePowerSavingMode() {
    powerSavingMode = !powerSavingMode;
    const powerSavingButton = document.getElementById('powerSavingMode');
    powerSavingButton.classList.toggle('active', powerSavingMode);
    updateDisplay();
}
function updateBatteryDisplay() {
    const batteryLevel = document.getElementById('battery').value;
    document.getElementById('battery-level').innerText = batteryLevel;
}



function downloadImage() {
    const canvas = document.getElementById('canvas');
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'canvas_image.png';
    link.click();
}

document.getElementById('generate').addEventListener('click', updateDisplay);

function drawImage(ctx, imageUrl, x, y, width, height) {
    const image = new Image();
    image.src = imageUrl;
    image.onload = function() {
        ctx.drawImage(image, x, y, width, height);
    };
}

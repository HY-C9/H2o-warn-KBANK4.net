function loadFonts() {
    const fonts = [
        new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),
        new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
        new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
        new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)')
    ];

    return Promise.allSettled(fonts.map(font => font.load())).then(function(results) {
        results.forEach(function(result) {
            if (result.status === 'fulfilled') {
                document.fonts.add(result.value);
            }
        });
    });
}

window.onload = function() {
    setCurrentDateTime();
    loadFonts().then(function() {
        document.fonts.ready.then(function() {
            updateDisplay();
        });
    }).catch(function() {
        updateDisplay();
    });
};

function setCurrentDateTime() {
    const now = new Date();
    const localDateTime = now.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok', hour12: false });
    const formattedDateTime = localDateTime.substring(0, 16);
    
    const dt1 = document.getElementById('datetime');
    const dt2 = document.getElementById('datetime2');
    if(dt1) dt1.value = formattedDateTime;
    if(dt2) dt2.value = formattedDateTime;

    const oneMinuteLater = new Date(now.getTime() + 60000);
    const hours = oneMinuteLater.getHours().toString().padStart(2, '0');
    const minutes = oneMinuteLater.getMinutes().toString().padStart(2, '0');
    const formattedTimePlusOne = `${hours}:${minutes}`;
    
    const dtPlusOne = document.getElementById('datetime_plus_one');
    if(dtPlusOne) dtPlusOne.value = formattedTimePlusOne;
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
    const batteryLevel = document.getElementById('battery')?.value || '100';
    const datetime = document.getElementById('datetime')?.value || '-';
    const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
    const money01 = document.getElementById('money01')?.value || '-';
    const remaining1 = document.getElementById('remaining1')?.value || '-';
    const senderaccount1 = document.getElementById('senderaccount1')?.value || '-';
    const transactionType1 = document.getElementById('transactionType')?.value || 'incoming';

    const datetime2 = document.getElementById('datetime2')?.value || '-';
    const money02 = document.getElementById('money02')?.value || '-';
    const remaining2 = document.getElementById('remaining2')?.value || '-';
    const transactionType2 = document.getElementById('transactionType2')?.value || 'incoming';

    const formattedDate1 = formatDate(datetime.substring(0, 10));
    const formattedTime1 = datetime.substring(11, 16);

    const formattedDate2 = formatDate(datetime2.substring(0, 10));
    const formattedTime2 = datetime2.substring(11, 16);

    const formattedTimePlusOne = datetimePlusOne;

    let logoImage1;
    let accountText1;
    let moneyColor1;
    let transactionTitle1;
    let displayMoney01 = money01; 

    if (transactionType1 === 'incoming') {
        logoImage1 = 'assets/image/paper/LOGO-green.png';
        accountText1 = 'เข้าบัญชี';
        moneyColor1 = '#199456';
        transactionTitle1 = 'รายการเงินเข้า';
    } else if (transactionType1 === 'outgoing') {
        logoImage1 = 'assets/image/paper/LOGO-red.png';
        accountText1 = 'จากบัญชี';
        moneyColor1 = '#df1515';
        transactionTitle1 = 'รายการโอน/ถอน';
        if (!money01.startsWith('-')) displayMoney01 = '-' + money01;
    }

    let logoImage2;
    let accountText2;
    let moneyColor2;
    let transactionTitle2;
    let displayMoney02 = money02; 

    if (transactionType2 === 'incoming') {
        logoImage2 = 'assets/image/paper/LOGO-green.png';
        accountText2 = 'เข้าบัญชี';
        moneyColor2 = '#199456';
        transactionTitle2 = 'รายการเงินเข้า';
    } else if (transactionType2 === 'outgoing') {
        logoImage2 = 'assets/image/paper/LOGO-red.png';
        accountText2 = 'จากบัญชี';
        moneyColor2 = '#df1515';
        transactionTitle2 = 'รายการโอน/ถอน';
        if (!money02.startsWith('-')) displayMoney02 = '-' + money02;
    }

    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');

    const backgroundImage = new Image();
    backgroundImage.src = 'assets/image/bs/backgroundEnter-KB5.2.jpg';
    
    backgroundImage.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        drawText(ctx, `${formattedTimePlusOne}`, 328, 24, 19.3, 'SFThonburiSemiBold', '#100f17', 'center', 1.5, 3, 0, 0, 800, -0.25);
        drawText(ctx, `${batteryLevel}%`, 603, 24, 19.3, 'SFThonburiSemiBold', '#100f17', 'right', 1.5, 3, 0, 0, 800, 0.5);

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

        drawImage(ctx, logoImage2, 42, 739, 68, 68);
        drawText(ctx, transactionTitle2, 134, 773.6, 33, 'SFThonburiBold', '#3b3b3b', 'left', 1.5, 3, 0, 0, 1250, 0);
        drawText(ctx, `${formattedDate2} ${formattedTime2} น.`, 134, 803.3, 18, 'SFThonburiSemiBold', '#9d9ca1', 'left', 1.5, 3, 0, 0, 1250, 0);
        drawText(ctx, `${accountText2}`, 44.7, 880.7, 18, 'SFThonburiSemiBold', '#9d9ca1', 'left', 1.5, 3, 0, 0, 1250, -0.25);
        drawText(ctx, `จำนวนเงิน`, 44.7, 944.5, 23, 'SFThonburiSemiBold', '#3b3b3b', 'left', 1.5, 3, 0, 0, 1250, -0.25);
        drawText(ctx, `${senderaccount1}`, 456, 880.7, 23, 'SFThonburiSemiBold', '#3b3b3b', 'right', 1.5, 3, 0, 0, 1250, -1);
        drawText(ctx, `${displayMoney02} บาท`, 456, 945.7, 26, 'SFThonburiSemiBold', moneyColor2, 'right', 1.5, 3, 0, 0, 1250, -1);
        drawText(ctx, `ยอดเงินคงเหลือ`, 44.7, 1026.6, 18, 'SFThonburiSemiBold', '#9d9ca1', 'left', 1.5, 3, 0, 0, 1250, -0.25);
        drawText(ctx, `${remaining2} บาท`, 456, 1026.6, 18, 'SFThonburiSemiBold', '#9d9ca1', 'right', 1.5, 3, 0, 0, 1250, -0.25);
        drawText(ctx, `${formattedTime2}`, 479, 1176.3, 16.5, 'SFThonburiSemiBold', '#506c90', 'right', 1.5, 3, 0, 0, 1250, -0.25);

        if (qrCodeImage) {
            ctx.drawImage(qrCodeImage, 0, 130.3, 555, 951);
        }

        drawBattery(ctx, batteryLevel, powerSavingMode);
    };
}

function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.shadowColor = shadowColor || 'transparent';
    ctx.shadowBlur = shadowBlur || 0;

    const paragraphs = text.split('<br>');
    let currentY = y;

    paragraphs.forEach(paragraph => {
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
            lines.push(currentLine.trimStart());
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

        currentY += lineHeight;
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
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#9b9b9b';
    ctx.fillStyle = '#ffffff';

    let batteryColor = '#43bc40';
    if (batteryLevel <= 20) {
        batteryColor = '#ff0000';
    } else if (powerSavingMode) {
        batteryColor = '#fccd0e';
    }

    const fillWidth = (batteryLevel / 100) * 32;
    const x = 610.5;
    const y = 8.0;
    const height = 15.5;
    const radius = 5;

    ctx.fillStyle = batteryColor;

    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.lineTo(x + fillWidth - radius, y + height);
    ctx.arcTo(x + fillWidth, y + height, x + fillWidth, y + height - radius, radius);
    ctx.lineTo(x + fillWidth, y + radius);
    ctx.arcTo(x + fillWidth, y, x + fillWidth - radius, y, radius);
    ctx.lineTo(x + radius, y);
    ctx.arcTo(x, y, x, y + radius, radius);
    ctx.closePath();
    ctx.fill();
}

function togglePowerSavingMode() {
    powerSavingMode = !powerSavingMode;
    const powerSavingButton = document.getElementById('powerSavingMode');
    if (powerSavingButton) powerSavingButton.classList.toggle('active', powerSavingMode);
    updateDisplay();
}

function updateBatteryDisplay() {
    const batteryLevel = document.getElementById('battery')?.value || '100';
    const bl = document.getElementById('battery-level');
    if (bl) bl.innerText = batteryLevel;
}

window.downloadImage = function() {
    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'slip_kbank_live.png';
    link.click();
}

document.getElementById('generate')?.addEventListener('click', updateDisplay);

function drawImage(ctx, imageUrl, x, y, width, height) {
    const image = new Image();
    image.src = imageUrl;
    image.onload = function() {
        ctx.drawImage(image, x, y, width, height);
    };
}

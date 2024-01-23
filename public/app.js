function previewIcon() {
  const backgroundColor = document.getElementById('backgroundColor').value;
  const imageInput = document.getElementById('imageInput');
  const iconShape = document.getElementById('iconShape').value;
  const paddingPercentage = document.getElementById('paddingPercentage').value;
  const badgeText = document.getElementById('badgeText').value;

  const preview = document.getElementById('preview');
  preview.innerHTML = '';

  const file = imageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.src = e.target.result;

      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 512;

        canvas.width = size;
        canvas.height = size;

        // Draw background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, size, size);

        // Apply padding
        const padding = (paddingPercentage / 100) * size;
        ctx.drawImage(img, padding, padding, size - 2 * padding, size - 2 * padding);

        // Draw shape
        ctx.globalCompositeOperation = 'destination-over';
        drawShape(ctx, iconShape, size);

        // Draw badge text
        if (badgeText) {
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = 'white';
          ctx.font = 'bold 20px Arial';
          ctx.fillText(badgeText, size - 40, 40);
        }

        // Display preview
        const previewImg = new Image();
        previewImg.src = canvas.toDataURL('image/png');
        preview.appendChild(previewImg);
      };
    };
    reader.readAsDataURL(file);
  }
}

function drawShape(ctx, shape, size) {
  if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
  } else if (shape === 'square') {
    // No additional clipping needed for squares
  } else if (shape === 'squircle') {
    const cornerRadius = 20; // You can adjust this value
    ctx.beginPath();
    ctx.moveTo(cornerRadius, 0);
    ctx.lineTo(size - cornerRadius, 0);
    ctx.quadraticCurveTo(size, 0, size, cornerRadius);
    ctx.lineTo(size, size - cornerRadius);
    ctx.quadraticCurveTo(size, size, size - cornerRadius, size);
    ctx.lineTo(cornerRadius, size);
    ctx.quadraticCurveTo(0, size, 0, size - cornerRadius);
    ctx.lineTo(0, cornerRadius);
    ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
    ctx.closePath();
    ctx.clip();
  }
}



function downloadIcon() {
  const previewImg = document.getElementById('preview').querySelector('img');
  if (previewImg) {
    const link = document.createElement('a');
    link.href = previewImg.src;
    link.download = 'icon.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Redimensiona un File de imagen a maxSize x maxSize y lo devuelve como base64 JPEG.
// Firestore tiene límite de 1 MB por documento; 200px a calidad 0.7 ocupa ~10-20 KB.
export function resizeImageToBase64(file, maxSize = 200, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = reject;
    img.src = url;
  });
}

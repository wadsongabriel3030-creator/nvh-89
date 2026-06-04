/** Converte qualquer imagem para PNG (base64) para salvar no banco de dados. */
export async function fileToPngDataUrl(file: File, maxSize = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas não suportado'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Não foi possível ler a imagem'));
    };

    img.src = objectUrl;
  });
}

function avatarForDb(avatar: string): string | null {
  if (avatar.startsWith('data:image/png')) return avatar;
  if (avatar.startsWith('http') && !avatar.includes('images.unsplash.com')) return avatar;
  return null;
}

export { avatarForDb };

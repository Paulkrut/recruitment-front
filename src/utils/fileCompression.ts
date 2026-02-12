/**
 * Утилиты для сжатия файлов на клиенте перед загрузкой
 * Используется для уменьшения нагрузки на сервер
 * 
 * Поддерживает:
 * - Изображения: JPEG сжатие
 * - Видео: FFmpeg.wasm (опционально, с fallback)
 * - Аудио: FFmpeg.wasm (опционально, с fallback)
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// Singleton для ffmpeg
let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoaded = false;
let ffmpegLoading = false;

/**
 * Сжатие изображения
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Вычисляем новые размеры
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // Создаем canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Рисуем изображение
        ctx.drawImage(img, 0, 0, width, height);

        // Конвертируем в blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(
                `Image compressed: ${(file.size / 1024).toFixed(1)}KB -> ${(blob.size / 1024).toFixed(1)}KB`
              );
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Инициализация FFmpeg (загружается один раз)
 */
async function loadFFmpeg(): Promise<FFmpeg | null> {
  if (ffmpegLoaded && ffmpegInstance) {
    return ffmpegInstance;
  }

  if (ffmpegLoading) {
    // Ждем, пока другой вызов загрузит ffmpeg
    while (ffmpegLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return ffmpegInstance;
  }

  ffmpegLoading = true;

  try {
    const ffmpeg = new FFmpeg();
    
    // Загружаем core файлы (~31MB, но кэшируются навсегда)
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpegInstance = ffmpeg;
    ffmpegLoaded = true;
    console.log('✅ FFmpeg loaded successfully');
    
    return ffmpeg;
  } catch (error) {
    console.error('❌ Failed to load FFmpeg:', error);
    return null;
  } finally {
    ffmpegLoading = false;
  }
}

/**
 * Сжатие видео через FFmpeg.wasm (умный подход с fallback)
 */
export async function compressVideo(
  file: File,
  targetBitrate: number = 2000000, // 2 Mbps
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const sizeMB = file.size / 1024 / 1024;
  
  // Если файл маленький (<10MB), не сжимаем
  if (sizeMB < 10) {
    console.log(`✅ Video is small (${sizeMB.toFixed(2)}MB), skipping compression`);
    return file;
  }

  console.log(`🎬 Compressing video (${sizeMB.toFixed(2)}MB) with FFmpeg.wasm...`);

  try {
    const ffmpeg = await loadFFmpeg();
    
    if (!ffmpeg) {
      console.warn('⚠️ FFmpeg not available, using original file');
      return file;
    }

    // Слушаем прогресс
    if (onProgress) {
      ffmpeg.on('progress', ({ progress }) => {
        onProgress(Math.round(progress * 100));
      });
    }

    // Определяем расширение
    const ext = file.name.split('.').pop() || 'mp4';
    const inputName = `input.${ext}`;
    const outputName = 'output.mp4';

    // Пишем входной файл
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // Сжимаем (быстрая настройка для веб)
    await ffmpeg.exec([
      '-i', inputName,
      '-b:v', `${Math.round(targetBitrate / 1000)}k`,
      '-b:a', '128k',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-movflags', '+faststart',
      outputName
    ]);

    // Читаем результат
    const data = await ffmpeg.readFile(outputName);
    const blob = new Blob([data], { type: 'video/mp4' });

    console.log(`✅ Video compressed: ${sizeMB.toFixed(2)}MB → ${(blob.size / 1024 / 1024).toFixed(2)}MB`);

    // Очищаем файлы
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    return blob;
  } catch (error) {
    console.error('❌ Video compression failed:', error);
    console.log('⚠️ Using original file as fallback');
    return file;
  }
}

/**
 * Сжатие аудио через FFmpeg.wasm
 */
export async function compressAudio(
  file: File,
  targetBitrate: number = 64000, // 64 kbps
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const sizeMB = file.size / 1024 / 1024;
  
  // Если файл маленький (<5MB), не сжимаем
  if (sizeMB < 5) {
    console.log(`✅ Audio is small (${sizeMB.toFixed(2)}MB), skipping compression`);
    return file;
  }

  console.log(`🎵 Compressing audio (${sizeMB.toFixed(2)}MB) with FFmpeg.wasm...`);

  try {
    const ffmpeg = await loadFFmpeg();
    
    if (!ffmpeg) {
      console.warn('⚠️ FFmpeg not available, using original file');
      return file;
    }

    if (onProgress) {
      ffmpeg.on('progress', ({ progress }) => {
        onProgress(Math.round(progress * 100));
      });
    }

    const ext = file.name.split('.').pop() || 'mp3';
    const inputName = `input.${ext}`;
    const outputName = 'output.mp3';

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    await ffmpeg.exec([
      '-i', inputName,
      '-b:a', `${Math.round(targetBitrate / 1000)}k`,
      '-c:a', 'libmp3lame',
      outputName
    ]);

    const data = await ffmpeg.readFile(outputName);
    const blob = new Blob([data], { type: 'audio/mp3' });

    console.log(`✅ Audio compressed: ${sizeMB.toFixed(2)}MB → ${(blob.size / 1024 / 1024).toFixed(2)}MB`);

    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    return blob;
  } catch (error) {
    console.error('❌ Audio compression failed:', error);
    return file;
  }
}

/**
 * Определяет тип файла и применяет соответствующее сжатие
 */
export async function compressFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const type = file.type.split('/')[0];
  const extension = file.name.split('.').pop()?.toLowerCase();

  console.log(`Compressing file: ${file.name} (${type}, ${extension})`);

  try {
    switch (type) {
      case 'image':
        return await compressImage(file);
      
      case 'video':
        return await compressVideo(file, 2000000, onProgress);
      
      case 'audio':
        return await compressAudio(file, 64000, onProgress);
      
      default:
        // Для документов сжатие не применяем
        console.log('No compression needed for document');
        return file;
    }
  } catch (error) {
    console.warn('Compression failed, using original file:', error);
    return file;
  }
}

/**
 * Сжимает несколько файлов с отслеживанием прогресса
 */
export async function compressMultipleFiles(
  files: File[],
  onProgress?: (index: number, total: number, fileName: string, fileProgress?: number) => void
): Promise<Blob[]> {
  const compressed: Blob[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    onProgress?.(i, files.length, file.name, 0);
    
    // Передаем внутренний прогресс для видео/аудио
    const blob = await compressFile(file, (fileProgress) => {
      onProgress?.(i, files.length, file.name, fileProgress);
    });
    
    compressed.push(blob);
    onProgress?.(i + 1, files.length, file.name, 100);
  }

  onProgress?.(files.length, files.length, 'Готово', 100);
  
  return compressed;
}

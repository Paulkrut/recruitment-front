// Скрипт для замены старых функций разрешений на новые
const fs = require('fs');

const filePath = 'src/app/interview/[token]/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Замены для setPermissionsGranted
const replacements = [
  // Удаляем старые объявления состояний (уже сделано)
  
  // Замена 1: setPermissionsGranted в startDeviceTest
  {
    from: `      setPermissionsGranted({
        camera: hasVideoTrack,
        microphone: hasAudioTrack
      });`,
    to: `      setMediaPermissions({
        status: 'granted',
        camera: hasVideoTrack,
        microphone: hasAudioTrack
      });`
  },
  
  // Замена 2: setPermissionsRequested(true)
  {
    from: 'setPermissionsRequested(true);',
    to: '// Убрано - используем mediaPermissions.status'
  },
  
  // Замена 3: setPermissionsRequested(false)
  {
    from: 'setPermissionsRequested(false);',
    to: '// Убрано - используем mediaPermissions.status'
  },
  
  // Замена 4: setPermissionsGranted в Android проверке
  {
    from: `          setPermissionsGranted({
            camera: hasVideoTrack,
            microphone: hasAudioTrack
          });`,
    to: `          setMediaPermissions({
            status: 'granted',
            camera: hasVideoTrack,
            microphone: hasAudioTrack
          });`
  },
  
  // Замена 5: setPermissionsGranted({ camera: false, microphone: false })
  {
    from: 'setPermissionsGranted({ camera: false, microphone: false });',
    to: `setMediaPermissions({
        status: 'denied',
        camera: false,
        microphone: false
      });`
  }
];

console.log('Найденные замены:');
replacements.forEach((replacement, index) => {
  if (content.includes(replacement.from)) {
    console.log(`${index + 1}. Найдено: "${replacement.from.substring(0, 50)}..."`);
    content = content.replace(replacement.from, replacement.to);
  } else {
    console.log(`${index + 1}. НЕ найдено: "${replacement.from.substring(0, 50)}..."`);
  }
});

// Записываем исправленный файл
fs.writeFileSync(filePath + '.fixed', content);
console.log('Исправленный файл сохранен как ' + filePath + '.fixed');
console.log('Проверьте изменения и переименуйте файл при необходимости.'); 
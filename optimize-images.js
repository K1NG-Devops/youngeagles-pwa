import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import imageminPngquant from 'imagemin-pngquant';
import path from 'path';

(async () => {
  console.log('Optimizing images...');
  
  // Convert PNG to WebP
  await imagemin(['public/Young_Eagles_Logo.png'], {
    destination: 'public/',
    plugins: [
      imageminWebp({
        quality: 85, // Good quality with smaller size
        method: 6    // Best compression
      })
    ]
  });
  
  // Also create an optimized PNG version
  await imagemin(['public/Young_Eagles_Logo.png'], {
    destination: 'public/',
    plugins: [
      imageminPngquant({
        quality: [0.8, 0.9], // 80-90% quality
        strip: true
      })
    ]
  });
  
  console.log('Images optimized successfully!');
})();

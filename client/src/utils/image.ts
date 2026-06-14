export function captureVideoFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(video, 0, 0);

  const maxWidth = 1280;
  const maxHeight = 720;
  let width = canvas.width;
  let height = canvas.height;

  if (width > maxWidth) {
    height = (maxWidth / width) * height;
    width = maxWidth;
  }
  if (height > maxHeight) {
    width = (maxHeight / height) * width;
    height = maxHeight;
  }

  const resizeCanvas = document.createElement('canvas');
  resizeCanvas.width = width;
  resizeCanvas.height = height;

  const resizeCtx = resizeCanvas.getContext('2d');
  if (!resizeCtx) {
    throw new Error('Failed to get resize canvas context');
  }

  resizeCtx.drawImage(canvas, 0, 0, width, height);

  return resizeCanvas.toDataURL('image/jpeg', 0.6).split(',')[1];
}

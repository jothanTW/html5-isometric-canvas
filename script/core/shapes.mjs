const PI = Math.PI;
const PI2 = PI * 2;

function dot(x, y, size, ctx, color) {
  if (color) {
    ctx.fillStyle = color;
  }
  ctx.beginPath();
  ctx.arc(x, y, size, 0, PI2);
  ctx.fill();
}

export {
  dot
}
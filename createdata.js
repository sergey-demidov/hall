function rgbToHex (r, g, b) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

console.log('export const hallData = [');

for (let i = 0; i < 10000; i += 1) {
  const red = (Math.floor((i + 1000) / 1000) * 10) % 100 + 155;
  const green = (Math.floor((i + 3000) / 1000) * 10) % 100 + 155;
  const blue = (Math.floor((i + 7000) / 1000) * 10) % 100 + 155;

  const r = i % 100;
  const m = Math.floor(i / 100);
  console.log(`  { id: ${i}, pos_x: ${r + Math.floor(r / 10) * 2}, pos_y: ${m + Math.floor(m / 10) * 2}, color: "${rgbToHex(red, green, blue)}" },`);
}

console.log('];');

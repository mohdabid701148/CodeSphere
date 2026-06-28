import fs from 'fs/promises';

async function run() {
  const acRes = await fetch('https://img.atcoder.jp/assets/top/img/logo_bk.svg');
  const acSvg = await acRes.text();
  await fs.writeFile('atcoder.svg', acSvg);
}

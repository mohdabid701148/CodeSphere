async function run() {
  // Fetch AtCoder Logo
  const acRes = await fetch('https://img.atcoder.jp/assets/top/img/logo_bk.svg');
  const acSvg = await acRes.text();
  console.log('--- AtCoder SVG ---');
  console.log(acSvg);

  // Fetch CodeChef Logo (from Simple Icons CDN)
  const ccRes = await fetch('https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/codechef.svg');
  const ccSvg = await ccRes.text();
  console.log('--- CodeChef SVG ---');
  console.log(ccSvg);
}

run().catch(console.error);

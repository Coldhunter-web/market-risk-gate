export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const symbols = ['QQQ', 'SOXX', 'HYG', 'IEF', 'TLT', 'CL=F'];

  try {
    const results = await Promise.all(symbols.map(async (symbol) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`;
      const r = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const data = await r.json();
      const meta = data.chart.result[0].meta;
      const price = meta.regularMarketPrice;
      const prev  = meta.previousClose ?? meta.chartPreviousClose;
      const pct   = ((price - prev) / prev) * 100;
      return { symbol, price, pct };
    }));

    const out = {};
    results.forEach(({ symbol, price, pct }) => {
      const key = symbol === 'CL=F' ? 'wti' : symbol.toLowerCase();
      out[key] = { price: +price.toFixed(2), pct: +pct.toFixed(2) };
    });

    res.status(200).json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

(async () => {
  console.log('🧪 Shopify Full Cart API Performance Test');
  console.log('=========================================');
  
  const variantId = prompt('Enter a variant ID to test (ensure it is in stock):');
  if (!variantId) return console.error('❌ Test aborted: No variant ID.');

  const results = [];

  // Helper function to measure performance
  async function measure(label, url, options = {}) {
    console.log(`📡 Testing ${label}...`);
    const start = performance.now();
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      const duration = Math.round(performance.now() - start);
      results.push({ label, duration, status: 'success' });
      console.log(`✅ ${label}: ${duration}ms`);
      return data;
    } catch (err) {
      results.push({ label, duration: null, status: 'failed' });
      console.error(`❌ ${label} failed:`, err);
    }
  }

  // 1. ADD: Add item to cart
  await measure('ADD (/cart/add.js)', '/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: variantId, quantity: 1 })
  });

  // 2. GET: View cart state
  const currentCart = await measure('GET (/cart.js)', '/cart.js');

  // 3. UPDATE: Change attributes or notes (useful for apps/upsells)
  await measure('UPDATE (/cart/update.js)', '/cart/update.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note: "Performance test note " + Date.now() })
  });

  // 4. CHANGE: Adjust quantity of the specific line item
  if (currentCart && currentCart.items.length > 0) {
    await measure('CHANGE (/cart/change.js)', '/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: 2 })
    });
  }

  // 5. CLEAR: Empty the cart entirely
  await measure('CLEAR (/cart/clear.js)', '/cart/clear.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  // --- Final Summary ---
  console.log('\n📊 FINAL PERFORMANCE REPORT');
  console.log('=========================================');
  results.forEach(res => {
    const indicator = res.duration > 800 ? '🔴 SLOW' : '🟢 OK';
    console.log(`${res.label.padEnd(25)}: ${res.status === 'success' ? res.duration + 'ms ' + indicator : 'FAILED'}`);
  });
  console.log('=========================================');
})();

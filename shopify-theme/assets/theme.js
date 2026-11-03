/* Gift Yalla theme — no dependencies, no apps.
 * Modules: drawer, rails, tabs, wishlist, city pill, delivery picker (with slot cutoff),
 * product page (variants, add-ons, add to cart), cart page (re-validation, change delivery). */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };
  const cfgEl = $('#delivery-config');
  const CFG = cfgEl ? JSON.parse(cfgEl.textContent) : null;

  /* ---------- drawer ---------- */
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open]');
    if (opener) { const t = $(opener.dataset.open); if (t) { t.hidden = false; document.body.style.overflow = 'hidden'; } }
    const closer = e.target.closest('[data-close]');
    if (closer) { const d = closer.closest('.drawer'); if (d) { d.hidden = true; document.body.style.overflow = ''; } }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { $$('.drawer').forEach((d) => { d.hidden = true; }); document.body.style.overflow = ''; }
  });

  /* ---------- auto-submit filter/sort forms ---------- */
  $$('form[data-autosubmit]').forEach((f) => f.addEventListener('change', () => f.submit()));

  /* ---------- horizontal rails ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-rail-prev],[data-rail-next]');
    if (!btn) return;
    const track = $('.rail__track', btn.closest('[data-rail]'));
    if (!track) return;
    const rtl = getComputedStyle(track).direction === 'rtl' ? -1 : 1;
    const dir = btn.hasAttribute('data-rail-next') ? 1 : -1;
    track.scrollBy({ left: dir * rtl * track.clientWidth * 0.8, behavior: 'smooth' });
  });

  /* ---------- tabs ---------- */
  $$('[data-tabs]').forEach((wrap) => {
    wrap.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tab]');
      if (!b) return;
      $$('[data-tab]', wrap).forEach((x) => { x.classList.toggle('is-active', x === b); x.setAttribute('aria-selected', x === b); });
      $$('[data-panel]', wrap).forEach((p) => p.classList.toggle('is-hidden', p.dataset.panel !== b.dataset.tab));
    });
  });

  /* ---------- wishlist (browser storage, free, no login) ---------- */
  const WISH_KEY = 'gy_wish';
  const wishList = () => store.get(WISH_KEY, []);
  function paintWish() {
    const list = wishList();
    $$('[data-wish]').forEach((b) => b.setAttribute('aria-pressed', list.includes(b.dataset.wish)));
    $$('[data-wish-count]').forEach((c) => { c.textContent = list.length; c.hidden = list.length === 0; });
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-wish]');
    if (!b) return;
    e.preventDefault();
    const h = b.dataset.wish;
    const list = wishList();
    const i = list.indexOf(h);
    if (i > -1) list.splice(i, 1); else list.push(h);
    store.set(WISH_KEY, list);
    paintWish();
  });
  paintWish();

  const wishGrid = $('[data-wishlist-grid]');
  if (wishGrid && CFG) {
    const list = wishList();
    const empty = $('[data-wishlist-empty]');
    if (!list.length) { empty.hidden = false; }
    const fmt = (cents) => {
      const cur = (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || '';
      try { return new Intl.NumberFormat(CFG.locale, { style: 'currency', currency: cur }).format(cents / 100); } catch (e) { return (cents / 100).toFixed(2); }
    };
    list.forEach((handle) => {
      fetch(`${CFG.routes.root}products/${handle}.js`).then((r) => (r.ok ? r.json() : null)).then((p) => {
        if (!p) return;
        const li = document.createElement('li');
        li.innerHTML = '<article class="pcard"><div class="pcard__media"><a class="pcard__link"></a><button type="button" class="wish"></button></div><a class="pcard__title"></a><div class="pcard__meta"><span class="price"><span class="price__now"></span></span></div></article>';
        const a = li.querySelector('.pcard__link');
        a.href = p.url;
        if (p.featured_image) { const img = new Image(); img.src = p.featured_image; img.alt = p.title; img.loading = 'lazy'; a.appendChild(img); }
        else { a.innerHTML = '<div class="tile tile--0"><span class="tile__emoji">🎁</span></div>'; }
        const t = li.querySelector('.pcard__title'); t.href = p.url; t.textContent = p.title;
        li.querySelector('.price__now').textContent = fmt(p.price);
        const w = li.querySelector('.wish');
        w.dataset.wish = handle; w.setAttribute('aria-pressed', 'true'); w.textContent = '♥';
        wishGrid.appendChild(li);
      });
    });
  }

  /* ---------- city pill (remembers the customer's city) ---------- */
  const CITY_KEY = 'gy_city';
  const pills = $$('[data-city-pill]');
  pills.forEach((p) => {
    p.value = store.get(CITY_KEY, '') || '';
    p.addEventListener('change', () => {
      store.set(CITY_KEY, p.value);
      $$('[data-dpick] [data-f="city"]').forEach((c) => { c.value = p.value; });
    });
  });

  /* ================= DELIVERY ================= */
  if (!CFG) return;
  const DAY = 864e5, HOUR = 36e5;
  const slotId = (s) => `${s.start}-${s.end}`;
  const slotById = (id) => CFG.slots.find((s) => slotId(s) === id);
  const todayUTC = () => { const t = new Date(Date.now() + CFG.tz * HOUR); return Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()); };
  const slotStart = (iso, s) => {
    const [y, m, d] = iso.split('-').map(Number); const [h, mi] = s.start.split(':').map(Number);
    return Date.UTC(y, m - 1, d, h, mi) - CFG.tz * HOUR;      // real instant of the slot start in store time
  };
  /* a slot stays open until `cutoff` hours before it starts */
  const slotOpen = (iso, s) => slotStart(iso, s) - Date.now() >= CFG.cutoff * HOUR;
  const fmtTime = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return new Intl.DateTimeFormat(CFG.locale, { hour: 'numeric', minute: m ? '2-digit' : undefined, timeZone: 'UTC' }).format(new Date(Date.UTC(2000, 0, 1, h, m)));
  };
  const slotLabel = (s) => `${fmtTime(s.start)} – ${fmtTime(s.end)}`;
  const dateList = () => {
    const base = todayUTC(); const out = [];
    for (let i = 0; i < CFG.days; i++) {
      const dt = new Date(base + i * DAY); const iso = dt.toISOString().slice(0, 10);
      if (CFG.blackout.includes(iso)) continue;
      out.push({ iso, dt, i, open: CFG.slots.some((s) => slotOpen(iso, s)) });
    }
    return out;
  };
  const fmtDate = (dt, opts) => new Intl.DateTimeFormat(CFG.locale, Object.assign({ timeZone: 'UTC' }, opts)).format(dt);

  class Picker {
    constructor(root) {
      this.root = root;
      this.f = (n) => root.querySelector(`[data-f="${n}"]`);
      this.datesEl = $('[data-d-dates]', root);
      this.slotsEl = $('[data-d-slots]', root);
      this.errEl = $('[data-d-error]', root);
      this.date = ''; this.slot = '';
      const city = this.f('city');
      city.value = store.get(CITY_KEY, '') || '';
      city.addEventListener('change', () => { store.set(CITY_KEY, city.value); pills.forEach((p) => { p.value = city.value; }); });
      this.render(true);
      setInterval(() => this.render(false), 30000);
    }
    error(msg) { this.errEl.textContent = msg || ''; this.errEl.hidden = !msg; }
    render(autoPick) {
      const dates = dateList();
      if (autoPick && !this.date) { const first = dates.find((d) => d.open); if (first) this.date = first.iso; }
      if (this.date && !dates.some((d) => d.iso === this.date && d.open)) { this.date = ''; this.slot = ''; }
      this.datesEl.innerHTML = '';
      dates.forEach((d) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'chipbtn' + (d.iso === this.date ? ' is-selected' : '');
        b.disabled = !d.open;
        const top = d.i === 0 ? CFG.i18n.today : d.i === 1 ? CFG.i18n.tomorrow : fmtDate(d.dt, { weekday: 'short' });
        b.innerHTML = '<span></span><small></small>';
        b.firstChild.textContent = top; b.lastChild.textContent = fmtDate(d.dt, { day: 'numeric', month: 'short' });
        b.addEventListener('click', () => { this.date = d.iso; this.slot = ''; this.error(''); this.render(false); this.sync(); });
        this.datesEl.appendChild(b);
      });
      this.renderSlots();
      this.sync();
    }
    renderSlots() {
      this.slotsEl.innerHTML = '';
      if (!this.date) { const p = document.createElement('p'); p.className = 'muted'; p.textContent = CFG.i18n.noSlots; this.slotsEl.appendChild(p); return; }
      let stillOpen = false;
      CFG.slots.forEach((s) => {
        const open = slotOpen(this.date, s);
        const id = slotId(s);
        if (id === this.slot) stillOpen = open;
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'chipbtn' + (id === this.slot && open ? ' is-selected' : '');
        b.disabled = !open;
        b.innerHTML = '<span></span>' + (open ? '' : '<small></small>');
        b.firstChild.textContent = slotLabel(s);
        if (!open) b.lastChild.textContent = CFG.i18n.closed;
        b.addEventListener('click', () => { this.slot = id; this.error(''); this.renderSlots(); this.sync(); });
        this.slotsEl.appendChild(b);
      });
      if (this.slot && !stillOpen) { this.slot = ''; this.error(CFG.i18n.expired); this.renderSlots(); }
    }
    sync() {
      const s = slotById(this.slot);
      this.f('date').value = this.date;
      this.f('dateLabel').value = this.date ? fmtDate(new Date(this.date + 'T00:00:00Z'), { weekday: 'short', day: 'numeric', month: 'short' }) : '';
      this.f('slot').value = s ? slotId(s) : '';
      this.f('slotLabel').value = s ? slotLabel(s) : '';
    }
    validate() {
      if (!this.f('city').value) return CFG.i18n.chooseCity;
      if (!this.date) return CFG.i18n.chooseDate;
      const s = slotById(this.slot);
      if (!s) return CFG.i18n.chooseSlot;
      if (!slotOpen(this.date, s)) return CFG.i18n.expired;
      return '';
    }
    values() {
      this.sync();
      return {
        'City': this.f('city').value, '_Date': this.f('date').value, 'Delivery date': this.f('dateLabel').value,
        '_Slot': this.f('slot').value, 'Delivery slot': this.f('slotLabel').value
      };
    }
    prefill(city, date, slot) {
      if (city) this.f('city').value = city;
      const ok = dateList().some((d) => d.iso === date && d.open);
      this.date = ok ? date : ''; this.slot = ok ? slot : '';
      this.error(''); this.render(!ok);
    }
  }

  /* ---------- product page ---------- */
  const pdp = $('[data-product]');
  if (pdp) {
    const form = $('form[action*="/cart/add"]', pdp);
    const picker = new Picker($('[data-dpick]', form));
    const variants = JSON.parse($('[data-variants]', pdp).textContent);
    const idEl = $('[data-variant-id]', form);
    const addBtn = $('[data-add]', form);
    const addLabel = $('[data-add-label]', form);
    const errEl = $('[data-form-error]', form);
    const labels = { add: addLabel.dataset.addText, out: addLabel.dataset.soldoutText };
    const qty = $('[data-qty]', form);
    $('[data-qty-minus]', form).addEventListener('click', () => { qty.value = Math.max(1, (+qty.value || 1) - 1); });
    $('[data-qty-plus]', form).addEventListener('click', () => { qty.value = (+qty.value || 1) + 1; });

    // variant switching (no page reload)
    const radios = $$('[data-option]', form);
    if (radios.length) {
      const onVariant = () => {
        const chosen = []; radios.forEach((r) => { if (r.checked) chosen[+r.dataset.option] = r.value; });
        const v = variants.find((x) => x.options.every((o, i) => o === chosen[i]));
        if (!v) return;
        idEl.value = v.id;
        $('[data-pdp-price]', pdp).textContent = v.price;
        const cmp = $('[data-pdp-compare]', pdp); cmp.hidden = !v.compare; if (v.compare) cmp.textContent = v.compare;
        addBtn.disabled = !v.available; addLabel.textContent = v.available ? labels.add : labels.out;
        const url = new URL(location.href); url.searchParams.set('variant', v.id); history.replaceState({}, '', url);
        if (v.media) { const t = $(`[data-media-id="${v.media}"]`, pdp); if (t) t.parentNode.scrollTo({ left: t.offsetLeft - t.parentNode.offsetLeft, behavior: 'smooth' }); }
      };
      radios.forEach((r) => r.addEventListener('change', onVariant));
    }
    $$('[data-goto]', pdp).forEach((b) => b.addEventListener('click', () => {
      const t = $(`.gallery__item[data-media-id="${b.dataset.goto}"]`, pdp);
      if (t) t.parentNode.scrollTo({ left: t.offsetLeft - t.parentNode.offsetLeft, behavior: 'smooth' });
    }));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errEl.hidden = true;
      const problem = picker.validate();
      if (problem) { picker.error(problem); picker.root.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      const props = {};
      $$('[name^="properties["]', form).forEach((el) => {
        const m = el.name.match(/^properties\[(.+)\]$/);
        if (m && el.value.trim() !== '') props[m[1]] = el.value.trim();
      });
      const delivery = picker.values();
      const items = [{ id: +idEl.value, quantity: Math.max(1, +qty.value || 1), properties: props }];
      $$('[data-addon]:checked', form).forEach((a) => items.push({ id: +a.dataset.addon, quantity: 1, properties: Object.assign({}, delivery) }));
      addBtn.disabled = true;
      try {
        const res = await fetch(CFG.routes.cartAdd + '.js', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ items }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.description || data.message || 'Error');
        location.href = CFG.routes.cart;
      } catch (err) {
        errEl.textContent = err.message; errEl.hidden = false; addBtn.disabled = false;
      }
    });
  }

  /* ---------- cart page ---------- */
  const cart = $('[data-cart]');
  if (cart) {
    const lines = $$('[data-line]', cart);
    const cartErr = $('[data-cart-error]', cart);
    const lineOk = (el) => {
      const iso = el.dataset.date, id = el.dataset.slot;
      if (!iso || !id) return true;
      const s = slotById(id);
      return !!s && slotOpen(iso, s);
    };
    const checkAll = () => {
      let bad = false;
      lines.forEach((el) => {
        const ok = lineOk(el);
        el.classList.toggle('is-expired', !ok);
        const w = $('[data-line-warn]', el); if (w) w.hidden = ok;
        if (!ok) bad = true;
      });
      cartErr.hidden = !bad;
      return !bad;
    };
    checkAll(); setInterval(checkAll, 30000);
    $('[data-checkout]', cart).addEventListener('click', (e) => { if (!checkAll()) e.preventDefault(); });

    const change = (body) => fetch(CFG.routes.cartChange + '.js', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(body) }).then(() => location.reload());
    lines.forEach((el) => {
      const q = $('[data-line-qty]', el);
      if (q) q.addEventListener('change', () => change({ line: +el.dataset.line, quantity: Math.max(0, +q.value || 0) }));
    });

    const dlg = $('[data-delivery-dialog]');
    if (dlg) {
      const picker = new Picker($('[data-dpick]', dlg));
      let target = null;
      cart.addEventListener('click', (e) => {
        const b = e.target.closest('[data-change-delivery]'); if (!b) return;
        target = b.closest('[data-line]');
        let props = {}; try { props = JSON.parse(target.dataset.props); } catch (err) { props = {}; }
        picker.prefill(props['City'], props['_Date'], props['_Slot']);
        dlg.showModal();
      });
      $('[data-dialog-close]', dlg).addEventListener('click', () => dlg.close());
      $('[data-dialog-save]', dlg).addEventListener('click', () => {
        const problem = picker.validate();
        if (problem) { picker.error(problem); return; }
        let props = {}; try { props = JSON.parse(target.dataset.props); } catch (err) { props = {}; }
        change({ line: +target.dataset.line, quantity: +target.dataset.qty, properties: Object.assign({}, props, picker.values()) });
      });
    }
  }
})();

// ===== i18n Language Engine =====
const I18N = {
  _safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  _safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* private mode: ignore */ }
  },
  // file:// 下重写站内 .html 链接，携带 ?lang= 并保留 #锚点；http 下靠 localStorage，不碰 URL。
  _carryLang(lang) {
    if (location.protocol !== 'file:') return;
    document.querySelectorAll('a[href]').forEach(a => {
      const raw = a.getAttribute('href');
      if (!raw || !raw.includes('.html')) return;
      if (/^(https?:|mailto:|tel:|#)/i.test(raw)) return;
      const hashIdx = raw.indexOf('#');
      const hash = hashIdx >= 0 ? raw.slice(hashIdx) : '';
      const noHash = hashIdx >= 0 ? raw.slice(0, hashIdx) : raw;
      const qIdx = noHash.indexOf('?');
      const base = qIdx >= 0 ? noHash.slice(0, qIdx) : noHash;
      a.setAttribute('href', base + '?lang=' + lang + hash);
    });
  },
  init() {
    // file:// 本地预览时 localStorage 按文件隔离无法跨页共享，
    // 改用 URL ?lang= 参数传递语言；http 部署后用 localStorage。
    const isFile = location.protocol === 'file:';
    const urlLang = new URLSearchParams(location.search).get('lang');
    let saved;
    if (urlLang === 'en' || urlLang === 'cn') {
      saved = urlLang;
    } else if (isFile) {
      saved = 'en';
    } else {
      saved = this._safeGet('lang') || 'en';
    }
    this.set(saved, false);
    // Bind toggle buttons (support legacy span + new button, use data-value)
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.querySelectorAll('[data-value]').forEach(opt => {
        opt.addEventListener('click', () => {
          this.set(opt.dataset.value, true);
        });
      });
    });
    // file:// 下初始化时直接写好 href（右键新标签/中键也能带语言）；同时保留 click 兜底。
    if (isFile) {
      this._carryLang(saved);
      document.querySelectorAll('a[href]').forEach(a => {
        const raw = a.getAttribute('href');
        if (!raw || !raw.includes('.html')) return;
        if (/^(https?:|mailto:|tel:|#)/i.test(raw)) return;
        a.addEventListener('click', () => {
          const cur = document.body.classList.contains('lang-cn') ? 'cn' : 'en';
          const href = a.getAttribute('href');
          const hashIdx = href.indexOf('#');
          const hash = hashIdx >= 0 ? href.slice(hashIdx) : '';
          const noHash = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
          const qIdx = noHash.indexOf('?');
          const base = qIdx >= 0 ? noHash.slice(0, qIdx) : noHash;
          a.setAttribute('href', base + '?lang=' + cur + hash);
        });
      });
    }
  },

  set(lang, animate) {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (animate && !reduced) {
      document.body.style.transition = 'opacity 0.2s ease';
      document.body.style.opacity = '0';
      setTimeout(() => {
        this._apply(lang);
        document.body.style.opacity = '1';
        setTimeout(() => { document.body.style.transition = ''; }, 200);
      }, 200);
    } else {
      this._apply(lang);
    }
  },

  _apply(lang) {
    document.body.classList.toggle('lang-cn', lang === 'cn');
    document.documentElement.lang = lang === 'cn' ? 'zh-CN' : 'en';
    this._safeSet('lang', lang);
    this._carryLang(lang);
    // Update toggle buttons (support legacy span + new button)
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.querySelectorAll('[data-value]').forEach(opt => {
        const on = opt.dataset.value === lang;
        opt.classList.toggle('active', on);
        if (opt.tagName === 'BUTTON') opt.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    });
  }
};

// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {
  I18N.init();

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    if (!toggle.hasAttribute('aria-expanded')) toggle.setAttribute('aria-expanded', 'false');
    if (!toggle.hasAttribute('aria-label')) toggle.setAttribute('aria-label', 'Menu');
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Scroll fade-in
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbImg = lightbox.querySelector('img');
    const lbClose = lightbox.querySelector('.lightbox-close');
    let lastFocus = null;

    const openLb = (item) => {
      const img = item.querySelector('img');
      if (!img) return;
      lastFocus = document.activeElement;
      // picture/srcset 下取实际显示的源（一般是 webp），不支持时回退 png。
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (lbClose) lbClose.focus();
    };

    document.querySelectorAll('.gallery-item').forEach(item => {
      // 无需改 HTML：JS 补齐键盘可达性
      if (!item.hasAttribute('tabindex')) item.setAttribute('tabindex', '0');
      if (!item.hasAttribute('role')) item.setAttribute('role', 'button');
      if (!item.hasAttribute('aria-label')) {
        const img = item.querySelector('img');
        item.setAttribute('aria-label', img && img.alt ? 'Enlarge: ' + img.alt : 'Enlarge chart');
      }
      item.addEventListener('click', () => openLb(item));
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLb(item);
        }
      });
    });

    const close = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    };

    lbClose.addEventListener('click', close);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  // Contact gate: Gaussian integral modal
  const openBtn = document.getElementById('contact-open');
  if (openBtn) {
    const overlay = document.createElement('div');
    overlay.className = 'cg-overlay';
    overlay.innerHTML = `
      <div class="cg-modal" role="dialog" aria-modal="true">
        <button class="cg-close" type="button" aria-label="Close">&times;</button>
        <div class="cg-body">
          <p class="cg-eyebrow"><span data-lang="cn">证明你是同行</span><span data-lang="en">Prove you're a peer</span></p>
          <div class="cg-formula">
            <span class="cg-int">&#8747;<span class="cg-lims"><sub>&minus;&infin;</sub><sup>+&infin;</sup></span></span>
            <span class="cg-e">e<sup>&minus;x&sup2;</sup></span>
            <span class="cg-dx">dx</span>
            <span class="cg-eq">=&nbsp;?</span>
          </div>
          <div class="cg-row">
            <input type="text" class="cg-input" placeholder="?" autocomplete="off">
            <button type="button" class="cg-go">&rarr;</button>
          </div>
          <div class="cg-result" hidden></div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('.cg-close');
    const input = overlay.querySelector('.cg-input');
    const go = overlay.querySelector('.cg-go');
    const result = overlay.querySelector('.cg-result');
    const row = overlay.querySelector('.cg-row');
    const formula = overlay.querySelector('.cg-formula');
    const eyebrow = overlay.querySelector('.cg-eyebrow');

    const open = () => { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; setTimeout(() => input.focus(), 50); };
    const close = () => { overlay.classList.remove('open'); document.body.style.overflow = ''; if (document.contains(openBtn)) openBtn.focus(); };
    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    const normalize = s => s.toLowerCase().replace(/\s+/g, '')
      .replace(/√/g, 'sqrt').replace(/π/g, 'pi')
      .replace(/\*\*/g, '^').replace(/\(1\/2\)/g, '^0.5').replace(/\^\(1\/2\)/g, '^0.5');
    const accept = ['sqrt(pi)', 'sqrtpi', 'pi^0.5', 'pi^.5', '1.772', '1.7724', '1.77245'];

    // Build contact links only after a correct answer, from char codes,
    // so the address never appears in HTML source.
    const fromCodes = codes => String.fromCharCode.apply(null, codes);
    const reveal = () => {
      const u = fromCodes([106,105,113,105,110,103,46,104,117,97,110,103,57,48]);
      const d = fromCodes([103,109,97,105,108,46,99,111,109]);
      const gh = fromCodes([104,116,116,112,115,58,47,47,103,105,116,104,117,98,46,99,111,109,47,106,105,113,105,110,103,104,117,97,110,103]);
      const addr = u + '@' + d;
      result.innerHTML = '';
      const mail = document.createElement('a');
      mail.href = 'mailto:' + addr;
      mail.textContent = addr;
      const ghLink = document.createElement('a');
      ghLink.href = gh;
      ghLink.target = '_blank';
      ghLink.rel = 'noopener';
      ghLink.textContent = 'GitHub';
      result.appendChild(mail);
      result.appendChild(document.createTextNode(' · '));
      result.appendChild(ghLink);
    };

    const check = () => {
      const v = normalize(input.value);
      // 严格数字：必须是纯数字串，避免 parseFloat('1.772abc') 误放行。
      const num = /^[0-9]*\.?[0-9]+$/.test(v) ? parseFloat(v) : NaN;
      const ok = accept.includes(v) || (!isNaN(num) && Math.abs(num - Math.sqrt(Math.PI)) < 0.001);
      if (ok) {
        formula.classList.add('cg-solved');
        row.hidden = true;
        eyebrow.hidden = true;
        reveal();
        result.hidden = false;
      } else {
        input.classList.add('cg-input-err');
        input.value = '';
        setTimeout(() => input.classList.remove('cg-input-err'), 500);
      }
    };
    go.addEventListener('click', check);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  }
});

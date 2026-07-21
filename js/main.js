// ===== i18n Language Engine =====
const I18N = {
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
      saved = localStorage.getItem('lang') || 'en';
    }
    this.set(saved, false);
    // Bind toggle buttons (use data-value to avoid CSS i18n conflict)
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.querySelectorAll('span').forEach(opt => {
        opt.addEventListener('click', () => {
          this.set(opt.dataset.value, true);
        });
      });
    });
    // file:// 下拦截内部导航链接，自动携带 ?lang= 保持语言跨页
    if (isFile) {
      document.querySelectorAll('a[href$=".html"]').forEach(a => {
        a.addEventListener('click', () => {
          const cur = document.body.classList.contains('lang-cn') ? 'cn' : 'en';
          const base = a.getAttribute('href').split('?')[0];
          a.setAttribute('href', base + '?lang=' + cur);
        });
      });
    }
  },

  set(lang, animate) {
    if (animate) {
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
    localStorage.setItem('lang', lang);
    // Update toggle buttons (use data-value)
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.querySelectorAll('span').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.value === lang);
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
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
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

    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) {
          lbImg.src = img.src;
          lbImg.alt = img.alt;
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    const close = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
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
    const close = () => { overlay.classList.remove('open'); document.body.style.overflow = ''; };
    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    const normalize = s => s.toLowerCase().replace(/\s+/g, '')
      .replace(/√/g, 'sqrt').replace(/π/g, 'pi')
      .replace(/\*\*/g, '^').replace(/\(1\/2\)/g, '^0.5').replace(/\^\(1\/2\)/g, '^0.5');
    const accept = ['sqrt(pi)', 'sqrtpi', 'pi^0.5', 'pi^.5', '√pi', '1.772', '1.7724', '1.77245'];

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
      const num = parseFloat(v);
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

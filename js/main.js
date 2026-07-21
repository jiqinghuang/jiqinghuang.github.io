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
});

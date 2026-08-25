// MAMBA STRIKE — page interactions
(function(){
  'use strict';

  // ------ Splash cleanup + skip-if-recent ------
  // Coordinates: (a) sessionStorage skip, (b) document.fonts.ready so no FOUT flash
  // between splash and hero, (c) minimum display time so it doesn't feel jarring.
  var splash = document.querySelector('[data-msa="splash"]');
  if(splash){
    var reduceMotionSplash = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var progressBar = splash.querySelector('.ms-splash__progress span');
    var removeSplash = function(){
      // Complete the progress bar (85% -> 100%) before fading splash out
      if(progressBar){
        progressBar.classList.add('ms-splash__progress--complete');
      }
      setTimeout(function(){
        splash.classList.add('ms-splash--out');
        document.body.classList.add('ms-splash-done');
        setTimeout(function(){
          if(splash && splash.parentNode) splash.parentNode.removeChild(splash);
        }, 500);
      }, 350); // wait for the fill-to-100% to render
    };
    // Kick off the slow "loading" fill to 85%
    if(progressBar && !reduceMotionSplash){
      requestAnimationFrame(function(){
        progressBar.style.width = '85%';
      });
    }
    try{
      var last = sessionStorage.getItem('msaSplashSeen');
      var now = Date.now();
      if(last && (now - parseInt(last,10)) < 30*60*1000){
        document.body.classList.add('ms-splash-done');
        splash.remove();
      } else {
        sessionStorage.setItem('msaSplashSeen', String(now));
        var startedAt = performance.now();
        var minDuration = reduceMotionSplash ? 500 : 2200;
        var maxDuration = 3500; // hard cap so splash can't hang forever on slow networks
        var released = false;
        var release = function(){
          if(released) return;
          released = true;
          var elapsed = performance.now() - startedAt;
          var wait = Math.max(0, minDuration - elapsed);
          setTimeout(removeSplash, wait);
        };
        // Gate on what the first screen actually needs — the hero still and the
        // fonts — NOT the window 'load' event. Waiting for 'load' held the splash
        // up until every other image AND the hero video had finished downloading,
        // which on mobile data is seconds of dead time behind a black screen.
        var heroImg = document.querySelector('.ms-hero-v2__still');
        var heroReady = (heroImg && !heroImg.complete)
          ? new Promise(function(res){
              heroImg.addEventListener('load', res, {once:true});
              heroImg.addEventListener('error', res, {once:true});
            })
          : Promise.resolve();
        // The font CSS now loads async, so document.fonts.ready can resolve before
        // the @font-face rules even exist. Wait for the stylesheet to land first
        // (bounded — a slow Google must never hold the splash), then for the faces.
        var fontLink = document.querySelector('link[data-msa="fontcss"]');
        var fontCssReady = (fontLink && fontLink.rel !== 'stylesheet')
          ? new Promise(function(res){
              fontLink.addEventListener('load', res, {once:true});
              fontLink.addEventListener('error', res, {once:true});
              setTimeout(res, 1200);
            })
          : Promise.resolve();
        var fontsReady = fontCssReady.then(function(){
          return (document.fonts && document.fonts.ready) ? document.fonts.ready : null;
        });
        Promise.all([heroReady, fontsReady]).then(release);
        // Hard safety cap
        setTimeout(release, maxDuration);
      }
    } catch(e){
      setTimeout(removeSplash, 2500);
    }
  }

  // ------ Hero video ------
  // The source is attached here rather than in markup for two reasons: each viewport
  // gets its own encode (960x540 / 540KB on phones, 1280x720 / 950KB above 1024), and
  // the 40KB still keeps first paint to itself. Both encodes are faststart — the moov
  // atom leads the file — so playback begins on the first chunk instead of waiting for
  // the whole download, which is what the original 2.8MB moov-at-the-end file required.
  var heroVideo = document.querySelector('.ms-hero-v2__video');
  if(heroVideo){
    var heroSource = heroVideo.querySelector('source[data-src-mobile]');
    var reduceMotionHero = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(heroSource && !reduceMotionHero){
      // Cross-fade over the still only once frames are actually rendering. The still is
      // frame 0 of this clip, so there is nothing to see in the handoff.
      heroVideo.addEventListener('playing', function(){
        heroVideo.classList.add('is-playing');
      }, {once:true});
      var wideHero = window.matchMedia && window.matchMedia('(min-width:1024px)').matches;
      heroSource.src = wideHero ? heroSource.dataset.srcDesktop : heroSource.dataset.srcMobile;
      heroVideo.load();
      var played = heroVideo.play();
      // Autoplay refused (low-power mode, data saver) — the still just stays.
      if(played && played.catch) played.catch(function(){});
    }
  }

  // ------ Scroll progress bar ------
  // scrollHeight/clientHeight are geometry reads — cheap on their own, but any style
  // mutation elsewhere (e.g. the FAB observer flipping a body class) invalidates layout,
  // and reading them on every scroll frame then forces a synchronous reflow. Cache the
  // max value and only recompute on resize / load, and write to the DOM inside rAF.
  var scrollBar = document.getElementById('scrollBar');
  var scrollMax = 0;
  var scrollRaf = 0;
  function measureScrollMax(){
    var doc = document.documentElement;
    scrollMax = doc.scrollHeight - doc.clientHeight;
  }
  function updateScrollBar(){
    if(!scrollBar || scrollRaf) return;
    scrollRaf = requestAnimationFrame(function(){
      scrollRaf = 0;
      var pct = scrollMax > 0 ? (window.scrollY / scrollMax) * 100 : 0;
      scrollBar.style.width = pct + '%';
    });
  }
  measureScrollMax();
  window.addEventListener('scroll', updateScrollBar, {passive:true});
  window.addEventListener('resize', function(){ measureScrollMax(); updateScrollBar(); });
  window.addEventListener('load', function(){ measureScrollMax(); updateScrollBar(); });
  updateScrollBar();

  // ------ Mobile menu toggle ------
  // Keyboard contract: the burger toggles on Enter/Space (it's a real <button>),
  // opening moves focus to the first link so the panel is reachable without
  // tabbing back through the header, Escape closes and returns focus to the
  // burger, and tabbing past the last link closes it instead of leaving an open
  // panel behind the caret.
  var menuBtn = document.querySelector('[data-msa="menubtn"]');
  var menuPanel = document.querySelector('[data-msa="menupanel"]');
  function menuIsOpen(){
    return !!menuPanel && menuPanel.dataset.open === '1';
  }
  function setMenu(open, opts){
    if(!menuPanel || !menuBtn) return;
    var wasOpen = menuIsOpen();
    menuPanel.dataset.open = open ? '1' : '0';
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'סגירת תפריט' : 'פתיחת תפריט');
    if(!opts || !opts.silent){
      if(open){
        var first = menuPanel.querySelector('a');
        if(first) first.focus();
      } else if(wasOpen && opts && opts.restoreFocus){
        menuBtn.focus();
      }
    }
  }
  if(menuBtn && menuPanel){
    menuBtn.addEventListener('click', function(){
      setMenu(!menuIsOpen());
    });
    menuPanel.addEventListener('click', function(e){
      var a = e.target.closest('a');
      if(a) setMenu(false, {silent:true});
    });
    document.addEventListener('click', function(e){
      if(!menuIsOpen()) return;
      if(menuBtn.contains(e.target) || menuPanel.contains(e.target)) return;
      setMenu(false, {silent:true});
    });
    document.addEventListener('keydown', function(e){
      if(e.key !== 'Escape' || !menuIsOpen()) return;
      setMenu(false, {restoreFocus:true});
    });
    // Tab out of the panel (either edge) closes it. focusout fires before the
    // new element is focused, so relatedTarget is what we have to test.
    menuPanel.addEventListener('focusout', function(e){
      if(!menuIsOpen()) return;
      var next = e.relatedTarget;
      if(next && (menuPanel.contains(next) || menuBtn.contains(next))) return;
      setMenu(false, {silent:true});
    });
  }

  // ------ Conversion event layer ------
  // Fires one dataLayer event per conversion tap. It is deliberately
  // analytics-agnostic: with no GA4 snippet on the page the pushes just queue on
  // window.dataLayer and nothing leaves the browser. The moment a GA4
  // Measurement ID is added to index.html, every event below starts reporting
  // with no further code changes. Delegated off href so the markup stays clean.
  window.dataLayer = window.dataLayer || [];
  function track(action, label){
    try{
      window.dataLayer.push({event:'ms_' + action, ms_action:action, ms_label:label || ''});
    } catch(e){}
  }
  function actionForHref(href){
    if(!href) return '';
    if(href.indexOf('tel:') === 0) return 'phone_click';
    if(href.indexOf('wa.me') > -1 || href.indexOf('whatsapp.com') > -1) return 'whatsapp_click';
    if(href.indexOf('letts.co.il') > -1) return 'trial_click';
    if(href.indexOf('waze.com') > -1) return 'waze_click';
    if(href.indexOf('google.com/maps') > -1) return 'map_click';
    if(href.indexOf('share.google') > -1) return 'gbp_click';
    return '';
  }
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href]');
    if(!a || a.hasAttribute('data-ms-notrack')) return;
    var action = actionForHref(a.getAttribute('href') || '');
    if(!action) return;
    var label = (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 60);
    track(action, label);
  }, true);

  // ------ FAB visibility ------
  // The floating button is suppressed over every band that carries its own
  // WhatsApp / trial CTA: the hero, the audience cards, the red trial block and
  // the contact section. That is what stops it sitting on top of the adults card
  // button and the contact buttons — a floating control can't be nudged out of
  // the way of a full-width button, so it steps aside instead. Everywhere else
  // (about / programs / how-we-train / coach / testimonials / FAQ) it shows.
  //
  // The class flip is deferred to rAF so the layout invalidation lands in the same
  // frame as the paint, not mid-scroll where it would force any subsequent geometry
  // read (see updateScrollBar above) to reflow synchronously.
  var fabBlockers = document.querySelectorAll('.ms-hero-v2, #audience, .ms-cta-block, #contact');
  if(fabBlockers.length && 'IntersectionObserver' in window){
    var blocked = new Set();
    var fabState = null;
    var fabObs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.intersectionRatio > 0.06) blocked.add(entry.target);
        else blocked.delete(entry.target);
      });
      var next = blocked.size ? 'hide' : 'show';
      if(next === fabState) return;
      fabState = next;
      requestAnimationFrame(function(){
        document.body.classList.toggle('ms-fab-visible', next === 'show');
      });
    }, {threshold:[0, 0.06, 0.3]});
    fabBlockers.forEach(function(el){ fabObs.observe(el); });
  }

  // ------ Reveal-on-scroll (IntersectionObserver, with sibling stagger) ------
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var anim = document.querySelectorAll('[data-anim]');
  if(reduceMotion || !('IntersectionObserver' in window)){
    anim.forEach(function(el){ el.classList.remove('msa-off'); });
  } else {
    // Pre-compute stagger: siblings-with-data-anim get --anim-delay based on index
    var seen = new WeakSet();
    anim.forEach(function(el){
      if(seen.has(el)) return;
      var parent = el.parentElement;
      if(!parent) return;
      var sibs = Array.prototype.filter.call(parent.children, function(c){ return c.hasAttribute && c.hasAttribute('data-anim'); });
      if(sibs.length > 1){
        sibs.forEach(function(sib, i){
          seen.add(sib);
          sib.style.setProperty('--anim-delay', (i * 90) + 'ms');
        });
      } else {
        seen.add(el);
      }
      el.classList.add('msa-off');
    });
    // Observer — reveals each element when it enters; stagger comes from --anim-delay
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.remove('msa-off');
          io.unobserve(entry.target);
        }
      });
    }, {rootMargin:'0px 0px -6% 0px', threshold:0.06});
    anim.forEach(function(el){ io.observe(el); });
  }

  // ------ FAQ accordion (with a11y wiring) ------
  var faq = document.querySelector('[data-msa="faq"]');
  if(faq){
    // Wire ARIA associations once on init
    faq.querySelectorAll('.ms-faq-item').forEach(function(item, i){
      var btn = item.querySelector('.ms-faq-q');
      var panel = item.querySelector('.ms-faq-a');
      if(!btn || !panel) return;
      var pid = 'msaFaqPanel_' + i;
      panel.id = pid;
      btn.setAttribute('aria-controls', pid);
      btn.setAttribute('aria-expanded', 'false');
      panel.setAttribute('role', 'region');
      panel.hidden = true;
    });
    faq.addEventListener('click', function(e){
      var btn = e.target.closest('.ms-faq-q');
      if(!btn) return;
      var item = btn.parentElement;
      var panel = item.querySelector('.ms-faq-a');
      var open = item.dataset.open === '1';
      faq.querySelectorAll('.ms-faq-item').forEach(function(other){
        if(other === item) return;
        other.dataset.open = '0';
        var otherBtn = other.querySelector('.ms-faq-q');
        var otherPanel = other.querySelector('.ms-faq-a');
        if(otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        if(otherPanel){ otherPanel.style.maxHeight = '0px'; otherPanel.hidden = true; }
      });
      if(open){
        item.dataset.open = '0';
        btn.setAttribute('aria-expanded', 'false');
        panel.style.maxHeight = '0px';
        panel.hidden = true;
      } else {
        item.dataset.open = '1';
        btn.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
    window.addEventListener('resize', function(){
      var open = faq.querySelector('.ms-faq-item[data-open="1"] .ms-faq-a');
      if(open) open.style.maxHeight = open.scrollHeight + 'px';
    });
  }

  // ------ Contact form — WhatsApp handoff (no backend today) ------
  // NOTE: The site currently has no server to persist leads. The form composes
  // a message and opens WhatsApp; the actual send happens from WhatsApp. This
  // is why we don't say "קיבלנו" — the message is only received once the user
  // taps Send in WhatsApp.
  var contactForm = document.getElementById('contactForm');
  var contactSuccess = document.getElementById('contactSuccess');
  var contactResend = document.getElementById('contactResend');
  var lastWaUrl = '';

  function setError(el, msg){
    if(!el) return;
    var wrap = el.closest('.ms-field');
    if(!wrap) return;
    el.setAttribute('aria-invalid', 'true');
    var errId = el.id + 'Err';
    el.setAttribute('aria-describedby', errId);
    var err = wrap.querySelector('.ms-field-err');
    if(!err){
      err = document.createElement('p');
      err.className = 'ms-field-err';
      err.id = errId;
      wrap.appendChild(err);
    }
    err.textContent = msg;
  }
  function clearError(el){
    if(!el) return;
    el.removeAttribute('aria-invalid');
    el.removeAttribute('aria-describedby');
    var wrap = el.closest('.ms-field');
    var err = wrap && wrap.querySelector('.ms-field-err');
    if(err) err.remove();
  }
  function buildWaUrl(){
    var name = contactForm.querySelector('#cName');
    var phone = contactForm.querySelector('#cPhone');
    var audience = contactForm.querySelector('#cAudience');
    var interest = contactForm.querySelector('#cInterest');
    var notes = contactForm.querySelector('#cNotes');
    var msg = 'שלום, אשמח לתאם אימון ניסיון ב־MAMBA STRIKE.\n';
    if(name) msg += 'שם: ' + name.value.trim() + '\n';
    if(phone) msg += 'טלפון: ' + phone.value.trim() + '\n';
    if(audience && audience.value) msg += 'למי האימון: ' + audience.value + '\n';
    if(interest && interest.value) msg += 'תחום מעניין: ' + interest.value + '\n';
    if(notes && notes.value.trim()) msg += 'הערות: ' + notes.value.trim() + '\n';
    return 'https://wa.me/972524479512?text=' + encodeURIComponent(msg);
  }
  function openWa(url){
    var link = document.createElement('a');
    // Marked so the click delegator doesn't also log a whatsapp_click for the
    // synthetic anchor — a form send is one conversion, not two.
    link.setAttribute('data-ms-notrack', '');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if(contactForm){
    contactForm.addEventListener('input', function(e){
      var el = e.target;
      if(el.matches('input,select,textarea') && el.value.trim()){
        clearError(el);
      }
    });
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      var name = contactForm.querySelector('#cName');
      var phone = contactForm.querySelector('#cPhone');
      var firstInvalid = null;
      [
        {el:name, msg:'נא להזין שם מלא'},
        {el:phone, msg:'נא להזין מספר טלפון'}
      ].forEach(function(f){
        if(!f.el) return;
        if(!f.el.value.trim()){
          setError(f.el, f.msg);
          if(!firstInvalid) firstInvalid = f.el;
        } else {
          clearError(f.el);
        }
      });
      if(firstInvalid){ firstInvalid.focus(); return; }
      lastWaUrl = buildWaUrl();
      track('form_submit', 'contact');
      contactForm.hidden = true;
      if(contactSuccess){
        contactSuccess.hidden = false;
        // Move the caret to the confirmation so keyboard and screen-reader users
        // land on it — the form they were in has just been removed from the flow.
        var successHeading = contactSuccess.querySelector('h4');
        if(successHeading){
          successHeading.setAttribute('tabindex', '-1');
          successHeading.focus();
        }
      }
      openWa(lastWaUrl);
    });
  }
  if(contactResend){
    contactResend.addEventListener('click', function(e){
      e.preventDefault();
      if(lastWaUrl) openWa(lastWaUrl);
    });
  }
})();

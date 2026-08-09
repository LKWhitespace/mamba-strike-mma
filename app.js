// MAMBA STRIKE — page interactions
(function(){
  'use strict';

  // ------ Scroll progress bar ------
  var scrollBar = document.getElementById('scrollBar');
  function updateScrollBar(){
    if(!scrollBar) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    scrollBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateScrollBar, {passive:true});
  window.addEventListener('resize', updateScrollBar);
  updateScrollBar();

  // ------ Mobile menu toggle ------
  var menuBtn = document.querySelector('[data-msa="menubtn"]');
  var menuPanel = document.querySelector('[data-msa="menupanel"]');
  function setMenu(open){
    if(!menuPanel || !menuBtn) return;
    menuPanel.dataset.open = open ? '1' : '0';
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if(menuBtn && menuPanel){
    menuBtn.addEventListener('click', function(){
      setMenu(menuPanel.dataset.open !== '1');
    });
    menuPanel.addEventListener('click', function(e){
      var a = e.target.closest('a');
      if(a) setMenu(false);
    });
    document.addEventListener('click', function(e){
      if(menuPanel.dataset.open !== '1') return;
      if(menuBtn.contains(e.target) || menuPanel.contains(e.target)) return;
      setMenu(false);
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') setMenu(false);
    });
  }

  // ------ Reveal-on-scroll (IntersectionObserver) ------
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var anim = document.querySelectorAll('[data-anim]');
  if(reduceMotion || !('IntersectionObserver' in window)){
    // Motion-sensitive or unsupported: never hide content.
    anim.forEach(function(el){ el.classList.remove('msa-off'); });
  } else {
    anim.forEach(function(el){ el.classList.add('msa-off'); });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.remove('msa-off');
          io.unobserve(entry.target);
        }
      });
    }, {rootMargin:'0px 0px -8% 0px', threshold:0.08});
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

  // ------ Contact form ------
  var contactForm = document.getElementById('contactForm');
  var contactSuccess = document.getElementById('contactSuccess');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      var name = contactForm.querySelector('#cName');
      var phone = contactForm.querySelector('#cPhone');
      var ok = true;
      [name, phone].forEach(function(el){
        if(!el || !el.value.trim()){
          if(el){ el.style.borderColor = 'var(--accent)'; }
          ok = false;
        } else {
          el.style.borderColor = '';
        }
      });
      if(!ok){
        var firstInvalid = contactForm.querySelector('input[style*="var(--accent)"]');
        if(firstInvalid) firstInvalid.focus();
        return;
      }
      // Placeholder submit — hand off to the WhatsApp handoff.
      var msg = 'שלום, אשמח לתאם אימון ניסיון ב־MAMBA STRIKE.\n';
      msg += 'שם: ' + name.value.trim() + '\n';
      msg += 'טלפון: ' + phone.value.trim() + '\n';
      var age = contactForm.querySelector('#cAge');
      var audience = contactForm.querySelector('#cAudience');
      var interest = contactForm.querySelector('#cInterest');
      var notes = contactForm.querySelector('#cNotes');
      if(age && age.value) msg += 'גיל: ' + age.value + '\n';
      if(audience && audience.value) msg += 'למי האימון: ' + audience.value + '\n';
      if(interest && interest.value) msg += 'תחום מעניין: ' + interest.value + '\n';
      if(notes && notes.value.trim()) msg += 'הערות: ' + notes.value.trim() + '\n';
      var waUrl = 'https://wa.me/972524479512?text=' + encodeURIComponent(msg);
      contactForm.hidden = true;
      if(contactSuccess) contactSuccess.hidden = false;
      // WhatsApp handoff via a synthesized <a> click — window.open triggers popup-blockers on iOS Safari.
      var link = document.createElement('a');
      link.href = waUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(function(){ contactForm.reset(); }, 400);
    });
  }
})();

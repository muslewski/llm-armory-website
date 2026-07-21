(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const revEls = document.querySelectorAll('.reveal')
  if (!reduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    )
    revEls.forEach((el) => io.observe(el))
  } else {
    revEls.forEach((el) => el.classList.add('visible'))
  }

  let toastEl = null
  function showToast(el) {
    if (!toastEl) {
      toastEl = document.createElement('div')
      toastEl.id = 'copy-toast'
      toastEl.textContent = 'Copied'
      document.body.appendChild(toastEl)
    }
    const r = el.getBoundingClientRect()
    toastEl.style.left = r.left + r.width / 2 + 'px'
    toastEl.style.top = r.top + 'px'
    toastEl.classList.remove('show')
    void toastEl.offsetWidth
    toastEl.classList.add('show')
    clearTimeout(showToast._t)
    showToast._t = setTimeout(() => toastEl.classList.remove('show'), 1400)
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text)
    }
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.top = '0'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('copy failed'))
      } catch (e) {
        reject(e)
      } finally {
        document.body.removeChild(ta)
      }
    })
  }

  window.copyCmd = function (el) {
    const cmd = el.getAttribute('data-cmd')
    if (!cmd) return
    copyText(cmd)
      .then(() => {
        el.classList.add('copied')
        showToast(el)
        setTimeout(() => el.classList.remove('copied'), 1500)
      })
      .catch(() => {})
  }

  document.addEventListener('keydown', (e) => {
    if (
      (e.key === 'Enter' || e.key === ' ') &&
      e.target instanceof Element &&
      e.target.hasAttribute('data-cmd')
    ) {
      e.preventDefault()
      window.copyCmd(e.target)
    }
  })
})()

// R5 motion plates
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll("video[data-auto]").forEach((v) => {
  if (reduce) {
    v.removeAttribute("autoplay");
    v.pause();
    v.controls = true;
  } else {
    v.muted = true;
    v.play().catch(() => {});
  }
});

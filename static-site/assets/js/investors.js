// Reflect the existing site's mobile-menu state for keyboard/screen-reader users.
(() => {
  const nav = document.getElementById('site-nav');
  const button = nav?.querySelector('.nav-burger');
  if (!button) return;
  const sync = () => button.setAttribute('aria-expanded', String(nav.classList.contains('nav-open')));
  new MutationObserver(sync).observe(nav, {attributes: true, attributeFilter: ['class']});
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('nav-open')) {
      nav.classList.remove('nav-open');
      button.focus();
    }
  });
  sync();
})();

// Place the calendar cursor between period starts. Planned stages keep their status.
(() => {
  const track = document.querySelector('.inv-roadmap-track');
  const timeline = track?.querySelector('.inv-timeline');
  const marker = track?.querySelector('.inv-now');
  const inline = track?.querySelector('.inv-now-inline');
  if (!timeline || !marker || !inline) return;
  const stages = [...timeline.querySelectorAll('li[data-roadmap-date]')];
  const anchors = stages.map(stage => Date.parse(`${stage.dataset.roadmapDate}T00:00:00Z`));
  if (anchors.some(date => !Number.isFinite(date))) return;
  const dayFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Brussels', year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const locale = {en: 'en-GB', nl: 'nl-BE', pl: 'pl-PL'}[document.documentElement.lang] || 'en-GB';
  const labelFormatter = new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC', year: 'numeric', month: 'short', day: '2-digit',
  });
  const center = stage => {
    const dot = stage.querySelector('.inv-milestone');
    return {
      x: timeline.offsetLeft + stage.offsetLeft + dot.offsetLeft + dot.offsetWidth / 2,
      y: timeline.offsetTop + stage.offsetTop + dot.offsetTop + dot.offsetHeight / 2,
    };
  };
  const update = () => {
    const parts = Object.fromEntries(dayFormatter.formatToParts(new Date()).map(part => [part.type, part.value]));
    const today = `${parts.year}-${parts.month}-${parts.day}`;
    const day = Date.parse(`${today}T00:00:00Z`);
    let index = anchors.findLastIndex(date => date <= day);
    index = Math.max(0, index);
    const next = Math.min(index + 1, stages.length - 1);
    const fraction = next === index ? 0 : Math.max(0, Math.min(1, (day - anchors[index]) / (anchors[next] - anchors[index])));
    const destination = stages[index].querySelector('.inv-stage-copy');
    if (inline.parentElement !== destination) destination.querySelector('.inv-stage-date').after(inline);
    const label = labelFormatter.format(new Date(day));
    for (const time of [marker.querySelector('time'), inline.querySelector('time')]) {
      time.dateTime = today;
      if (time.textContent !== label) time.textContent = label;
    }
    marker.setAttribute('aria-label', `${marker.dataset.nowLabel}: ${label}`);
    const start = center(stages[index]);
    const end = center(stages[next]);
    const x = start.x + (end.x - start.x) * fraction;
    marker.style.left = `${x}px`;
    marker.style.top = `${start.y + (end.y - start.y) * fraction}px`;
    marker.hidden = false;
    const caption = marker.querySelector('.inv-now-label');
    caption.style.left = `${Math.max(0, Math.min(track.clientWidth - caption.offsetWidth, x - caption.offsetWidth / 2)) - x}px`;
  };
  new ResizeObserver(update).observe(track);
  document.fonts?.ready.then(update);
  window.addEventListener('resize', update);
  document.addEventListener('visibilitychange', update);
  setInterval(update, 60_000);
  update();
})();

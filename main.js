/* ============================================================
   MCE 312 Signals & Systems — main.js
   ============================================================ */

// ── Sidebar Toggle ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const sidebar  = document.querySelector('.sidebar');
  const overlay  = document.querySelector('.sidebar-overlay');
  const menuBtn  = document.querySelector('.menu-toggle');

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay && overlay.classList.toggle('show');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar && sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }

  // ── Active nav link ───────────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ── Fade-in on scroll ─────────────────────────────────────
  const cards = document.querySelectorAll('.card, .module-card, .stat-card, .quiz-question');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(18px)';
    card.style.transition = `opacity 0.45s ease ${i * 0.05}s, transform 0.45s ease ${i * 0.05}s, border-color 0.22s, box-shadow 0.22s`;
    observer.observe(card);
  });

  // ── Quiz Engine ───────────────────────────────────────────
  initQuiz();
});

/* ── Quiz Engine ─────────────────────────────────────────── */
function initQuiz() {
  const quizWrapper = document.querySelector('.quiz-wrapper');
  if (!quizWrapper) return;

  const questions = quizWrapper.querySelectorAll('.quiz-question');
  const progressFill = quizWrapper.querySelector('.quiz-progress-fill');
  const scoreCard = quizWrapper.querySelector('.quiz-score-card');
  const retryBtn  = quizWrapper.querySelector('.btn-retry');

  let answered = 0;
  let correct  = 0;
  const total  = questions.length;

  questions.forEach((qEl, qIdx) => {
    const options = qEl.querySelectorAll('.q-option');
    const explanation = qEl.querySelector('.q-explanation');
    const correctIdx = parseInt(qEl.dataset.correct);

    options.forEach((opt, oIdx) => {
      opt.addEventListener('click', () => {
        if (qEl.dataset.answered) return;
        qEl.dataset.answered = '1';
        answered++;

        options.forEach(o => o.disabled = true);

        if (oIdx === correctIdx) {
          opt.classList.add('correct');
          qEl.classList.add('answered');
          correct++;
        } else {
          opt.classList.add('wrong');
          qEl.classList.add('incorrect');
          options[correctIdx].classList.add('correct');
        }

        if (explanation) {
          explanation.classList.add('show');
        }

        // Update progress
        const pct = (answered / total) * 100;
        if (progressFill) progressFill.style.width = pct + '%';

        // Show score card when all answered
        if (answered === total && scoreCard) {
          setTimeout(() => {
            scoreCard.classList.add('show');
            const scoreNum = scoreCard.querySelector('.score-num');
            if (scoreNum) scoreNum.textContent = `${correct}/${total}`;

            const grade = getGrade(correct, total);
            const gradeEl = scoreCard.querySelector('.grade-label');
            if (gradeEl) gradeEl.textContent = grade;
          }, 600);
        }
      });
    });
  });

  // Retry
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      answered = 0; correct = 0;
      questions.forEach(qEl => {
        delete qEl.dataset.answered;
        qEl.classList.remove('answered', 'incorrect');
        qEl.querySelectorAll('.q-option').forEach(opt => {
          opt.classList.remove('correct', 'wrong');
          opt.disabled = false;
        });
        const exp = qEl.querySelector('.q-explanation');
        if (exp) exp.classList.remove('show');
      });
      if (progressFill) progressFill.style.width = '0%';
      if (scoreCard) scoreCard.classList.remove('show');
      quizWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

function getGrade(correct, total) {
  const pct = (correct / total) * 100;
  if (pct >= 90) return 'Outstanding! 🎖️';
  if (pct >= 70) return 'Well done! Keep it up.';
  if (pct >= 50) return 'Fair. Review the explanations.';
  return 'Keep studying — you\'ll get there!';
}

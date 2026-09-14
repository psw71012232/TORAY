/* ==============================================================================
   [자바스크립트] 2026년 도레이첨단소재 부드럽 과정 웹사이트 인터랙션
   - 모바일 드로어 메뉴 열기/닫기
   - 서브 카테고리 탭 전환 기능
   - 프로그램 필터링 기능
   - FAQ 질문답변 아코디언
   - 감성 동영상 모달 팝업
   - 웹 오디오 기반 힐링 사운드(BGM) 기능
   ============================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ----------------------------------------------------------------------------
  // 1. 모바일 메뉴 (드로어) 제어
  // ----------------------------------------------------------------------------
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  function openDrawer() {
    mobileDrawer.classList.add('open');
    mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('open');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // ----------------------------------------------------------------------------
  // 2. 과정소개 서브 카테고리 탭 전환 기능
  // ----------------------------------------------------------------------------
  const tabBtns = document.querySelectorAll('.sub-category-tabs .tab-btn');
  const tabPanes = document.querySelectorAll('#intro .tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });

  // ----------------------------------------------------------------------------
  // 3. 프로그램 카테고리 필터링 기능 (전체보기, 사유원, 화본역, 미술관, 황리단길)
  // ----------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.prog-filter-btn');
  const programCards = document.querySelectorAll('.program-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      programCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'grid';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ----------------------------------------------------------------------------
  // 4. FAQ 아코디언 토글 기능
  // ----------------------------------------------------------------------------
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = item.querySelector('.accordion-body');
      const isActive = item.classList.contains('active');

      // 다른 열려있는 아코디언 닫기
      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.accordion-body').style.maxHeight = null;
        }
      });

      if (!isActive) {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      } else {
        item.classList.remove('active');
        body.style.maxHeight = null;
      }
    });
  });

  // ----------------------------------------------------------------------------
  // 5. 감성 동영상 모달 팝업 제어
  // ----------------------------------------------------------------------------
  const videoModal = document.getElementById('videoModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const videoIframe = document.getElementById('videoIframe');
  const videoModalTitle = document.getElementById('videoModalTitle');
  const openVideoModalBtn = document.getElementById('openVideoModalBtn');

  // 기본 대표 영상 URL (자연 힐링 고화질 영상)
  // // 여기 수정: 메인 인트로 영상의 유튜브 링크(임베드 형식)를 지정할 수 있습니다.
  const defaultVideoUrl = "https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=1";

  window.openProgramVideo = function(title, url) {
    if (videoModal && videoIframe) {
      videoModalTitle.textContent = `2026 부드럽 과정 [${title}] 영상`;
      videoIframe.src = url + "?autoplay=1";
      videoModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  function closeVideoModal() {
    if (videoModal && videoIframe) {
      videoModal.classList.remove('active');
      videoIframe.src = ""; // 영상 정지
      document.body.style.overflow = '';
    }
  }

  if (openVideoModalBtn) {
    openVideoModalBtn.addEventListener('click', () => {
      videoModalTitle.textContent = "2026 부드럽 과정 감성 인트로 영상";
      videoIframe.src = defaultVideoUrl;
      videoModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeVideoModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeVideoModal);

  // ESC 키로 모달 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.classList.contains('active')) {
      closeVideoModal();
    }
  });

  // ----------------------------------------------------------------------------
  // 6. 힐링 배경 오디오 (Web Audio API 기반 앰비언트 차임벨)
  // 별도의 외부 음원 파일 다운로드 없이 브라우저 자체에서 맑고 편안한 자연 공명음을 생성합니다.
  // ----------------------------------------------------------------------------
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicIcon = document.getElementById('musicIcon');
  let audioCtx = null;
  let isPlaying = false;
  let ambientTimer = null;

  // 따뜻한 펜타토닉 힐링 주파수 (도-레-미-솔-라 자연 화음)
  const healingFrequencies = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];

  function playHealingTone() {
    if (!audioCtx || !isPlaying) return;

    try {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      // 무작위로 화음 주파수 선택
      const freq = healingFrequencies[Math.floor(Math.random() * healingFrequencies.length)];
      osc.type = 'sine'; // 가장 부드러운 사인파
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // 서서히 울려퍼졌다가 사라지는 차임벨 효과 (엔벨로프)
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 1.2);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 5.5);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 5.6);
    } catch (e) {
      console.warn("Audio error:", e);
    }

    // 다음 소리 재생 간격 (2.5초 ~ 4초 사이 랜덤)
    if (isPlaying) {
      const nextDelay = 2500 + Math.random() * 2000;
      ambientTimer = setTimeout(playHealingTone, nextDelay);
    }
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      if (!isPlaying) {
        isPlaying = true;
        musicToggleBtn.classList.add('playing');
        musicIcon.className = "fa-solid fa-volume-high";
        playHealingTone();
      } else {
        isPlaying = false;
        clearTimeout(ambientTimer);
        musicToggleBtn.classList.remove('playing');
        musicIcon.className = "fa-solid fa-volume-xmark";
      }
    });
  }

  // ----------------------------------------------------------------------------
  // 7. 스크롤 시 상단 헤더 스타일 및 하단 탭 활성화 감지
  // ----------------------------------------------------------------------------
  const header = document.getElementById('mainHeader');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links .nav-item');
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item');

  window.addEventListener('scroll', () => {
    // 헤더 그림자 제어
    if (window.scrollY > 40) {
      header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
    } else {
      header.style.boxShadow = 'none';
    }

    // 스크롤 위치에 따른 활성 탭 하이라이트
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });

      bottomNavItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${currentId}`) {
          item.classList.add('active');
        }
      });
    }
  });

});

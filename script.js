/* ------------------------- Utilities ------------------------- */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function el(tag, cls=''){
  const e = document.createElement(tag);
  if(cls) e.className = cls;
  return e;
}

/* ------------------------- Background network grid ------------------------- */
(function(){
  const c = document.getElementById('netgrid');
  const ctx = c.getContext('2d');
  let w,h,points=[];
  function resize(){
    w = c.width = innerWidth;
    h = c.height = innerHeight;
    points.length = 0;
    const step = 80;
    for(let x=0; x<w; x+=step) {
      for(let y=0; y<h; y+=step) {
        points.push({
          x: x + Math.random()*step,
          y: y + Math.random()*step,
          ox: x,
          oy: y,
          rad: Math.random()*1.2
        });
      }
    }
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,229,255,0.06)';
    for(let p of points){
      ctx.beginPath();
      ctx.moveTo(p.x,p.y);
      for(let q of points){
        let dx = q.x - p.x, dy = q.y - p.y;
        let d = Math.hypot(dx,dy);
        if(d < 160){
          ctx.globalAlpha = 0.06 * (1 - d/160);
          ctx.lineTo(q.x, q.y);
        }
      }
      ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* ------------------------- Map canvas (interactive nodes) ------------------------- */
(function(){
  const canvas = document.getElementById('map');
  const ctx = canvas.getContext('2d');
  let w,h, nodes=[];
  const colors = {
    node: 'rgba(0,229,255,0.9)',
    line: 'rgba(0,229,255,0.09)',
    alert: 'rgba(255,23,68,0.95)'
  };
  const liveCount = document.getElementById('live-count');
  const livebar = document.getElementById('livebar');

  function resize(){
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    w = rect.width;
    h = rect.height;
    initNodes();
  }

  function initNodes(){
    nodes.length = 0;
    const count = 18;
    for(let i=0; i<count; i++){
      nodes.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: 2 + Math.random()*3,
        pulse: Math.random(),
        pop: Math.random() > 0.95,
        info: `Node ${i+1}: ${['Wi-Fi Crack','Mobile Hook','ARP Spoof','Pivot'][Math.floor(Math.random()*4)]}`
      });
    }
    liveCount.textContent = nodes.filter(n=>n.pop).length;
  }

  let mouse = {x:-9999, y:-9999};
  canvas.addEventListener('mousemove', e=>{
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', ()=>{
    mouse.x = -9999;
    mouse.y = -9999;
  });
  canvas.addEventListener('click', e=>{
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    for(let n of nodes){
      if(Math.hypot(n.x - mx, n.y - my) < 18){
        flashNode(n);
        break;
      }
    }
  });

  function flashNode(n){
    n.flash = 1;
    setTimeout(()=>n.flash=0, 900);
  }

  function update(ts){
    ctx.clearRect(0,0,w,h);

    for(let i=0; i<nodes.length; i++){
      for(let j=i+1; j<nodes.length; j++){
        let a=nodes[i], b=nodes[j];
        let d = Math.hypot(a.x-b.x, a.y-b.y);
        if(d < 220){
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = colors.line;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    for(let n of nodes){
      n.x += Math.sin((ts/1000 + n.pulse*7)) * 0.18;
      n.y += Math.cos((ts/1000 + n.pulse*4)) * 0.18;

      const md = Math.hypot(n.x - mouse.x, n.y - mouse.y);
      let hover = md < 48;
      const baseR = n.r * (n.pop ? 1.6 : 1);
      const r = baseR + (hover ? 4 : 0) + (n.flash ? 6 : 0);

      ctx.beginPath();
      ctx.fillStyle = `rgba(0,229,255,${hover ? 0.22 : 0.06})`;
      ctx.arc(n.x, n.y, r*3.6, 0, Math.PI*2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = colors.node;
      ctx.arc(n.x, n.y, r, 0, Math.PI*2);
      ctx.fill();

      if(hover){
        ctx.fillStyle = 'rgba(2,6,12,0.9)';
        ctx.fillRect(n.x+14, n.y-24, 160, 22);
        ctx.fillStyle = colors.node;
        ctx.font = '11px "Fira Code"';
        ctx.fillText(n.info, n.x+20, n.y-9);
      }
    }

    const active = nodes.filter(n=>n.pop).length;
    livebar.style.width = `${14 + active*4}%`;

    requestAnimationFrame(update);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(update);

  canvas.addEventListener('touchstart', e=>{
    const t = e.touches[0];
    const r = canvas.getBoundingClientRect();
    const x = t.clientX - r.left, y = t.clientY - r.top;
    for(let n of nodes)
      if(Math.hypot(n.x - x, n.y - y) < 22){
        flashNode(n);
        break;
      }
  }, {passive: true});
})();

/* ------------------------- Typewriter + glitch headline ------------------------- */
(function(){
  const target = document.getElementById('typewriter');
  const phrases = [
    'Wi-Fi Pentesting • Evil Twin • WPA3 Cracking',
    'Mobile App RE • Frida • Objection • Drozer',
    'Network Pivoting • ARP Spoof • VLAN Hopping'
  ];
  let pi=0, ci=0, dir=1;

  function tick(){
    const txt = phrases[pi];
    if(dir === 1){
      ci++;
      target.textContent = txt.slice(0,ci) + ' _';
      if(ci >= txt.length){
        dir = 0;
        setTimeout(tick, 1200);
        return;
      }
    } else {
      ci--;
      target.textContent = txt.slice(0,ci) + ' _';
      if(ci <= 0){
        dir = 1;
        pi = (pi+1) % phrases.length;
      }
    }
    setTimeout(tick, 60);
  }
  tick();

  const nameEl = document.querySelector('.name');
  setInterval(()=>{
    nameEl.style.transform = 'translateX(-4px)';
    nameEl.style.opacity = 0.88;
    setTimeout(()=>{
      nameEl.style.transform = '';
      nameEl.style.opacity = '';
    }, 120);
  }, 4500);
})();

/* ------------------------- Cursor underscore follow ------------------------- */
(function(){
  const cursor = document.getElementById('cursor');
  function move(e){
    cursor.style.left = (e.clientX + 6) + 'px';
    cursor.style.top = (e.clientY + 6) + 'px';
  }
  window.addEventListener('mousemove', move);
  window.addEventListener('touchstart', ()=> cursor.style.display = 'none');
})();

/* ------------------------- Skills grid ------------------------- */
(function(){
  const skills = [
    {name:'Wi-Fi Pentesting', icon:'WIFI', stat:'WPA3, Evil Twin, PMKID', level:94},
    {name:'Mobile App RE', icon:'MOB', stat:'Frida, Jadx, Objection', level:90},
    {name:'Network Pivoting', icon:'PIV', stat:'Chisel, SSH, Proxychains', level:88},
    {name:'Bluetooth Hacking', icon:'BT', stat:'BLE, RFCOMM, Spoofing', level:82},
    {name:'Packet Crafting', icon:'PCAP', stat:'Scapy, tcpdump, Wireshark', level:86},
    {name:'Active Directory', icon:'AD', stat:'Kerberos, BloodHound, ACL', level:76}
  ];
  const grid = $('#skills-grid');
  for(let s of skills){
    const card = el('div','skill');
    const ic = el('div','icon');
    ic.textContent = s.icon;
    ic.style.border = '1px solid rgba(255,255,255,0.03)';
    ic.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.05))';
    ic.style.color = 'var(--cyan)';

    const t = el('div');
    const h = el('h4');
    h.textContent = s.name;
    const st = el('div');
    st.className = 'stat';
    st.textContent = s.stat;

    const mini = el('div','mini-graph');
    const bar = el('div','bar');
    mini.appendChild(bar);

    t.appendChild(h);
    t.appendChild(st);
    card.appendChild(ic);
    card.appendChild(t);
    card.appendChild(mini);
    grid.appendChild(card);

    card.addEventListener('mouseenter', ()=>{
      bar.style.width = s.level + '%';
      ic.style.boxShadow = '0 6px 24px rgba(0,229,255,0.06),0 0 18px rgba(0,229,255,0.04)';
    });
    card.addEventListener('mouseleave', ()=>{
      bar.style.width = '0%';
      ic.style.boxShadow = '';
    });

    card.addEventListener('click', ()=>{
      if(bar.style.width === '0%' || !bar.style.width)
        bar.style.width = s.level + '%';
      else
        bar.style.width = '0%';
    });
  }
})();

/* ------------------------- Certifications carousel ------------------------- */
(function(){
  const certs = [
    {code:'OSCP', org:'Offensive Security', year:2023},
    {code:'OSWP', org:'Offensive Security', year:2022},
    {code:'eWPT', org:'eLearnSecurity', year:2021},
    {code:'PNPT', org:'TCM Security', year:2023}
  ];
  const strip = $('#cert-strip');
  for(let c of certs){
    const box = el('div','cert');
    box.style.position = 'relative';
    const flip = el('div','flip');
    flip.style.position = 'relative';
    const front = el('div','front');
    front.textContent = c.code;
    front.style.fontFamily = 'Fira Code';
    front.style.fontSize = '18px';
    front.style.color = 'var(--muted)';
    const back = el('div','back');
    back.innerHTML = `<div style="font-size:13px">${c.org}</div><div style="font-family:'Fira Code';margin-top:6px">${c.code} • ${c.year}</div>`;
    flip.appendChild(front);
    flip.appendChild(back);
    box.appendChild(flip);
    strip.appendChild(box);
  }

  let isDown = false, startX, scrollLeft;
  strip.addEventListener('mousedown', (e)=>{
    isDown = true;
    startX = e.pageX - strip.offsetLeft;
    scrollLeft = strip.scrollLeft;
    strip.style.cursor = 'grabbing';
  });
  strip.addEventListener('mouseleave', ()=>{ isDown = false; strip.style.cursor = ''; });
  strip.addEventListener('mouseup', ()=>{ isDown = false; strip.style.cursor = ''; });
  strip.addEventListener('mousemove', (e)=>{
    if(!isDown) return;
    e.preventDefault();
    const x = e.pageX - strip.offsetLeft;
    const walk = (x - startX) * 1.6;
    strip.scrollLeft = scrollLeft - walk;
  });

  strip.addEventListener('touchstart', e=>{
    startX = e.touches[0].pageX - strip.offsetLeft;
    scrollLeft = strip.scrollLeft;
  }, {passive:true});
  strip.addEventListener('touchmove', e=>{
    const x = e.touches[0].pageX - strip.offsetLeft;
    const walk = (x - startX) * 1.2;
    strip.scrollLeft = scrollLeft - walk;
  }, {passive:true});
})();

/* ------------------------- Cases ------------------------- */
(function(){
  const cases = [
    {title:'Enterprise Wi-Fi Compromise', desc:'Cracked WPA3-Enterprise via RADIUS misconfig. Gained domain foothold.'},
    {title:'Mobile Banking App RE', desc:'Bypassed root/jailbreak detection. Intercepted encrypted API traffic.'},
    {title:'Internal Network Pivoting', desc:'Used SOCKS5 + Chisel to pivot from DMZ to internal AD servers.'}
  ];
  const grid = $('#cases-grid');
  for(let c of cases){
    const card = el('div','case');
    const stamp = el('div','classified');
    stamp.textContent = 'CLASSIFIED';
    const content = el('div');
    content.className = 'content';
    const t = el('h4');
    t.style.fontFamily = 'Fira Code';
    t.textContent = c.title;
    const p = el('p');
    p.className = 'muted';
    p.textContent = c.desc;
    const btn = el('button','btn scanline');
    btn.textContent = 'DECRYPT REPORT';
    btn.style.marginTop = '12px';
    btn.addEventListener('click', ()=> alert('Decrypting — opening summary...'));

    card.appendChild(stamp);
    content.appendChild(t);
    content.appendChild(p);
    content.appendChild(btn);
    card.appendChild(content);
    grid.appendChild(card);
  }
})();

/* ------------------------- Projects with Modal ------------------------- */
let currentProject = null;
const modal = $('#project-modal');
const modalTitle = $('#modal-title');
const modalDesc = $('#modal-desc');
const modalTags = $('#modal-tags');
const modalLive = $('#modal-live');
const modalCode = $('#modal-code');
const modalClose = $('.modal-close');

// 🔥 YOUR REAL PROJECTS — CUSTOMIZED FOR NETWORKING & SECURITY
const projects = [
  {
    title: 'Company Network Pentest Toolkit',
    desc: 'Comprehensive toolkit for internal network reconnaissance, vulnerability scanning, and lateral movement simulations in corporate environments.',
    tags: ['Networking', 'Python', 'Nmap' , 'CCNA'],
    liveUrl: '#',
    codeUrl: 'https://github.com/shambhu332/Company-Network-.git'
  },
  {
    title: 'Phishing Website Detector',
    desc: 'Machine learning-based tool that scans and flags phishing URLs by analyzing DOM structure, SSL certs, and WHOIS metadata.',
    tags: ['Python', 'ML', 'Security', 'Phishing'],
    liveUrl: '#',
    codeUrl: 'https://github.com/shambhu332/Phishing_Website_Detector.git'
  },
  {
    title: 'Steganography Tool',
    desc: 'Hide data in audio, video, image',
    tags: ['Python', 'Steganography', 'Networking', 'Exfiltration'],
    liveUrl: '#',
    codeUrl: 'https://github.com/shambhu332/Stenography-tool.git'
  },
  {
    title: 'Port Scanner Pro',
    desc: 'Multi-threaded TCP/UDP port scanner with service detection, banner grabbing, and open port of the websites for penetration testers.',
    tags: ['Python', 'Networking', 'Scanning', 'Recon'],
    liveUrl: '#',
    codeUrl: 'https://github.com/shambhu332/port-scanner.git'
  },
  {
    title: 'Hospital Network Management System',
    desc: 'CCNA-level network design for hospitals with VLAN segmentation, ACLs, QoS for medical devices, and secure guest Wi-Fi.',
    tags: ['Networking', 'CCNA', 'Cisco', 'Healthcare'],
    liveUrl: '#',
    codeUrl: 'https://github.com/shambhu332/Hospital-Managment-System-CCNA.git'
  },
  {
    title: 'Hotel Network Management System',
    desc: 'CCNA-level network design for Hotel Network with VLAN, ACL, DHCP, NAT/PAT',
    tags: ['Networking', 'Wi-Fi', 'VLAN', 'Security'],
    liveUrl: '#',
    codeUrl: 'https://github.com/shambhu332/Hotel-Management-System.git'
  }
];

(function(){
  const grid = $('#projects-grid');
  for(let p of projects){
    const card = el('div','project');
    const t = el('h4');
    t.textContent = p.title;
    const d = el('p');
    d.className = 'desc';
    d.textContent = p.desc;
    const tagsDiv = el('div','tags');
    for(let tag of p.tags){
      const tagEl = el('div','tag');
      tagEl.textContent = tag;
      tagsDiv.appendChild(tagEl);
    }

    card.appendChild(t);
    card.appendChild(d);
    card.appendChild(tagsDiv);
    grid.appendChild(card);

    card.addEventListener('click', () => {
      openProjectModal(p);
    });
  }
})();

function openProjectModal(project) {
  currentProject = project;
  modalTitle.textContent = project.title;
  modalDesc.textContent = project.desc;
  modalTags.innerHTML = '';
  for(let tag of project.tags){
    const tagEl = el('div','tag');
    tagEl.textContent = tag;
    modalTags.appendChild(tagEl);
  }

  modalLive.style.display = project.liveUrl !== '#' ? 'block' : 'none';
  modalLive.onclick = () => {
    if(project.liveUrl) window.open(project.liveUrl, '_blank');
    closeModal();
  };

  modalCode.onclick = () => {
    if(project.codeUrl) window.open(project.codeUrl, '_blank');
    closeModal();
  };

  modal.style.display = 'block';
}

modalClose.onclick = closeModal;
window.onclick = (e) => {
  if(e.target === modal) closeModal();
};

function closeModal() {
  modal.style.display = 'none';
  currentProject = null;
}

/* ------------------------- GitHub Repos Auto-load ------------------------- */
(function(){
  const username = 'yourgithub'; // 🔁 REPLACE WITH YOUR GITHUB USERNAME
  const grid = $('#github-grid');
  const status = $('#github-status');

  async function loadRepos() {
    try {
      const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
      if(!res.ok) throw new Error('Failed to fetch');
      const repos = await res.json();

      grid.innerHTML = '';
      repos.slice(0,6).forEach(repo => {
        const card = el('div','github-repo');
        const t = el('h4');
        t.textContent = repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const d = el('p');
        d.className = 'desc';
        d.textContent = repo.description || 'Networking or security related project.';
        const tagsDiv = el('div','tags');
        
        if(repo.language) {
          const langTag = el('div','tag');
          langTag.textContent = repo.language;
          tagsDiv.appendChild(langTag);
        }

        const starTag = el('div','tag');
        starTag.textContent = `★ ${repo.stargazers_count || 0}`;
        tagsDiv.appendChild(starTag);

        const date = new Date(repo.updated_at);
        const dateTag = el('div','tag');
        dateTag.textContent = `📅 ${date.toLocaleDateString()}`;
        tagsDiv.appendChild(dateTag);

        card.appendChild(t);
        card.appendChild(d);
        card.appendChild(tagsDiv);
        grid.appendChild(card);

        card.addEventListener('click', () => {
          window.open(repo.html_url, '_blank');
        });
      });

      status.textContent = `Loaded ${repos.length} repos`;
    } catch(err) {
      console.error(err);
      status.textContent = 'Failed to load repos';
      status.style.color = 'var(--red)';
    }
  }

  loadRepos();
})();

/* ------------------------- Contact send mock ------------------------- */
(function(){
  $('#send-msg').addEventListener('click',()=>{
    const n = $('#input-name').value.trim(),
          e = $('#input-email').value.trim(),
          m = $('#input-msg').value.trim();
    if(!n || !e || !m){
      alert('Please fill name, contact and message');
      return;
    }
    const btn = $('#send-msg');
    btn.textContent = 'ENCRYPTING...';
    setTimeout(()=>{
      btn.textContent = 'SENT (ENCRYPTED)';
      btn.style.background = 'linear-gradient(90deg, rgba(57,255,20,0.06), rgba(57,255,20,0.02))';
    }, 1200);
  });

  $('#open-portfolio').addEventListener('click',()=>{
    window.scrollTo({ top: document.querySelector('#skills').offsetTop - 20, behavior: 'smooth' });
  });

  $('#secure-contact').addEventListener('click',()=>{
    document.querySelector('#input-msg').focus();
    window.scrollTo({ top: document.querySelector('#contact').offsetTop - 20, behavior: 'smooth' });
  });
})();

/* ------------------------- Smooth scroll ------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if(targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 20,
        behavior: 'smooth'
      });
    }
  });
});

/* ------------------------- Housekeeping ------------------------- */
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('last-audit').textContent = (new Date(Date.now() - 1000*60*60*24*38)).toLocaleDateString();

document.addEventListener('keydown', e=>{
  if(e.key === 'Tab') document.body.classList.add('user-tab');
});
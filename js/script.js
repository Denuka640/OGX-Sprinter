// Shared app logic for Campaign Sprinter
// Data model: members stored in localStorage under 'ogx_members'

const STORAGE_KEY = 'ogx_members';
const POINTS_PER_POST = 5;

let members = [];
let currentMemberId = null;

function loadMembers(){ members = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
function saveMembers(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(members)); }

function init(){
  loadMembers();
  renderAll();
}

window.addEventListener('DOMContentLoaded', init);

/* Modal + Auth */
function openLoginModal(){ document.getElementById('authModal').style.display = 'flex'; }
function closeLoginModal(){ document.getElementById('authModal').style.display = 'none'; }

function switchAuthTab(tab){
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  if(tab === 'signin'){ loginForm.style.display='block'; signupForm.style.display='none'; }
  else { loginForm.style.display='none'; signupForm.style.display='block'; }
}

function handleSignUp(){
  const name = document.getElementById('signUpName').value.trim();
  const email = document.getElementById('signUpEmail').value.trim();
  const password = document.getElementById('signUpPassword').value;
  const dept = document.getElementById('signUpDept').value;
  if(!name||!email||!password||!dept) return alert('Fill all fields');
  if(members.find(m=>m.email===email)) return alert('Email already registered');
  const m = { id: Date.now(), name, email, password, dept, score:0, posts:0, avatar:null };
  members.push(m); saveMembers();
  currentMemberId = m.id; localStorage.setItem('ogx_current_member', String(m.id));
  showProfileView(m.id); closeLoginModal(); renderAll();
}

function handleLogin(){
  const email = document.getElementById('loginEmail').value.trim();
  const pwd = document.getElementById('loginPassword') ? document.getElementById('loginPassword').value : null;
  const m = members.find(x=>x.email===email && x.password===pwd);
  if(!m) return alert('Credentials not found');
  currentMemberId = m.id; localStorage.setItem('ogx_current_member', String(m.id));
  showProfileView(m.id); closeLoginModal(); renderAll();
}

function handleLogout(){ currentMemberId = null; localStorage.removeItem('ogx_current_member'); document.getElementById('profileDashboard') && (document.getElementById('profileDashboard').style.display='none'); document.getElementById('loginBtn') && (document.getElementById('loginBtn').textContent='Login / Sign Up'); }

function uploadProfilePhoto(e){
  const f = e.target.files && e.target.files[0]; if(!f || !currentMemberId) return;
  const r = new FileReader(); r.onload = function(ev){ const m=members.find(x=>x.id===currentMemberId); if(m){ m.avatar = ev.target.result; saveMembers(); renderAll(); document.getElementById('profileImage') && (document.getElementById('profileImage').src = m.avatar); } }; r.readAsDataURL(f);
}

function showProfileView(memberId){
  const m = members.find(x=>x.id===memberId); if(!m) return;
  currentMemberId = m.id; localStorage.setItem('ogx_current_member', String(m.id));
  const dash = document.getElementById('profileDashboard'); if(dash) dash.style.display='block';
  document.getElementById('profileName') && (document.getElementById('profileName').textContent = m.name);
  const deptLabel = document.getElementById('profileDeptLabel'); if(deptLabel) deptLabel.innerHTML = `<span class="dept-badge ${m.dept==='oGV'?'ogv':'ogt'}">${m.dept}</span>`;
  document.getElementById('postCount') && (document.getElementById('postCount').value = m.posts || 0);
  document.getElementById('profileImage') && (document.getElementById('profileImage').src = m.avatar || 'assets/avatar-placeholder.png');
  document.getElementById('loginBtn') && (document.getElementById('loginBtn').textContent = 'My Profile');
}

function updatePostCount(){ if(!currentMemberId) return alert('Sign in first'); const v = Number(document.getElementById('postCount').value || 0); const m = members.find(x=>x.id===currentMemberId); if(!m) return; m.posts = v; m.score = (m.posts||0)*POINTS_PER_POST; saveMembers(); renderAll(); alert('Saved'); }

/* Submit Post Page */
function handleSubmitPost(){
  if(!currentMemberId) return alert('Please sign in to submit a post');
  const title = document.getElementById('postTitle').value.trim();
  const date = document.getElementById('postDate').value;
  const platform = document.getElementById('postPlatform').value;
  if(!title||!date||!platform) return alert('Fill all fields');
  // increment posts and points
  const m = members.find(x=>x.id===currentMemberId); if(!m) return alert('Member not found');
  m.posts = (m.posts||0) + 1; m.score = (m.score||0) + POINTS_PER_POST; saveMembers(); renderAll(); alert('Post submitted. +5 points');
  document.getElementById('submitPostForm') && document.getElementById('submitPostForm').reset();
}

/* Rendering */
function renderAll(){ renderIndividualLeaderboard(); renderDeptPages(); renderChart(); }

function renderIndividualLeaderboard(){
  // dashboard podium and table
  const podium = document.getElementById('individualPodium'); const body = document.getElementById('individualBody'); if(!podium||!body) return;
  const sorted = members.slice().sort((a,b)=> (b.score||0)-(a.score||0));
  podium.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const m = sorted[i];
    const pod = document.createElement('div');
    pod.className = 'individual-pod';
    if (m) {
      pod.innerHTML = `
        <div class="rank">${i+1}</div>
        <img src="${m.avatar||'assets/avatar-placeholder.png'}" class="pod-avatar"/>
        <div class="name">${m.name}</div>
        <div class="score">${m.score||0}</div>
        <div class="pod-meta"><span class="dept-badge ${m.dept==='oGV'?'ogv':'ogt'}">${m.dept}</span></div>
      `;
    } else {
      pod.innerHTML = `<div class="rank">${i+1}</div><div class="name">—</div><div class="score">0</div>`;
    }
    podium.appendChild(pod);
  }

  body.innerHTML = '';
  sorted.forEach((m, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="tbl-rank">${idx+1}</td>
      <td class="tbl-member"><img src="${m.avatar||'assets/avatar-placeholder.png'}" class="tbl-avatar"/> ${m.name}</td>
      <td class="tbl-dept"><span class="dept-badge ${m.dept==='oGV'?'ogv':'ogt'}">${m.dept}</span></td>
      <td class="tbl-posts">${m.posts||0}</td>
      <td class="tbl-points">${m.score||0}</td>
    `;
    body.appendChild(tr);
  });

  // update stats
  document.getElementById('totalMembers') && (document.getElementById('totalMembers').textContent = members.length);
  document.getElementById('ogtCount') && (document.getElementById('ogtCount').textContent = members.filter(x=>x.dept==='oGT').length);
  document.getElementById('ogvCount') && (document.getElementById('ogvCount').textContent = members.filter(x=>x.dept==='oGV').length);
  const leader = sorted[0]; document.getElementById('leadingMember') && (document.getElementById('leadingMember').textContent = leader ? `${leader.name} (${leader.score||0})` : '—');
}

function renderDeptPages(){
  // ogt
  const ogtPodium = document.getElementById('ogtPodium'); const ogtBody = document.getElementById('ogtBody'); if(ogtPodium && ogtBody){ const list = members.filter(x=>x.dept==='oGT').sort((a,b)=> (b.score||0)-(a.score||0)); ogtPodium.innerHTML=''; for(let i=0;i<3;i++){ const m=list[i]; const pod=document.createElement('div'); pod.className='individual-pod'; pod.innerHTML = m ? `<div style="font-size:18px;">${i+1}</div><div class="name">${m.name}</div><div class="score">${m.score||0}</div>` : `<div style="font-size:18px;">${i+1}</div><div class="name">—</div>`; ogtPodium.appendChild(pod);} ogtBody.innerHTML=''; list.forEach((m,idx)=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td style="padding:8px">${idx+1}</td><td style="padding:8px">${m.name}</td><td style="padding:8px">${m.posts||0}</td><td style="padding:8px">${m.score||0}</td>`; ogtBody.appendChild(tr); }); }

  // ogv
  const ogvPodium = document.getElementById('ogvPodium'); const ogvBody = document.getElementById('ogvBody'); if(ogvPodium && ogvBody){ const list = members.filter(x=>x.dept==='oGV').sort((a,b)=> (b.score||0)-(a.score||0)); ogvPodium.innerHTML=''; for(let i=0;i<3;i++){ const m=list[i]; const pod=document.createElement('div'); pod.className='individual-pod'; pod.innerHTML = m ? `<div style="font-size:18px;">${i+1}</div><div class="name">${m.name}</div><div class="score">${m.score||0}</div>` : `<div style="font-size:18px;">${i+1}</div><div class="name">—</div>`; ogvPodium.appendChild(pod);} ogvBody.innerHTML=''; list.forEach((m,idx)=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td style="padding:8px">${idx+1}</td><td style="padding:8px">${m.name}</td><td style="padding:8px">${m.posts||0}</td><td style="padding:8px">${m.score||0}</td>`; ogvBody.appendChild(tr); }); }
}

/* Chart rendering using Chart.js */
let chartInstance = null;
function renderChart(){
  const ctx = document.getElementById('pointsChart'); if(!ctx) return;
  const sorted = members.slice().sort((a,b)=> (b.score||0)-(a.score||0)).slice(0,8);
  const labels = sorted.map(m=>m.name);
  const data = sorted.map(m=>m.score||0);
  if(chartInstance) { chartInstance.data.labels = labels; chartInstance.data.datasets[0].data = data; chartInstance.update(); return; }
  chartInstance = new Chart(ctx, { type: 'bar', data: { labels, datasets:[{ label:'Points', data, backgroundColor: labels.map((_,i)=> i===0?'#ffd700': 'rgba(115,146,214,0.6)') }] }, options: { indexAxis:'y', responsive:true, scales:{ x:{ beginAtZero:true } } } });
}

/* Expose handlers to global */
window.openLoginModal = openLoginModal; window.closeLoginModal = closeLoginModal; window.switchAuthTab = switchAuthTab;
window.handleSignUp = handleSignUp; window.handleLogin = handleLogin; window.handleLogout = handleLogout;
window.uploadProfilePhoto = uploadProfilePhoto; window.showProfileView = showProfileView; window.updatePostCount = updatePostCount;
window.handleSubmitPost = handleSubmitPost;
// Individual-only front-end script
window.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    const splash = document.getElementById('splashOverlay');
    if (splash) setTimeout(() => splash.classList.add('hide-splash'), 1800);

    loadMembers();
    renderAll();

    // restore session if present
    const storedId = localStorage.getItem('ogx_current_member');
    if (storedId) {
        const m = members.find(x => String(x.id) === storedId);
        if (m) showProfileView(m.id);
    }
}

// Modal control
function openLoginModal() { document.getElementById('authModal').style.display = 'flex'; }
function closeLoginModal() { document.getElementById('authModal').style.display = 'none'; }

// Auth tab switch
function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const tabSignIn = document.getElementById('tabSignIn');
    const tabSignUp = document.getElementById('tabSignUp');
    if (tab === 'signin') {
        loginForm.style.display = 'block'; signupForm.style.display = 'none';
        tabSignIn.style.color = '#7392d6'; tabSignIn.style.borderBottom = '2px solid #7392d6';
        tabSignUp.style.color = '#a0aec0'; tabSignUp.style.borderBottom = 'none';
    } else {
        loginForm.style.display = 'none'; signupForm.style.display = 'block';
        tabSignUp.style.color = '#7392d6'; tabSignUp.style.borderBottom = '2px solid #7392d6';
        tabSignIn.style.color = '#a0aec0'; tabSignIn.style.borderBottom = 'none';
    }
}

// Members storage
let members = [];
function loadMembers() { members = JSON.parse(localStorage.getItem('ogx_members') || '[]'); }
function saveMembers() { localStorage.setItem('ogx_members', JSON.stringify(members)); }

// Sign Up: store name, dept, email
function handleSignUp() {
    const name = document.getElementById('signUpName').value.trim();
    const dept = document.getElementById('signUpDept').value;
    const email = document.getElementById('signUpEmail').value.trim();
    if (!name || !dept || !email) { alert('Please fill in all fields.'); return; }

    // prevent duplicate emails
    if (members.find(m => m.email === email)) { alert('Email already registered.'); return; }

    const member = { id: Date.now(), name, dept, email, score: 0, avatar: null };
    members.push(member);
    saveMembers();
    localStorage.setItem('ogx_current_member', String(member.id));
    showProfileView(member.id);
    renderAll();
    closeLoginModal();
}

// Sign In
function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    if (!email) { alert('Please enter your email.'); return; }
    const m = members.find(x => x.email === email);
    if (!m) { alert('No account found for that email. Please sign up.'); return; }
    localStorage.setItem('ogx_current_member', String(m.id));
    showProfileView(m.id);
    closeLoginModal();
}

// Show profile dashboard for memberId
let currentMemberId = null;
function showProfileView(memberId) {
    const m = members.find(x => x.id === memberId);
    if (!m) return;
    currentMemberId = m.id;
    localStorage.setItem('ogx_current_member', String(m.id));

    document.getElementById('authTabs').style.display = 'none';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('profileDashboard').style.display = 'block';
    document.getElementById('profileName').textContent = m.name;
    const deptLabel = document.getElementById('profileDeptLabel');
    deptLabel.innerHTML = `<span class="dept-badge ${m.dept==='oGV'?'ogv':'ogt'}">${m.dept}</span>`;
    document.getElementById('postCount').value = m.score || 0;
    if (m.avatar) document.getElementById('profileImage').src = m.avatar;
    document.getElementById('loginBtn').textContent = 'My Profile';
}

function handleLogout() {
    currentMemberId = null; localStorage.removeItem('ogx_current_member');
    document.getElementById('authTabs').style.display = 'flex';
    document.getElementById('profileDashboard').style.display = 'none';
    document.getElementById('loginBtn').textContent = 'Member Login';
}

// Upload avatar
function uploadProfilePhoto(event) {
    const file = event.target.files && event.target.files[0];
    if (!file || !currentMemberId) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = e.target.result;
        const m = members.find(x => x.id === currentMemberId);
        if (m) { m.avatar = data; saveMembers(); document.getElementById('profileImage').src = data; renderAll(); }
    };
    reader.readAsDataURL(file);
}

// Save posts/points (set value)
function updatePostCount() {
    const countEl = document.getElementById('postCount');
    const val = Number(countEl.value || 0);
    if (!Number.isFinite(val) || val < 0) { alert('Enter a valid non-negative number.'); return; }
    if (!currentMemberId) { alert('Please sign in first.'); return; }
    const m = members.find(x => x.id === currentMemberId);
    if (!m) return;
    m.score = val;
    saveMembers();
    renderAll();
    alert('Points saved.');
}

// Rendering
function renderAll() { renderIndividualLeaderboard(); updateStats(); }

function updateStats() {
    const totalMembers = members.length;
    const ogt = members.filter(m => m.dept === 'oGT').length;
    const ogv = members.filter(m => m.dept === 'oGV').length;
    document.getElementById('totalMembers').textContent = totalMembers;
    document.getElementById('ogtCount').textContent = `oGT ${ogt}`;
    document.getElementById('ogvCount').textContent = `oGV ${ogv}`;
    const leader = members.slice().sort((a,b)=> (b.score||0)-(a.score||0))[0];
    document.getElementById('leadingMember').textContent = leader ? `${leader.name} (${leader.score||0})` : '—';
}

function renderIndividualLeaderboard() {
    const body = document.getElementById('individualBody');
    const podium = document.getElementById('individualPodium');
    if (!body || !podium) return;
    const sorted = members.slice().sort((a,b)=> (b.score||0)-(a.score||0));

    // podium
    podium.innerHTML = '';
    for (let i=0;i<3;i++){
        const m = sorted[i];
        const pod = document.createElement('div');
        pod.className = 'individual-pod';
        if (m) {
            pod.innerHTML = `<div style="font-size:18px;">${i+1}</div><div class="name">${m.name}</div><div class="score">${m.score||0}</div><div style="margin-top:6px"><span class="dept-badge ${m.dept==='oGV'?'ogv':'ogt'}">${m.dept}</span></div>`;
        } else {
            pod.innerHTML = `<div style="font-size:18px;">${i+1}</div><div class="name">—</div><div class="score">0</div>`;
        }
        podium.appendChild(pod);
    }

    // table
    body.innerHTML = '';
    sorted.forEach((m, idx)=>{
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #1a2638';
        tr.innerHTML = `
            <td style="padding:12px 10px; font-weight: bold;">${idx+1}</td>
            <td style="padding:12px 10px;">${m.name} <span style="margin-left:8px;"> <span class="dept-badge ${m.dept==='oGV'?'ogv':'ogt'}">${m.dept}</span></span></td>
            <td style="padding:12px 10px;">${m.dept}</td>
            <td style="padding:12px 10px; font-weight:bold; color: var(--accent-blue);">${m.score||0}</td>
        `;
        body.appendChild(tr);
    });
}
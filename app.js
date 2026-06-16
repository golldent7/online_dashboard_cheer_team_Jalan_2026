const TEAMS = ["التضامن","الحصن","قهوان","الشباب","اتحاد حدراء","المنجرد","الغنيمية","الصقر","فلج المشايخ"];
const FIXTURES = [
  ["2026-06-11","21:00","قهوان","الصقر"],
  ["2026-06-12","18:00","الحصن","الغنيمية"],
  ["2026-06-12","21:30","التضامن","فلج المشايخ"],
  ["2026-06-13","19:30","الشباب","اتحاد حدراء"],
  ["2026-06-18","18:00","فلج المشايخ","الحصن"],
  ["2026-06-18","21:30","الشباب","التضامن"],
  ["2026-06-19","18:00","المنجرد","قهوان"],
  ["2026-06-19","21:30","الغنيمية","الصقر"],
  ["2026-06-20","19:30","الحصن","اتحاد حدراء"],
  ["2026-06-25","21:00","اتحاد حدراء","الصقر"],
  ["2026-06-26","18:00","التضامن","المنجرد"],
  ["2026-06-26","21:30","الشباب","قهوان"],
  ["2026-06-27","19:30","فلج المشايخ","الغنيمية"],
  ["2026-07-02","18:00","الغنيمية","المنجرد"],
  ["2026-07-02","21:30","الصقر","التضامن"],
  ["2026-07-03","18:00","اتحاد حدراء","فلج المشايخ"],
  ["2026-07-03","21:30","قهوان","الحصن"],
  ["2026-07-04","19:30","المنجرد","الشباب"]
].map((x,i)=>({id:i+1,date:x[0],time:x[1],home:x[2],away:x[3]}));

const KEY = "cheer_team_dashboard_v2";
let state = load();

function emptyMatch(f){return {...f, played:false, hg:null, ag:null, hy:0,hri:0,hrd:0, ay:0,ari:0,ard:0, penaltyWinner:"", stats:{home:{poss:null,shots:0,corners:0,fouls:0,saves:0},away:{poss:null,shots:0,corners:0,fouls:0,saves:0}}, scorers:[], assists:[], motm:"", youngPlayer:""};}
function load(){try{const raw=localStorage.getItem(KEY); if(raw){const parsed=JSON.parse(raw); return {matches:FIXTURES.map(f=>({...emptyMatch(f), ...(parsed.matches||[]).find(m=>m.id===f.id)}))};}}catch(e){} return {matches:FIXTURES.map(emptyMatch)};}
function save(){localStorage.setItem(KEY, JSON.stringify(state));}
function byId(id){return document.getElementById(id)}
function num(id){const v=byId(id).value; return v===""?null:Number(v)}
function splitPeople(text){return text.split(/\n+/).map(s=>s.trim()).filter(Boolean).map(line=>{let parts=line.split("-").map(x=>x.trim()).filter(Boolean); return {player:parts[0]||line, team:parts[1]||"-"};});}
function peopleText(list){return (list||[]).map(x=>`${x.player}${x.team&&x.team!=="-"?" - "+x.team:""}`).join("\n");}
function cardPts(y,ri,rd){return (y||0)+3*(ri||0)+4*(rd||0)}

function init(){
  const sel=byId("matchSelect");
  sel.innerHTML=state.matches.map(m=>`<option value="${m.id}">${m.id}. ${m.date} - ${m.home} × ${m.away}</option>`).join("");
  sel.addEventListener("change", fillForm);
  byId("matchForm").addEventListener("submit", submitMatch);
  byId("clearMatch").addEventListener("click", clearMatch);
  byId("exportJson").addEventListener("click", exportJson);
  byId("importJson").addEventListener("change", importJson);
  byId("printBtn").addEventListener("click", ()=>window.print());
  byId("resetBtn").addEventListener("click", ()=>{if(confirm("هل تريد استعادة البيانات الافتراضية؟")){localStorage.removeItem(KEY); state=load(); init(); render();}});
  fillForm(); render();
}

function currentMatch(){return state.matches.find(m=>m.id===Number(byId("matchSelect").value));}
function fillForm(){const m=currentMatch(); if(!m)return; byId("homeName").textContent=m.home; byId("awayName").textContent=m.away; byId("homeStatsTitle").textContent=`إحصاءات ${m.home}`; byId("awayStatsTitle").textContent=`إحصاءات ${m.away}`; byId("penaltyWinner").innerHTML=`<option value="">لا يوجد</option><option>${m.home}</option><option>${m.away}</option>`;
  [["homeGoals",m.hg],["awayGoals",m.ag],["homeY",m.hy],["homeRI",m.hri],["homeRD",m.hrd],["awayY",m.ay],["awayRI",m.ari],["awayRD",m.ard]].forEach(([id,v])=>byId(id).value=v??"");
  const hs=m.stats?.home||{}, as=m.stats?.away||{};
  [["homePoss",hs.poss],["homeShots",hs.shots],["homeCorners",hs.corners],["homeFouls",hs.fouls],["homeSaves",hs.saves],["awayPoss",as.poss],["awayShots",as.shots],["awayCorners",as.corners],["awayFouls",as.fouls],["awaySaves",as.saves]].forEach(([id,v])=>byId(id).value=v??"");
  byId("scorers").value=peopleText(m.scorers); byId("assists").value=peopleText(m.assists); byId("motm").value=m.motm||""; byId("youngPlayer").value=m.youngPlayer||""; byId("penaltyWinner").value=m.penaltyWinner||"";
}
function submitMatch(e){e.preventDefault(); const m=currentMatch(); Object.assign(m,{played:num("homeGoals")!==null&&num("awayGoals")!==null,hg:num("homeGoals"),ag:num("awayGoals"),hy:num("homeY")||0,hri:num("homeRI")||0,hrd:num("homeRD")||0,ay:num("awayY")||0,ari:num("awayRI")||0,ard:num("awayRD")||0,penaltyWinner:byId("penaltyWinner").value,stats:{home:{poss:num("homePoss"),shots:num("homeShots")||0,corners:num("homeCorners")||0,fouls:num("homeFouls")||0,saves:num("homeSaves")||0},away:{poss:num("awayPoss"),shots:num("awayShots")||0,corners:num("awayCorners")||0,fouls:num("awayFouls")||0,saves:num("awaySaves")||0}},scorers:splitPeople(byId("scorers").value),assists:splitPeople(byId("assists").value),motm:byId("motm").value.trim(),youngPlayer:byId("youngPlayer").value.trim()}); save(); render(); alert("تم حفظ بيانات المباراة");}
function clearMatch(){const id=currentMatch().id; const idx=state.matches.findIndex(m=>m.id===id); state.matches[idx]=emptyMatch(FIXTURES.find(f=>f.id===id)); save(); fillForm(); render();}

function baseRows(){return Object.fromEntries(TEAMS.map(t=>[t,{team:t,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0,fair:0,note:"", possSum:0, possN:0, shots:0,corners:0,fouls:0,saves:0}]));}
function calcRows(){const rows=baseRows(); state.matches.filter(m=>m.played).forEach(m=>{const h=rows[m.home], a=rows[m.away]; h.p++;a.p++; h.gf+=m.hg;h.ga+=m.ag; a.gf+=m.ag;a.ga+=m.hg; h.fair+=cardPts(m.hy,m.hri,m.hrd); a.fair+=cardPts(m.ay,m.ari,m.ard); if(m.hg>m.ag){h.w++;a.l++;h.pts+=3}else if(m.hg<m.ag){a.w++;h.l++;a.pts+=3}else{h.d++;a.d++;h.pts++;a.pts++} addStats(h,m.stats?.home); addStats(a,m.stats?.away);}); Object.values(rows).forEach(r=>r.gd=r.gf-r.ga); return Object.values(rows).sort(compareTeams);}
function addStats(r,s={}){if(s.poss!==null && s.poss!==undefined && s.poss!==""){r.possSum+=Number(s.poss);r.possN++;} r.shots+=Number(s.shots||0);r.corners+=Number(s.corners||0);r.fouls+=Number(s.fouls||0);r.saves+=Number(s.saves||0)}
function headToHead(a,b){let ptsA=0,ptsB=0,gfA=0,gfB=0; state.matches.filter(m=>m.played&&((m.home===a.team&&m.away===b.team)||(m.home===b.team&&m.away===a.team))).forEach(m=>{const ag=m.home===a.team?m.hg:m.ag, bg=m.home===a.team?m.ag:m.hg; gfA+=ag;gfB+=bg; if(ag>bg)ptsA+=3; else if(ag<bg)ptsB+=3; else {ptsA++;ptsB++;}}); return {ptsA,ptsB,gdA:gfA-gfB,gdB:gfB-gfA,gfA,gfB,played:gfA+gfB>=0};}
function compareTeams(a,b){if(b.pts!==a.pts)return b.pts-a.pts; const h=headToHead(a,b); if(h.ptsA!==h.ptsB)return h.ptsB-h.ptsA; if(h.gdA!==h.gdB)return h.gdB-h.gdA; if(h.gfA!==h.gfB)return h.gfB-h.gfA; if(b.gd!==a.gd)return b.gd-a.gd; if(b.gf!==a.gf)return b.gf-a.gf; if(a.fair!==b.fair)return a.fair-b.fair; a.note="قرعة عند استمرار التساوي"; b.note="قرعة عند استمرار التساوي"; return a.team.localeCompare(b.team,"ar");}

function render(){const rows=calcRows(); renderStandings(rows); renderCards(rows); renderFixtures(); renderPeople(); renderTeamStats(rows);}
function renderStandings(rows){byId("standingsTable").querySelector("tbody").innerHTML=rows.map((r,i)=>`<tr class="rank${i+1}"><td>${i+1}</td><td>${r.team}</td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf}</td><td>${r.ga}</td><td>${r.gd>0?"+":""}${r.gd}</td><td><b>${r.pts}</b></td><td>${r.fair}</td><td>${r.note||""}</td></tr>`).join("");}
function renderCards(rows){const played=state.matches.filter(m=>m.played); byId("playedCount").textContent=played.length; byId("goalsCount").textContent=played.reduce((s,m)=>s+m.hg+m.ag,0); byId("bestAttack").textContent=top(rows,"gf",true); byId("bestDefense").textContent=top(rows,"ga",false); byId("fairTeam").textContent=top(rows,"fair",false); byId("mostShots").textContent=top(rows,"shots",true);}
function top(rows,key,desc){const active=rows.filter(r=>r.p>0); if(!active.length)return "-"; active.sort((a,b)=>desc?b[key]-a[key]:a[key]-b[key]); return `${active[0].team} (${active[0][key]})`;}
function renderFixtures(){byId("fixtureList").innerHTML=state.matches.map(m=>`<div class="fixture ${m.played?"done":""}"><div class="date">${m.date}<br>${m.time}</div><div class="team">${m.home}<small>${m.played?`استحواذ ${m.stats?.home?.poss??"-"}% | تسديد ${m.stats?.home?.shots??0}`:"لم تلعب"}</small></div><div class="score">${m.played?`${m.hg} - ${m.ag}`:"-"}</div><div class="team">${m.away}<small>${m.played?`استحواذ ${m.stats?.away?.poss??"-"}% | تسديد ${m.stats?.away?.shots??0}`:""}</small></div></div>`).join("");}
function aggregate(listKey){const map={}; state.matches.filter(m=>m.played).flatMap(m=>m[listKey]||[]).forEach(x=>{const k=`${x.player}|${x.team}`; if(!map[k])map[k]={...x,count:0}; map[k].count++;}); return Object.values(map).sort((a,b)=>b.count-a.count||a.player.localeCompare(b.player,"ar"));}
function renderPeople(){const scorers=aggregate("scorers"), assists=aggregate("assists"); byId("scorersTable").querySelector("tbody").innerHTML=scorers.map((x,i)=>`<tr><td>${i+1}</td><td>${x.player}</td><td>${x.team}</td><td><b>${x.count}</b></td></tr>`).join("")||`<tr><td colspan="4">لا توجد بيانات</td></tr>`; byId("assistsTable").querySelector("tbody").innerHTML=assists.map((x,i)=>`<tr><td>${i+1}</td><td>${x.player}</td><td>${x.team}</td><td><b>${x.count}</b></td></tr>`).join("")||`<tr><td colspan="4">لا توجد بيانات</td></tr>`; byId("awardsTable").querySelector("tbody").innerHTML=state.matches.filter(m=>m.played&&(m.motm||m.youngPlayer)).map(m=>`<tr><td>${m.home} × ${m.away}</td><td>${m.motm||"-"}</td><td>${m.youngPlayer||"-"}</td></tr>`).join("")||`<tr><td colspan="3">لا توجد بيانات</td></tr>`;}
function renderTeamStats(rows){byId("teamStatsTable").querySelector("tbody").innerHTML=rows.map(r=>`<tr><td>${r.team}</td><td>${r.possN?Math.round(r.possSum/r.possN)+"%":"-"}</td><td>${r.shots}</td><td>${r.corners}</td><td>${r.fouls}</td><td>${r.saves}</td></tr>`).join("");}
function exportJson(){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="cheer-team-dashboard-backup.json"; a.click(); URL.revokeObjectURL(a.href);}
function importJson(e){const file=e.target.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{try{const imported=JSON.parse(reader.result); state={matches:FIXTURES.map(f=>({...emptyMatch(f), ...(imported.matches||[]).find(m=>m.id===f.id)}))}; save(); init(); render(); alert("تم الاستيراد بنجاح");}catch(err){alert("ملف غير صالح");}}; reader.readAsText(file);}
init();

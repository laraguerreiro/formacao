/**
 * Inglês na Restauração — registo dos exercícios
 * Cole este código em Extensões › Apps Script, na Google Sheet da formação.
 * Siga o LEIA-ME para instalar.
 */

// 1) MUDE AQUI a palavra-passe do painel da formadora.
const PALAVRA_PASSE = 'mude-esta-palavra-passe';

const TENTATIVAS_MAX = 2;
const N_PERGUNTAS = 20;

const FOLHA_FORMANDOS = 'Formandos';
const FOLHA_TENTATIVAS = 'Tentativas';
const FOLHA_ACESSOS = 'Acessos';

const CAB_TENTATIVAS = ['ID', 'Código', 'Nome', 'Tentativa', 'Início', 'Fim', 'Duração (min)', 'Estado',
  'Certas', 'Total', 'Nota (%)', 'Dispositivo'];

/** Corra esta função UMA vez para criar as folhas. */
function configurar() {
  const ss = SpreadsheetApp.getActive();
  criarFolha_(ss, FOLHA_FORMANDOS, ['Código', 'Nome']);
  const perguntas = [];
  for (let i = 1; i <= N_PERGUNTAS; i++) perguntas.push('P' + i);
  criarFolha_(ss, FOLHA_TENTATIVAS, CAB_TENTATIVAS.concat(perguntas));
  criarFolha_(ss, FOLHA_ACESSOS, ['Data e hora', 'Código', 'Nome', 'Evento', 'Tentativa', 'Dispositivo']);
}

function criarFolha_(ss, nome, cab) {
  let sh = ss.getSheetByName(nome);
  if (!sh) sh = ss.insertSheet(nome);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, cab.length).setValues([cab]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function doGet() {
  return json_({ ok: true, servico: 'Inglês na Restauração', estado: 'ativo' });
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'pedido_invalido' }); }
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    switch (d.action) {
      case 'login': return json_(entrar_(d));
      case 'start': return json_(comecar_(d));
      case 'submit': return json_(enviar_(d));
      case 'results': return json_(resultados_(d));
      default: return json_({ ok: false, error: 'acao_desconhecida' });
    }
  } catch (err) {
    return json_({ ok: false, error: 'erro_servidor', detalhe: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function norm_(c) { return String(c || '').trim().toUpperCase(); }
function folha_(n) { return SpreadsheetApp.getActive().getSheetByName(n); }

function formando_(code) {
  const v = folha_(FOLHA_FORMANDOS).getDataRange().getValues();
  for (let i = 1; i < v.length; i++) if (norm_(v[i][0]) === code && code) return { code: code, name: String(v[i][1]).trim() };
  return null;
}

function tentativasDe_(code) {
  const sh = folha_(FOLHA_TENTATIVAS);
  const v = sh.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < v.length; i++) {
    if (norm_(v[i][1]) === code) out.push({ row: i + 1, id: v[i][0], number: v[i][3], estado: v[i][7] });
  }
  return out;
}

function registar_(code, name, evento, tentativa, ua) {
  folha_(FOLHA_ACESSOS).appendRow([new Date(), code, name, evento, tentativa || '', String(ua || '').slice(0, 200)]);
}

function entrar_(d) {
  const code = norm_(d.code);
  const f = formando_(code);
  if (!f) { registar_(code, '', 'código desconhecido', '', d.ua); return { ok: false, error: 'codigo_desconhecido' }; }
  const t = tentativasDe_(code);
  const aberta = t.filter(x => x.estado === 'em curso')[0];
  registar_(code, f.name, 'entrada', '', d.ua);
  return { ok: true, name: f.name, used: t.length, open: aberta ? { attemptId: aberta.id, number: aberta.number } : null };
}

function comecar_(d) {
  const code = norm_(d.code);
  const f = formando_(code);
  if (!f) return { ok: false, error: 'codigo_desconhecido' };
  const t = tentativasDe_(code);
  const aberta = t.filter(x => x.estado === 'em curso')[0];
  if (aberta) {
    registar_(code, f.name, 'retoma', aberta.number, d.ua);
    return { ok: true, attemptId: aberta.id, number: aberta.number };
  }
  if (t.length >= TENTATIVAS_MAX) return { ok: false, error: 'sem_tentativas' };
  const number = t.length + 1;
  const id = Utilities.getUuid();
  folha_(FOLHA_TENTATIVAS).appendRow([id, code, f.name, number, new Date(), '', '', 'em curso', '', '', '', String(d.ua || '').slice(0, 200)]);
  registar_(code, f.name, 'início', number, d.ua);
  return { ok: true, attemptId: id, number: number };
}

function enviar_(d) {
  const code = norm_(d.code);
  const t = tentativasDe_(code).filter(x => x.id === d.attemptId)[0];
  if (!t) return { ok: false, error: 'tentativa_desconhecida' };
  if (t.estado === 'concluída') return { ok: true, repetido: true };
  const sh = folha_(FOLHA_TENTATIVAS);
  const res = Array.isArray(d.results) ? d.results.slice(0, N_PERGUNTAS) : [];
  const certas = res.filter(r => r && r.certa === true).length;
  const total = res.length || N_PERGUNTAS;
  const cel = res.map(r => (r.certa ? '✓ ' : '✗ ') + String(r.resposta || '').slice(0, 120) + ' (' + (Number(r.tempo) || 0) + 's)');
  sh.getRange(t.row, 6, 1, 6).setValues([[new Date(), Math.round((Number(d.duration) || 0) / 6) / 10, 'concluída', certas, total, Math.round(certas / total * 100)]]);
  if (cel.length) sh.getRange(t.row, CAB_TENTATIVAS.length + 1, 1, cel.length).setValues([cel]);
  const f = formando_(code);
  registar_(code, f ? f.name : '', 'conclusão (' + certas + '/' + total + ')', t.number, d.ua);
  return { ok: true, score: certas, total: total };
}

function resultados_(d) {
  if (String(d.password || '') !== PALAVRA_PASSE) return { ok: false, error: 'palavra_passe' };
  const iso = v => (v instanceof Date ? v.toISOString() : v);
  const fv = folha_(FOLHA_FORMANDOS).getDataRange().getValues().slice(1)
    .filter(r => String(r[0]).trim()).map(r => ({ code: norm_(r[0]), name: String(r[1]).trim() }));
  const tv = folha_(FOLHA_TENTATIVAS).getDataRange().getValues().slice(1).map(r => ({
    code: norm_(r[1]), name: r[2], number: r[3], inicio: iso(r[4]), fim: iso(r[5]), duracao: r[6],
    estado: r[7], certas: r[8], total: r[9], nota: r[10],
    respostas: r.slice(CAB_TENTATIVAS.length, CAB_TENTATIVAS.length + N_PERGUNTAS).map(String)
  }));
  const av = folha_(FOLHA_ACESSOS).getDataRange().getValues().slice(1);
  const acessos = av.slice(-300).reverse().map(r => ({ quando: iso(r[0]), code: r[1], name: r[2], evento: r[3], tentativa: r[4] }));
  return { ok: true, formandos: fv, tentativas: tv, acessos: acessos, totalAcessos: av.length };
}

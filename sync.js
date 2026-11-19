// Dispatch sync: keeps your sources, notes, progress and settings the same on every device.
// Data is encrypted on the device with your sync passphrase (AES-GCM) and stored in a secret
// GitHub Gist in your own GitHub account. GitHub only ever sees the encrypted copy.
(function () {
  "use strict";
  const CONF_KEY = "dispatch.sync";
  const FILE = "dispatch-sync.json";
  const DESC = "Dispatch sync (encrypted)";
  const API = "https://api.github.com";
  // Settings that belong to one device and never travel.
  const LOCAL_ONLY = ["tab", "desk", "socialSrc", "nb", "watchSel", "watchMode", "pitchFilter", "lastRefresh"];

  const D = () => window.Dispatch;
  const conf = () => { try { return JSON.parse(localStorage.getItem(CONF_KEY) || "null"); } catch (e) { return null; } };
  const setConf = (c) => { try { c ? localStorage.setItem(CONF_KEY, JSON.stringify(c)) : localStorage.removeItem(CONF_KEY); } catch (e) { /* ignore */ } };
  let status = "", busy = false, pushTimer = null, keyCache = null;

  const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function keyFor(pass, salt) {
    const id = pass + "|" + b64(salt);
    if (keyCache && keyCache.id === id) return keyCache.key;
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 250000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    keyCache = { id, key };
    return key;
  }
  async function seal(obj, pass, salt) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await keyFor(pass, salt), new TextEncoder().encode(JSON.stringify(obj)));
    return { v: 1, app: "dispatch", updatedAt: obj.state.updatedAt || 0, salt: b64(salt), iv: b64(iv), data: b64(ct) };
  }
  async function open(box, pass) {
    try {
      const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(box.iv) }, await keyFor(pass, unb64(box.salt)), unb64(box.data));
      return JSON.parse(new TextDecoder().decode(pt));
    } catch (e) { throw new Error("Wrong sync passphrase. Use the same one on every device."); }
  }

  async function gh(path, opts, token) {
    const r = await fetch(API + path, Object.assign({}, opts, {
      headers: Object.assign({ Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" }, opts && opts.body ? { "Content-Type": "application/json" } : {}),
    }));
    if (r.status === 401) throw new Error("GitHub didn't accept that token. Check it and try again.");
    if (r.status === 403 || r.status === 404) throw new Error("That token can't use Gists. Make one with the gist permission.");
    if (!r.ok) throw new Error("GitHub said " + r.status + ". Try again in a minute.");
    return r.status === 204 ? null : r.json();
  }
  async function findGist(token) {
    for (let page = 1; page <= 5; page++) {
      const list = await gh("/gists?per_page=100&page=" + page, {}, token);
      const g = list.find((x) => x.description === DESC && x.files && x.files[FILE]);
      if (g) return g.id;
      if (list.length < 100) return null;
    }
    return null;
  }
  async function readGist(c) {
    const g = await gh("/gists/" + c.gist, {}, c.token);
    const f = g.files && g.files[FILE];
    if (!f) return null;
    const text = f.truncated ? await (await fetch(f.raw_url)).text() : f.content;
    return JSON.parse(text);
  }

  function shareable(state) {
    const out = JSON.parse(JSON.stringify(state));
    LOCAL_ONLY.forEach((k) => delete out[k]);
    return out;
  }
  // Newest copy wins, but progress that only ever grows is combined from both.
  function merge(local, remote) {
    const newer = (remote.updatedAt || 0) > (local.updatedAt || 0);
    const base = JSON.parse(JSON.stringify(newer ? remote : local));
    const other = newer ? local : remote;
    LOCAL_ONLY.forEach((k) => { if (k in local) base[k] = local[k]; });
    base.read = Object.assign({}, other.read || {}, base.read || {});
    base.days = Object.assign({}, other.days || {});
    Object.entries((newer ? remote : local).days || {}).forEach(([d, n]) => { base.days[d] = Math.max(n, base.days[d] || 0); });
    base.lessons = Object.assign({}, other.lessons || {}, base.lessons || {});
    base.practice = Object.assign({}, other.practice || {});
    Object.entries((newer ? remote : local).practice || {}).forEach(([id, p]) => {
      const o = base.practice[id];
      base.practice[id] = o ? Object.assign({}, p, { best: Math.max(p.best || 0, o.best || 0) }) : p;
    });
    base.plan = Object.assign({}, other.plan || {}, base.plan || {});
    if (base.plan.done || (other.plan && other.plan.done)) base.plan.done = Object.assign({}, (other.plan || {}).done || {}, (base.plan || {}).done || {});
    return base;
  }

  async function syncNow(manual, joining) {
    const c = conf();
    if (!c || busy) return;
    busy = true; paint("Syncing…");
    try {
      const local = D().state();
      const box = c.gist ? await readGist(c).catch((e) => { if (/can't use|didn't accept/.test(e.message)) throw e; return null; }) : null;
      let merged = local, remoteAi = null;
      if (box) {
        const remote = await open(box, c.pass);
        // A device joining existing sync takes the synced copy, keeping only progress it adds.
        merged = merge(joining ? Object.assign({}, local, { updatedAt: 0 }) : local, remote.state);
        remoteAi = remote.aiKey || null;
        if (JSON.stringify(shareable(merged)) !== JSON.stringify(shareable(local))) D().replaceState(merged);
        if (remoteAi && !localStorage.getItem("dispatch.aikey")) localStorage.setItem("dispatch.aikey", remoteAi);
      }
      const payload = { state: shareable(D().state()), aiKey: localStorage.getItem("dispatch.aikey") || remoteAi || "" };
      const salt = box ? unb64(box.salt) : crypto.getRandomValues(new Uint8Array(16));
      const sealed = await seal(payload, c.pass, salt);
      if (!box || sealed.updatedAt !== box.updatedAt || manual) {
        const body = JSON.stringify({ description: DESC, files: { [FILE]: { content: JSON.stringify(sealed) } } });
        if (c.gist && box) await gh("/gists/" + c.gist, { method: "PATCH", body }, c.token);
        else { const g = await gh("/gists", { method: "POST", body: JSON.stringify({ description: DESC, public: false, files: { [FILE]: { content: JSON.stringify(sealed) } } }) }, c.token); c.gist = g.id; }
      }
      c.last = Date.now(); setConf(c);
      paint("");
      if (manual) D().toast("Synced");
    } catch (e) {
      paint(e.message);
      if (manual) D().toast(e.message);
    } finally { busy = false; }
  }

  async function turnOn(token, pass) {
    if (!token || pass.length < 8) throw new Error("Paste a token and choose a passphrase of at least 8 characters.");
    const gist = await findGist(token);
    setConf({ token, pass, gist, last: 0 });
    keyCache = null;
    if (gist) {
      const box = await readGist(conf());
      await open(box, pass); // checks the passphrase before anything is merged
    }
    await syncNow(true, !!gist);
  }

  let box = null;
  function paint(msg) {
    if (msg !== undefined) status = msg;
    if (!box || !document.body.contains(box)) return;
    const c = conf(), esc = D().esc;
    if (c) {
      box.innerHTML = `<div class="card stack small">
        <div><b>Sync is on.</b> ${c.last ? "Last synced " + new Date(c.last).toLocaleString() + "." : ""} Sources, watches, notes, pitches, clips, lesson progress and settings stay the same on every device where you turn it on with the same token and passphrase.</div>
        ${status ? `<div style="color:${/Syncing/.test(status) ? "var(--muted)" : "var(--accent)"}">${esc(status)}</div>` : ""}
        <div class="row"><button class="btn sm" type="button" id="sync-now">Sync now</button><button class="btn sm ghost danger" type="button" id="sync-off">Turn off on this device</button></div></div>`;
      box.querySelector("#sync-now").onclick = () => syncNow(true);
      box.querySelector("#sync-off").onclick = () => { if (confirm("Stop syncing on this device? Your data stays here and in your GitHub account.")) { setConf(null); paint(""); } };
      return;
    }
    box.innerHTML = `<div class="card stack small">
      <div>Keep Dispatch the same on your phone and computer. Your data is locked with a passphrase you choose, then kept in a secret, encrypted file in your own GitHub account.</div>
      <div><b>1.</b> <a href="https://github.com/settings/tokens/new?scopes=gist&description=Dispatch%20sync" target="_blank" rel="noopener">Make a GitHub token</a>: set Expiration to "No expiration", leave only <b>gist</b> ticked, and tap Generate. Copy it.</div>
      <div><b>2.</b> Paste it here and pick a passphrase. Use the <b>same token and passphrase</b> on every device.</div>
      <label class="f">GitHub token<input class="field" id="sync-token" type="password" autocomplete="off" placeholder="ghp_…"></label>
      <label class="f">Sync passphrase<input class="field" id="sync-pass" type="password" autocomplete="new-password" placeholder="At least 8 characters"></label>
      <p class="muted" style="margin:0">If you forget the passphrase, the synced copy can't be opened. Your data on each device stays put.</p>
      ${status ? `<div style="color:var(--accent)">${esc(status)}</div>` : ""}
      <div class="row"><button class="btn primary sm" type="button" id="sync-on">Turn on sync</button></div></div>`;
    box.querySelector("#sync-on").onclick = async () => {
      const btn = box.querySelector("#sync-on"); btn.disabled = true; btn.textContent = "Connecting…";
      try { await turnOn(box.querySelector("#sync-token").value.trim(), box.querySelector("#sync-pass").value); }
      catch (e) { setConf(null); paint(e.message); return; }
      paint("");
    };
  }

  window.DispatchSync = {
    mount(el) { box = el; paint(); },
    start() {
      if (!conf()) return;
      syncNow(false);
      document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") syncNow(false); });
    },
    changed(now) {
      if (!conf()) return;
      clearTimeout(pushTimer);
      pushTimer = setTimeout(() => syncNow(false), now ? 0 : 4000);
    },
    _merge: merge,
  };
})();

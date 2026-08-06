/* Cross-device quiz progress sync via a private GitHub Gist.
   Each page owns one "section" (its STORAGE_KEY) inside a single shared gist file. */
(function (global) {
  "use strict";

  var TOKEN_KEY = "ccaf_gist_token";
  var GIST_ID_KEY = "ccaf_gist_id";
  var GIST_FILENAME = "ccaf-prep-progress.json";
  var GIST_DESCRIPTION = "CCA-F Prep — quiz progress sync (do not rename the file)";
  var API_BASE = "https://api.github.com";
  var PUSH_DEBOUNCE_MS = 2500;

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; }
  }
  function setToken(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(GIST_ID_KEY); }
    } catch (e) {}
  }
  function getGistId() {
    try { return localStorage.getItem(GIST_ID_KEY) || ""; } catch (e) { return ""; }
  }
  function setGistId(id) {
    try { localStorage.setItem(GIST_ID_KEY, id); } catch (e) {}
  }

  function ghFetch(path, options) {
    options = options || {};
    var headers = { "Authorization": "token " + getToken(), "Accept": "application/vnd.github+json" };
    for (var k in (options.headers || {})) headers[k] = options.headers[k];
    options.headers = headers;
    return fetch(API_BASE + path, options).then(function (res) {
      if (!res.ok) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          var err = new Error((body && body.message) || ("GitHub API error " + res.status));
          err.status = res.status;
          throw err;
        });
      }
      return res.json();
    });
  }

  function findOrCreateGist() {
    var cached = getGistId();
    if (cached) return Promise.resolve(cached);
    return ghFetch("/gists?per_page=100").then(function (gists) {
      var match = null;
      for (var i = 0; i < gists.length; i++) {
        if (gists[i].files && gists[i].files[GIST_FILENAME]) { match = gists[i]; break; }
      }
      if (match) { setGistId(match.id); return match.id; }
      var files = {};
      files[GIST_FILENAME] = { content: JSON.stringify({ version: 1, sections: {} }, null, 2) };
      return ghFetch("/gists", {
        method: "POST",
        body: JSON.stringify({ description: GIST_DESCRIPTION, public: false, files: files })
      }).then(function (created) { setGistId(created.id); return created.id; });
    });
  }

  function readGist() {
    return findOrCreateGist().then(function (id) {
      return ghFetch("/gists/" + id).then(function (gist) {
        var file = gist.files && gist.files[GIST_FILENAME];
        var content = { version: 1, sections: {} };
        if (file && file.content) {
          try { content = JSON.parse(file.content); } catch (e) {}
        }
        if (!content.sections) content.sections = {};
        return content;
      });
    });
  }

  function writeGist(content) {
    return findOrCreateGist().then(function (id) {
      var files = {};
      files[GIST_FILENAME] = { content: JSON.stringify(content, null, 2) };
      return ghFetch("/gists/" + id, { method: "PATCH", body: JSON.stringify({ files: files }) });
    });
  }

  function timeAgo(ts) {
    var s = Math.round((Date.now() - ts) / 1000);
    if (s < 5) return "just now";
    if (s < 60) return s + "s ago";
    var m = Math.round(s / 60);
    if (m < 60) return m + "m ago";
    var h = Math.round(m / 60);
    if (h < 24) return h + "h ago";
    return Math.round(h / 24) + "d ago";
  }

  function create(storageKey, opts) {
    var pushTimer = null;
    var statusEl = null;
    var status = getToken() ? "idle" : "disconnected";
    var lastError = "";
    var lastSyncedAt = 0;

    function setStatus(next, err) {
      status = next;
      lastError = err || "";
      renderStatus();
    }

    function renderStatus() {
      if (!statusEl) return;
      var label;
      if (status === "disconnected") label = "Not connected — progress stays on this device only.";
      else if (status === "syncing") label = "Syncing…";
      else if (status === "error") label = "Sync error: " + lastError;
      else label = lastSyncedAt ? ("Synced across devices. Last synced " + timeAgo(lastSyncedAt) + ".") : "Connected. Waiting for first sync.";
      statusEl.textContent = label;
    }

    function pull() {
      if (!getToken()) return Promise.resolve(null);
      setStatus("syncing");
      return readGist().then(function (content) {
        var section = content.sections[storageKey];
        setStatus("idle");
        return section || null;
      }).catch(function (e) {
        setStatus("error", e.message);
        return null;
      });
    }

    function push() {
      if (!getToken()) return Promise.resolve();
      setStatus("syncing");
      return readGist().then(function (content) {
        content.sections[storageKey] = { state: opts.getState(), updatedAt: opts.getUpdatedAt() || Date.now() };
        return writeGist(content);
      }).then(function () {
        lastSyncedAt = Date.now();
        setStatus("idle");
      }).catch(function (e) {
        setStatus("error", e.message);
      });
    }

    function schedulePush() {
      if (!getToken()) return;
      if (pushTimer) clearTimeout(pushTimer);
      pushTimer = setTimeout(push, PUSH_DEBOUNCE_MS);
    }

    function syncOnLoad() {
      if (!getToken()) { setStatus("disconnected"); return Promise.resolve(null); }
      return pull().then(function (section) {
        if (section && section.updatedAt > (opts.getUpdatedAt() || 0)) {
          opts.setState(section.state, section.updatedAt);
          lastSyncedAt = Date.now();
          setStatus("idle");
        } else {
          push();
        }
        return section;
      });
    }

    function connect(token) {
      setToken(token.trim());
      status = "idle";
      return syncOnLoad();
    }

    function disconnect() {
      setToken("");
      setStatus("disconnected");
    }

    function mountUI(container) {
      container.innerHTML =
        '<div class="row-between"><strong>Sync across devices</strong></div>' +
        '<div class="small sys" id="' + storageKey + '_syncStatus" style="margin:6px 0 10px;"></div>' +
        '<div id="' + storageKey + '_syncForm"></div>';
      statusEl = container.querySelector("#" + storageKey + "_syncStatus");
      renderConnectForm();
      renderStatus();

      function renderConnectForm() {
        var formEl = container.querySelector("#" + storageKey + "_syncForm");
        if (getToken()) {
          formEl.innerHTML =
            '<div class="controls">' +
            '<button class="ghost" type="button" data-action="sync-now">Sync now</button>' +
            '<button class="ghost" type="button" data-action="disconnect">Disconnect this device</button>' +
            '</div>';
          formEl.querySelector('[data-action="sync-now"]').addEventListener("click", function () { syncOnLoad(); });
          formEl.querySelector('[data-action="disconnect"]').addEventListener("click", function () {
            if (confirm("Stop syncing this device? Your progress stays saved here and in the cloud gist — this only removes the connection on this device.")) {
              disconnect();
              renderConnectForm();
            }
          });
        } else {
          formEl.innerHTML =
            '<div class="controls">' +
            '<input type="password" id="' + storageKey + '_tokenInput" placeholder="GitHub token (gist scope)" autocomplete="off" style="flex:1; min-width:180px; font:400 13px/1.3 system-ui, sans-serif; padding:8px 13px; border-radius:3px; border:1px solid var(--line, #d8d8dd); background:var(--white, #fff); color:var(--ink, #1f1f23);">' +
            '<button class="primary" type="button" data-action="connect">Connect</button>' +
            '</div>' +
            '<div class="small sys" style="margin-top:6px;">Stores progress in a private GitHub Gist. ' +
            '<a href="https://github.com/settings/tokens/new?description=CCA-F%20Prep%20sync&scopes=gist" target="_blank" rel="noopener">Create a token with the "gist" scope →</a> ' +
            'then paste it here. Do this once per device — after that, progress syncs automatically.</div>';
          formEl.querySelector('[data-action="connect"]').addEventListener("click", function () {
            var input = container.querySelector("#" + storageKey + "_tokenInput");
            var token = input.value;
            if (!token) return;
            connect(token).then(function () { renderConnectForm(); });
          });
        }
      }
    }

    return { syncOnLoad: syncOnLoad, schedulePush: schedulePush, mountUI: mountUI };
  }

  global.GistSync = { create: create };
})(window);

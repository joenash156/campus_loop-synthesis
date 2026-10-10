(() => {
  const $ = (s, p = document) => p.querySelector(s),
    $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const seed = window.CAMPUSLOOP_SEED || { marketplace: [], lostFound: [] };
  const store = {
    get(k, f) {
      try {
        return JSON.parse(localStorage.getItem(k)) ?? f;
      } catch {
        return f;
      }
    },
    set(k, v) {
      localStorage.setItem(k, JSON.stringify(v));
    },
  };
  const market = () => [...seed.marketplace, ...store.get("campusloop-marketplace-custom", [])];
  const lost = () => [...seed.lostFound, ...store.get("campusloop-lostfound-custom", [])];
  const money = (v) => `GHS ${Number(v).toFixed(2)}`;
  const esc = (v = "") =>
    String(v)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  function toast(m) {
    let w = $(".toast-wrap");
    if (!w) {
      w = document.createElement("div");
      w.className = "toast-wrap";
      document.body.appendChild(w);
    }
    let e = document.createElement("div");
    e.className = "toast";
    e.textContent = m;
    w.appendChild(e);
    setTimeout(() => e.remove(), 2500);
  }
  function theme(t) {
    document.documentElement.dataset.theme = t;
    store.set("campusloop-theme", t);
    let i = $("#themeIcon");
    if (i) i.className = t === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }
  function initTheme() {
    theme(store.get("campusloop-theme", matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
    $("#themeToggle")?.addEventListener("click", () =>
      theme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"),
    );
  }
  function initNav() {
    let n = $("#mainNav"),
      b = $("#menuToggle");
    b?.addEventListener("click", () => {
      n.classList.toggle("open");
      b.setAttribute("aria-expanded", n.classList.contains("open"));
    });
    let c = location.pathname.split("/").pop() || "index.html";
    $$("#mainNav a").forEach((a) => {
      if (a.getAttribute("href") === c) a.classList.add("active");
      a.addEventListener("click", () => n?.classList.remove("open"));
    });
  }
  function reveal() {
    let o = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            o.unobserve(e.target);
          }
        }),
      { threshold: 0.1 },
    );
    $$(".fade-up").forEach((x) => o.observe(x));
  }
  const saved = () => store.get("campusloop-saved", []);
  function toggleSave(id) {
    let s = saved(),
      i = s.indexOf(id);
    if (i >= 0) {
      s.splice(i, 1);
      toast("Removed from saved items.");
    } else {
      s.push(id);
      toast("Saved for later.");
    }
    store.set("campusloop-saved", s);
  }
  function marketCard(x) {
    let s = saved().includes(x.id);
    return `<article class="listing-card fade-up"><div class="listing-media"><img src="${esc(x.image)}" alt="${esc(x.title)}"><button class="card-save ${s ? "saved" : ""}" data-save="${esc(x.id)}" aria-label="Save item"><i class="${s ? "fa-solid" : "fa-regular"} fa-bookmark"></i></button></div><div class="listing-body"><div class="listing-topline"><span class="badge ${x.status === "Reserved" ? "warning" : "success"}">${esc(x.status)}</span><span class="listing-meta"><i class="fa-regular fa-clock"></i>${esc(x.posted)}</span></div><h3 class="listing-title">${esc(x.title)}</h3><div class="listing-meta"><i class="fa-solid fa-location-dot"></i>${esc(x.location)}</div><div class="listing-price">${money(x.price)}</div><a class="btn btn-secondary" style="width:100%;margin-top:14px" href="item.html?id=${encodeURIComponent(x.id)}">View details</a></div></article>`;
  }
  function lfCard(x) {
    let c = x.status === "Returned" ? "success" : x.type === "Lost" ? "danger" : "warning";
    return `<article class="listing-card fade-up"><div class="listing-media"><img src="${esc(x.image)}" alt="${esc(x.title)}"></div><div class="listing-body"><div class="listing-topline"><span class="badge ${c}">${esc(x.status)}</span><span class="listing-meta"><i class="fa-regular fa-calendar"></i>${esc(x.date)}</span></div><h3 class="listing-title">${esc(x.title)}</h3><div class="listing-meta"><i class="fa-solid fa-location-dot"></i>${esc(x.location)}</div>${x.sensitive ? `<p class="muted" style="font-size:.86rem;margin:12px 0 0"><i class="fa-solid fa-shield-halved"></i> Sensitive details protected</p>` : ""}<a class="btn btn-secondary" style="width:100%;margin-top:14px" href="found-item.html?id=${encodeURIComponent(x.id)}">View report</a></div></article>`;
  }
  function bindSaves(r) {
    $$("[data-save]").forEach((b) =>
      b.addEventListener("click", () => {
        toggleSave(b.dataset.save);
        r?.();
      }),
    );
  }
  function home() {
    let a = $("#featuredMarket");
    if (a) {
      a.innerHTML = market().slice(0, 4).map(marketCard).join("");
      bindSaves(home);
    }
    let b = $("#recentFound");
    if (b)
      b.innerHTML = lost()
        .filter((x) => x.status !== "Returned")
        .slice(0, 4)
        .map(lfCard)
        .join("");
  }
  function marketplace() {
    let g = $("#marketGrid");
    if (!g) return;
    let q = $("#marketSearch"),
      c = $("#marketCategory"),
      s = $("#marketStatus"),
      n = $("#resultCount");
    function r() {
      let z = market().filter(
        (x) =>
          [x.title, x.category, x.location, x.description]
            .join(" ")
            .toLowerCase()
            .includes(q.value.trim().toLowerCase()) &&
          (!c.value || x.category === c.value) &&
          (!s.value || x.status === s.value),
      );
      n.textContent = `${z.length} listing${z.length === 1 ? "" : "s"}`;
      g.innerHTML = z.length
        ? z.map(marketCard).join("")
        : `<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-box-open"></i><h3>No listings found</h3><p class="muted">Try changing your search or filters.</p></div>`;
      bindSaves(r);
      reveal();
    }
    [q, c, s].forEach((e) => e.addEventListener("input", r));
    r();
  }
  function lostFound() {
    let g = $("#lostFoundGrid");
    if (!g) return;
    let q = $("#lostSearch"),
      l = $("#lostLocation"),
      n = $("#lostCount"),
      type = "All",
      tabs = $$(".tab-btn[data-type]");
    function r() {
      let z = lost().filter(
        (x) =>
          [x.title, x.category, x.location, x.description]
            .join(" ")
            .toLowerCase()
            .includes(q.value.trim().toLowerCase()) &&
          (type === "All" || x.type === type || (type === "Returned" && x.status === "Returned")) &&
          (!l.value || x.location === l.value),
      );
      n.textContent = `${z.length} report${z.length === 1 ? "" : "s"}`;
      g.innerHTML = z.length
        ? z.map(lfCard).join("")
        : `<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-magnifying-glass"></i><h3>No matching reports</h3></div>`;
      reveal();
    }
    tabs.forEach((t) =>
      t.addEventListener("click", () => {
        tabs.forEach((x) => x.classList.remove("active"));
        t.classList.add("active");
        type = t.dataset.type;
        r();
      }),
    );
    q.addEventListener("input", r);
    l.addEventListener("change", r);
    r();
  }
  function savedPage() {
    let g = $("#savedGrid");
    if (!g) return;
    function r() {
      let z = market().filter((x) => saved().includes(x.id));
      g.innerHTML = z.length
        ? z.map(marketCard).join("")
        : `<div class="empty-state" style="grid-column:1/-1"><i class="fa-regular fa-bookmark"></i><h3>No saved items yet</h3><p class="muted">Save marketplace listings and they will appear here.</p><a class="btn btn-primary" href="marketplace.html">Browse marketplace</a></div>`;
      bindSaves(r);
      reveal();
    }
    r();
  }
  function sell() {
    let f = $("#sellForm");
    if (!f) return;
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!f.reportValidity()) return;
      let d = Object.fromEntries(new FormData(f).entries()),
        a = store.get("campusloop-marketplace-custom", []);
      a.unshift({
        id: `custom-m-${Date.now()}`,
        title: d.title,
        price: Number(d.price),
        category: d.category,
        condition: d.condition,
        location: d.location,
        seller: d.seller,
        phone: d.phone,
        image:
          d.image || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80",
        description: d.description,
        status: "Available",
        posted: "Just now",
      });
      store.set("campusloop-marketplace-custom", a);
      toast("Listing published successfully.");
      f.reset();
      setTimeout(() => (location.href = "marketplace.html"), 500);
    });
  }
  function report() {
    let f = $("#reportForm");
    if (!f) return;
    let s = $("#sensitive"),
      b = $("#sensitiveBlock");
    let sync = () => (b.hidden = !s.checked);
    s.addEventListener("change", sync);
    sync();
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!f.reportValidity()) return;
      let d = Object.fromEntries(new FormData(f).entries()),
        a = store.get("campusloop-lostfound-custom", []);
      a.unshift({
        id: `custom-lf-${Date.now()}`,
        type: d.type,
        title: d.title,
        category: d.category,
        location: d.location,
        date: d.date,
        finder: d.contactName,
        phone: d.phone,
        image:
          d.image || "https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&w=900&q=80",
        description: d.description,
        status: d.type,
        sensitive: s.checked,
        verification: s.checked ? d.verification : "",
      });
      store.set("campusloop-lostfound-custom", a);
      toast("Report submitted.");
      setTimeout(() => (location.href = "lost-found.html"), 500);
    });
  }
  function itemDetail() {
    let h = $("#itemDetail");
    if (!h) return;
    let x = market().find((y) => y.id === new URLSearchParams(location.search).get("id"));
    if (!x) {
      h.innerHTML = `<div class="empty-state"><h3>Listing not found</h3></div>`;
      return;
    }
    h.innerHTML = `<div class="detail-grid"><div class="detail-card detail-image"><img src="${esc(x.image)}" alt="${esc(x.title)}"></div><article class="detail-card detail-content"><span class="badge ${x.status === "Reserved" ? "warning" : "success"}">${esc(x.status)}</span><h1 style="font-size:clamp(2rem,4vw,3.2rem)">${esc(x.title)}</h1><div class="detail-price">${money(x.price)}</div><p class="muted">${esc(x.description)}</p><div class="detail-meta"><div><i class="fa-solid fa-tag"></i>${esc(x.category)} · ${esc(x.condition)}</div><div><i class="fa-solid fa-location-dot"></i>${esc(x.location)}</div><div><i class="fa-solid fa-user"></i>Seller: ${esc(x.seller)}</div></div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px"><a class="btn btn-primary" href="tel:${esc(x.phone.replaceAll(" ", ""))}"><i class="fa-solid fa-phone"></i> Contact seller</a><button class="btn btn-secondary" id="detailSave"><i class="fa-regular fa-bookmark"></i> Save item</button></div></article></div>`;
    $("#detailSave").addEventListener("click", () => toggleSave(x.id));
  }
  function foundDetail() {
    let h = $("#foundDetail");
    if (!h) return;
    let x = lost().find((y) => y.id === new URLSearchParams(location.search).get("id"));
    if (!x) {
      h.innerHTML = `<div class="empty-state"><h3>Report not found</h3></div>`;
      return;
    }
    h.innerHTML = `<div class="detail-grid"><div class="detail-card detail-image"><img src="${esc(x.image)}" alt="${esc(x.title)}"></div><article class="detail-card detail-content"><span class="badge ${x.status === "Returned" ? "success" : x.type === "Lost" ? "danger" : "warning"}">${esc(x.status)}</span><h1 style="font-size:clamp(2rem,4vw,3.2rem)">${esc(x.title)}</h1><p class="muted">${esc(x.description)}</p>${x.sensitive ? `<div class="callout"><strong><i class="fa-solid fa-shield-halved"></i> Sensitive item protection</strong><p style="margin:6px 0 0">Identifying details are intentionally hidden. Verify ownership before return.</p></div>` : ""}<div class="detail-meta"><div><i class="fa-solid fa-location-dot"></i>${esc(x.location)}</div><div><i class="fa-solid fa-layer-group"></i>${esc(x.category)}</div><div><i class="fa-solid fa-user"></i>Reporter: ${esc(x.finder)}</div></div>${x.verification ? `<p class="muted" style="margin-top:20px"><strong>Verification:</strong> ${esc(x.verification)}</p>` : ""}<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px">${x.phone ? `<a class="btn btn-primary" href="tel:${esc(x.phone.replaceAll(" ", ""))}"><i class="fa-solid fa-phone"></i> Contact reporter</a>` : ""}<a class="btn btn-secondary" href="lost-found.html">Back</a></div></article></div>`;
  }
  function dash() {
    let a = {
      m: market().length,
      r: lost().filter((x) => x.status !== "Returned").length,
      t: lost().filter((x) => x.status === "Returned").length,
      s: saved().length,
    };
    if ($("#statListings")) $("#statListings").textContent = a.m;
    if ($("#statReports")) $("#statReports").textContent = a.r;
    if ($("#statReturned")) $("#statReturned").textContent = a.t;
    if ($("#statSaved")) $("#statSaved").textContent = a.s;
    let b = $("#myListingsBody");
    if (b) {
      let rows = [
        ...store
          .get("campusloop-marketplace-custom", [])
          .map((x) => ({ title: x.title, type: "Marketplace", status: x.status, date: x.posted })),
        ...store
          .get("campusloop-lostfound-custom", [])
          .map((x) => ({ title: x.title, type: "Lost & Found", status: x.status, date: x.date })),
      ];
      b.innerHTML = rows.length
        ? rows
            .map(
              (x) =>
                `<tr><td>${esc(x.title)}</td><td>${esc(x.type)}</td><td><span class="badge primary">${esc(x.status)}</span></td><td>${esc(x.date)}</td></tr>`,
            )
            .join("")
        : `<tr><td colspan="4" class="muted">You have not created any listings yet.</td></tr>`;
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initNav();
    home();
    marketplace();
    lostFound();
    savedPage();
    sell();
    report();
    itemDetail();
    foundDetail();
    dash();
    reveal();
  });
})();

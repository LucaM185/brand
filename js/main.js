const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

function setStuck() {
  if (!header) return;
  header.classList.toggle("is-stuck", window.scrollY > 4);
}

setStuck();
window.addEventListener("scroll", setStuck, { passive: true });

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

function closeMenus() {
  document.querySelectorAll(".menu.is-open").forEach((menu) => {
    menu.classList.remove("is-open");
    menu.querySelector(".menu-chev")?.setAttribute("aria-expanded", "false");
  });
}

toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.classList.toggle("is-open", open);
  document.body.classList.toggle("nav-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  if (!open) closeMenus();
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle?.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", "Open menu");
    closeMenus();
  });
});

document.querySelectorAll(".menu-chev").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const menu = button.closest(".menu");
    const willOpen = !menu.classList.contains("is-open");
    closeMenus();
    menu.classList.toggle("is-open", willOpen);
    button.setAttribute("aria-expanded", String(willOpen));
  });
});

document.querySelectorAll(".menu").forEach((menu) => {
  menu.addEventListener("click", (event) => event.stopPropagation());
});

document.addEventListener("click", () => closeMenus());

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeMenus();
  nav?.classList.remove("is-open");
  toggle?.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  toggle?.setAttribute("aria-expanded", "false");
  toggle?.setAttribute("aria-label", "Open menu");
});

document.querySelectorAll(".photo img").forEach((img) => {
  const frame = img.closest(".photo");
  const fail = () => frame.classList.add("is-empty");
  const ok = () => frame.classList.remove("is-empty");
  img.addEventListener("error", fail);
  img.addEventListener("load", ok);
  if (img.complete && img.naturalWidth === 0) fail();
});

// Open every supplied image in a touch-friendly viewer. The viewer stays inside
// the page on iOS, and uses native fullscreen when the browser supports it.
const galleryImages = [...document.querySelectorAll(".photo img")];
let viewer;
let viewerImage;
let viewerTitle;
let viewerScale = 1;
let viewerRotation = 0;
let viewerOffsetX = 0;
let viewerOffsetY = 0;
let viewerSource;
let viewerPointers = new Map();
let viewerPinchStart = 0;
let viewerPinchScale = 1;
let viewerDragStart;

function clampViewerScale(value) {
  return Math.min(4, Math.max(1, value));
}

function updateViewerTransform(animate = true) {
  if (!viewerImage) return;
  viewerImage.style.transition = animate ? "transform .16s ease" : "none";
  viewerImage.style.transform = `translate3d(${viewerOffsetX}px, ${viewerOffsetY}px, 0) scale(${viewerScale}) rotate(${viewerRotation}deg)`;
}

function resetViewerTransform() {
  viewerScale = 1;
  viewerRotation = 0;
  viewerOffsetX = 0;
  viewerOffsetY = 0;
  updateViewerTransform();
}

function setViewerScale(nextScale) {
  viewerScale = clampViewerScale(nextScale);
  if (viewerScale === 1) {
    viewerOffsetX = 0;
    viewerOffsetY = 0;
  }
  updateViewerTransform();
}

function createViewer() {
  const root = document.createElement("div");
  root.className = "image-viewer";
  root.hidden = true;
  root.innerHTML = `
    <div class="image-viewer-surface" role="dialog" aria-modal="true" aria-labelledby="image-viewer-title">
      <div class="image-viewer-topbar">
        <p id="image-viewer-title" class="image-viewer-title"></p>
        <button class="image-viewer-button image-viewer-close" type="button" aria-label="Close image viewer">×</button>
      </div>
      <div class="image-viewer-stage">
        <img class="image-viewer-image" alt="">
      </div>
      <div class="image-viewer-controls" aria-label="Image controls">
        <button class="image-viewer-button" type="button" data-viewer-action="zoom-out" aria-label="Zoom out">−</button>
        <button class="image-viewer-button image-viewer-reset" type="button" data-viewer-action="reset">Reset</button>
        <button class="image-viewer-button" type="button" data-viewer-action="zoom-in" aria-label="Zoom in">+</button>
        <button class="image-viewer-button" type="button" data-viewer-action="rotate" aria-label="Rotate image">↻ <span>Rotate</span></button>
        <button class="image-viewer-button image-viewer-fullscreen" type="button" data-viewer-action="fullscreen">⛶ <span>Fullscreen</span></button>
      </div>
    </div>`;
  document.body.append(root);
  viewer = root;
  viewerImage = root.querySelector(".image-viewer-image");
  viewerTitle = root.querySelector(".image-viewer-title");

  root.querySelector(".image-viewer-close").addEventListener("click", closeViewer);
  root.addEventListener("click", (event) => {
    if (event.target === root) closeViewer();
  });
  root.querySelectorAll("[data-viewer-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.viewerAction;
      if (action === "zoom-out") setViewerScale(viewerScale - 0.25);
      if (action === "zoom-in") setViewerScale(viewerScale + 0.25);
      if (action === "reset") resetViewerTransform();
      if (action === "rotate") {
        viewerRotation = (viewerRotation + 90) % 360;
        updateViewerTransform();
      }
      if (action === "fullscreen") toggleViewerFullscreen();
    });
  });

  const stage = root.querySelector(".image-viewer-stage");
  stage.addEventListener("wheel", (event) => {
    event.preventDefault();
    setViewerScale(viewerScale + (event.deltaY < 0 ? 0.2 : -0.2));
  }, { passive: false });
  stage.addEventListener("dblclick", () => setViewerScale(viewerScale > 1 ? 1 : 2));
  stage.addEventListener("pointerdown", (event) => {
    stage.setPointerCapture?.(event.pointerId);
    viewerPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (viewerPointers.size === 2) {
      const points = [...viewerPointers.values()];
      viewerPinchStart = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      viewerPinchScale = viewerScale;
      viewerDragStart = undefined;
    } else if (viewerScale > 1) {
      viewerDragStart = { x: event.clientX - viewerOffsetX, y: event.clientY - viewerOffsetY };
    }
  });
  stage.addEventListener("pointermove", (event) => {
    if (!viewerPointers.has(event.pointerId)) return;
    viewerPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (viewerPointers.size === 2 && viewerPinchStart) {
      const points = [...viewerPointers.values()];
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      setViewerScale(viewerPinchScale * (distance / viewerPinchStart));
    } else if (viewerDragStart && viewerScale > 1) {
      viewerOffsetX = event.clientX - viewerDragStart.x;
      viewerOffsetY = event.clientY - viewerDragStart.y;
      updateViewerTransform(false);
    }
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
    stage.addEventListener(eventName, (event) => {
      viewerPointers.delete(event.pointerId);
      if (viewerPointers.size < 2) viewerPinchStart = 0;
      if (!viewerPointers.size) viewerDragStart = undefined;
    });
  });
  return root;
}

function openViewer(image) {
  if (!image || image.naturalWidth === 0) return;
  if (!viewer) createViewer();
  viewerSource = document.activeElement;
  viewerImage.src = image.currentSrc || image.src;
  viewerImage.alt = image.alt || "Expanded image";
  viewerTitle.textContent = image.alt || "Image preview";
  resetViewerTransform();
  viewer.hidden = false;
  document.body.classList.add("image-viewer-open");
  viewer.querySelector(".image-viewer-close").focus();
}

function closeViewer() {
  if (!viewer || viewer.hidden) return;
  if (document.fullscreenElement) document.exitFullscreen?.();
  viewer.hidden = true;
  document.body.classList.remove("image-viewer-open");
  viewerPointers.clear();
  viewerSource?.focus?.();
}

function toggleViewerFullscreen() {
  if (!viewer) return;
  const surface = viewer.querySelector(".image-viewer-surface");
  if (document.fullscreenElement) document.exitFullscreen?.();
  else surface.requestFullscreen?.();
}

galleryImages.forEach((image) => {
  image.tabIndex = 0;
  image.setAttribute("role", "button");
  image.setAttribute("aria-label", `Open image fullscreen: ${image.alt || "image"}`);
  const activate = (event) => {
    if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.stopPropagation();
    openViewer(image);
  };
  image.addEventListener("click", activate);
  image.addEventListener("keydown", activate);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && viewer && !viewer.hidden) closeViewer();
});

const form = document.querySelector(".contact-form");
if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = form.dataset.email;
    const data = new FormData(form);
    const lines = [
      `Name: ${data.get("name")}`,
      `Company: ${data.get("company")}`,
      `Email: ${data.get("email")}`,
      `Topic: ${data.get("topic")}`,
      "",
      String(data.get("message") || ""),
    ];
    const subject = encodeURIComponent(`${data.get("topic")} — ${data.get("company") || data.get("name")}`);
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    const status = form.querySelector(".form-status");
    if (status) {
      status.hidden = false;
      status.textContent = `If your email app did not open, write directly to ${email}.`;
    }
  });
}

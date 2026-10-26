// If a newer build was deployed, reload the page (once per build) so visitors never stay on an old version.
export function watchForNewVersion() {
  if (import.meta.env.DEV) return;
  let busy = false;

  const check = async () => {
    if (busy) return;
    busy = true;
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        cache: "no-store",
      });
      const { id } = await res.json();
      let tried = null;
      try {
        tried = sessionStorage.getItem("tried-build");
      } catch {
        /* private mode */
      }
      if (id && id !== __BUILD_ID__ && tried !== id) {
        try {
          sessionStorage.setItem("tried-build", id);
        } catch {
          /* ignore */
        }
        await fetch(location.href, { cache: "reload" }).catch(() => {}); // refresh the saved page
        location.reload();
      }
    } catch {
      /* offline: try again later */
    }
    busy = false;
  };

  check();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") check();
  });
  setInterval(check, 5 * 60 * 1000);
}

(function(){
  const cfg = window.SITE_CONFIG || {};
  const setText = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
  setText('companyName', cfg.companyName || 'Residential Radon Solutions, LLC');
  setText('productName', cfg.productName || 'Smart Radon Fan');
  setText('tagline', cfg.tagline || 'Adaptive control for residential radon mitigation fans');
  setText('contactName', cfg.contactName || 'Michael J. Gutmann');
  setText('contactAddress', cfg.contactAddress || '1125 NE 3rd Avenue, Hillsboro, OR 97124');
  setText('contactPhone', cfg.contactPhone || '503 869 9507');
  setText('contactEmail', cfg.contactEmail || 'info@smartradonfan.com');

  document.querySelectorAll('[data-viewer-url]').forEach((link) => {
    link.href = cfg.installerViewerUrl || 'https://api.smartradonfan.com/installer';
  });
  document.querySelectorAll('[data-viewer-signup-url]').forEach((link) => {
    link.href = cfg.installerSignupUrl || 'https://api.smartradonfan.com/installer/signup';
  });

  // Update title
  document.title = `${cfg.productName || 'Smart Radon Fan'} — ${cfg.companyName || 'Residential Radon Solutions, LLC'}`;
})();

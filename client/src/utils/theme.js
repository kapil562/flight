// Global Dynamic Theme Manager for AirSkyGo
// Dynamically overrides CSS variables and Tailwind classes across the entire application in real time

export function applyGlobalTheme(brand) {
  if (typeof document === 'undefined') return;

  const primary = brand?.primary_color || '#ff6d01';
  const hover = brand?.hover_color || '#e65700';
  const light = brand?.light_color || '#fff4eb';
  const dark = brand?.dark_color || '#272c33';
  const brandText = brand?.brand_text_color || '#0B1F3A';
  const tagline = brand?.tagline_color || '#6b7280';

  // Set CSS custom properties on documentElement
  document.documentElement.style.setProperty('--brand', primary);
  document.documentElement.style.setProperty('--brand-hover', hover);
  document.documentElement.style.setProperty('--brand-light', light);
  document.documentElement.style.setProperty('--brand-dark', dark);
  document.documentElement.style.setProperty('--brand-text', brandText);
  document.documentElement.style.setProperty('--tagline-color', tagline);
  document.documentElement.style.setProperty('--theme-primary', primary);
  document.documentElement.style.setProperty('--theme-hover', hover);
  document.documentElement.style.setProperty('--theme-light', light);
  document.documentElement.style.setProperty('--theme-dark', dark);

  let styleTag = document.getElementById('asg-dynamic-brand-theme');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'asg-dynamic-brand-theme';
    document.head.appendChild(styleTag);
  }

  styleTag.innerHTML = `
    :root {
      --brand: ${primary};
      --brand-hover: ${hover};
      --brand-light: ${light};
      --brand-dark: ${dark};
      --brand-text: ${brandText};
      --tagline-color: ${tagline};
      --theme-primary: ${primary};
      --theme-hover: ${hover};
      --theme-light: ${light};
      --theme-dark: ${dark};
    }

    /* Core Primary Buttons & Backgrounds */
    .bg-sky-600 { background-color: ${primary} !important; }
    .bg-sky-500 { background-color: ${primary} !important; }
    .bg-sky-700 { background-color: ${hover} !important; }
    .hover\\:bg-sky-500:hover, .hover\\:bg-sky-600:hover { background-color: ${hover} !important; }
    .hover\\:bg-sky-700:hover { background-color: ${hover} !important; }

    /* Core Text Colors & Accents */
    .text-sky-600 { color: ${primary} !important; }
    .text-sky-500 { color: ${primary} !important; }
    .text-sky-700 { color: ${hover} !important; }
    .hover\\:text-sky-600:hover, .hover\\:text-sky-700:hover { color: ${hover} !important; }

    /* Borders */
    .border-sky-500, .border-sky-600 { border-color: ${primary} !important; }
    .border-sky-200, .border-sky-300 { border-color: ${light} !important; }
    .border-sky-400 { border-color: ${primary} !important; }
    .hover\\:border-sky-500:hover { border-color: ${primary} !important; }

    /* Light Accents, Badges, Tabs & Highlights */
    .bg-sky-50 { background-color: ${light} !important; }
    .bg-sky-100 { background-color: ${light} !important; }
    .hover\\:bg-sky-50:hover { background-color: ${light} !important; }
    .hover\\:bg-sky-100:hover { background-color: ${light} !important; }

    /* Gradients */
    .from-sky-500, .from-sky-600 { --tw-gradient-from: ${primary} !important; }
    .to-blue-600, .to-sky-600 { --tw-gradient-to: ${hover} !important; }
    .via-sky-950, .to-sky-950 { --tw-gradient-via: ${dark} !important; --tw-gradient-to: ${dark} !important; }

    /* Focus rings & active shadows */
    .shadow-sky-600\\/30, .shadow-sky-500\\/30 { box-shadow: 0 10px 15px -3px ${primary}40 !important; }
    .ring-sky-500, .focus\\:ring-sky-500:focus { --tw-ring-color: ${primary} !important; }
  `;
}

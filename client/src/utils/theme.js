// Global Dynamic Theme Manager for AirSkyGo
// Dynamically overrides CSS variables and Tailwind classes across the entire application in real time

export function applyGlobalTheme(brand) {
  if (typeof document === 'undefined') return;

  const primary = brand?.primary_color || '#0284c7';
  const hover = brand?.hover_color || '#0369a1';
  const light = brand?.light_color || '#f0f9ff';
  const dark = brand?.dark_color || '#0f172a';
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
      --color-primary: ${primary};
    }

    /* Core Primary Buttons & Backgrounds (Sky & Blue utility classes) */
    .bg-sky-600, .bg-blue-600 { background-color: ${primary} !important; }
    .bg-sky-500, .bg-blue-500 { background-color: ${primary} !important; }
    .bg-sky-700, .bg-blue-700 { background-color: ${hover} !important; }
    .hover\\:bg-sky-500:hover, .hover\\:bg-sky-600:hover, .hover\\:bg-blue-600:hover { background-color: ${hover} !important; }
    .hover\\:bg-sky-700:hover, .hover\\:bg-blue-700:hover { background-color: ${hover} !important; }

    /* Core Text Colors & Accents */
    .text-sky-600, .text-blue-600 { color: ${primary} !important; }
    .text-sky-500, .text-blue-500 { color: ${primary} !important; }
    .text-sky-700, .text-blue-700 { color: ${hover} !important; }
    .hover\\:text-sky-600:hover, .hover\\:text-sky-700:hover, .hover\\:text-blue-600:hover { color: ${hover} !important; }

    /* Borders */
    .border-sky-500, .border-sky-600, .border-blue-500, .border-blue-600 { border-color: ${primary} !important; }
    .border-sky-200, .border-sky-300, .border-blue-200, .border-blue-300 { border-color: ${light} !important; }
    .border-sky-400, .border-blue-400 { border-color: ${primary} !important; }
    .hover\\:border-sky-500:hover, .hover\\:border-blue-500:hover, .hover\\:border-sky-300:hover { border-color: ${primary} !important; }

    /* Light Accents, Badges, Tabs & Highlights */
    .bg-sky-50, .bg-blue-50 { background-color: ${light} !important; }
    .bg-sky-100, .bg-blue-100 { background-color: ${light} !important; }
    .hover\\:bg-sky-50:hover, .hover\\:bg-blue-50:hover { background-color: ${light} !important; }
    .hover\\:bg-sky-100:hover, .hover\\:bg-blue-100:hover { background-color: ${light} !important; }

    /* Gradients */
    .from-sky-500, .from-sky-600, .from-blue-600 { --tw-gradient-from: ${primary} !important; }
    .to-blue-600, .to-sky-600 { --tw-gradient-to: ${hover} !important; }
    .via-sky-950, .to-sky-950 { --tw-gradient-via: ${dark} !important; --tw-gradient-to: ${dark} !important; }

    /* Focus rings & active shadows */
    .shadow-sky-600\\/30, .shadow-sky-500\\/30, .shadow-blue-600\\/30 { box-shadow: 0 10px 15px -3px ${primary}40 !important; }
    .ring-sky-500, .focus\\:ring-sky-500:focus, .ring-blue-500 { --tw-ring-color: ${primary} !important; }

    /* SVG icon strokes & fills */
    svg.text-sky-600, svg.text-blue-600 {
      color: ${primary} !important;
    }
    .fill-sky-600, .fill-blue-600 {
      fill: ${primary} !important;
    }
  `;
}

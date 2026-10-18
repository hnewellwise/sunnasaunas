/**
 * Build-time loader for hosted OpnForm forms. The form's fields come from OpnForm's public API
 * (the same one its own embed uses) and are rendered as native, site-styled HTML by
 * OpnForm.astro, which posts answers straight back to OpnForm. Edit fields in OpnForm, then
 * rebuild the site to pick them up.
 */

export const OPNFORM_API = 'https://api.opnform.com';

/**
 * OpnForm's public reCAPTCHA v2 site key (from opnform.com's own page config). Its domain check
 * is off, so the widget works on our domain and OpnForm verifies the token server-side.
 */
export const OPNFORM_RECAPTCHA_SITE_KEY = '6LeYjJ8qAAAAANk4sx1iElecEFHqGhXxPP_RnvkF';

export interface OpnField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'phone_number' | 'number' | 'url' | 'date';
  required: boolean;
  placeholder: string | null;
  help: string | null;
  multiLines: boolean;
}

export interface OpnFormSchema {
  slug: string;
  fields: OpnField[];
  submitText: string | null;
  submittedText: string;
  /** "Protect with captcha" is on in OpnForm; the answer must carry a g-recaptcha-response. */
  recaptcha: boolean;
}

const SUPPORTED = new Set(['text', 'email', 'phone_number', 'number', 'url', 'date']);
const cache = new Map<string, Promise<OpnFormSchema | null>>();

/**
 * Returns null when the form can't be fetched or uses a field type we don't render natively;
 * the caller then falls back to OpnForm's iframe embed.
 */
export function loadOpnForm(slug: string): Promise<OpnFormSchema | null> {
  if (!cache.has(slug)) cache.set(slug, fetchSchema(slug));
  return cache.get(slug)!;
}

async function fetchSchema(slug: string): Promise<OpnFormSchema | null> {
  let form: any;
  try {
    const res = await fetch(`${OPNFORM_API}/forms/${slug}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    form = await res.json();
  } catch (err) {
    console.warn(`[opnform] ${slug}: could not load schema (${err}), using iframe embed`);
    return null;
  }

  if (form.use_captcha && form.captcha_provider !== 'recaptcha') {
    console.warn(`[opnform] ${slug}: captcha provider "${form.captcha_provider}" not supported natively, using iframe embed`);
    return null;
  }

  const fields: OpnField[] = [];
  for (const p of form.properties ?? []) {
    // nf-* are display blocks (title text, images, page breaks); OpnForm hides the title one.
    if (p.hidden || String(p.type).startsWith('nf-')) continue;
    if (!SUPPORTED.has(p.type)) {
      console.warn(`[opnform] ${slug}: field type "${p.type}" not supported natively, using iframe embed`);
      return null;
    }
    fields.push({
      id: p.id,
      name: p.name,
      type: p.type,
      required: !!p.required,
      placeholder: p.placeholder ?? null,
      help: p.help ?? null,
      multiLines: !!p.multi_lines,
    });
  }

  return {
    slug,
    fields,
    submitText: form.submit_button_text || null,
    submittedText: form.submitted_text || '',
    recaptcha: !!form.use_captcha,
  };
}

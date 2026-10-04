const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Escapes text and turns `backticks` into <code>. For trusted, authored strings only. */
export const richHtml = (s: string) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');

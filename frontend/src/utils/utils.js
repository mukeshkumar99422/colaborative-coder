export const LANGUAGES = [
  ['javascript', 'JavaScript'], ['typescript', 'TypeScript'], ['python', 'Python'],
  ['java', 'Java'], ['cpp', 'C++'], ['c', 'C'], ['csharp', 'C#'], ['go', 'Go'],
  ['rust', 'Rust'], ['php', 'PHP'], ['html', 'HTML'], ['css', 'CSS'],
  ['json', 'JSON'], ['sql', 'SQL'],
]

export const inputCls =
  'w-full rounded-lg bg-[#0E2130] border border-[#2A4A63] px-3 py-2.5 text-white placeholder-[#5F7C91] focus:outline-none focus:border-[#CEFF52] focus:ring-1 focus:ring-[#CEFF52] transition'
export const primaryBtn =
  'w-full rounded-lg bg-[#CEFF52] hover:bg-[#dcff7d] text-[#152E40] font-semibold py-2.5 transition disabled:opacity-50'
export const labelCls = 'block text-sm text-[#8FA9BC] mb-1.5'


// Unique, evenly spread color per Yjs clientId (same on every screen)
export const hueFor = (clientId) => Math.round((clientId * 137.508) % 360)
export const colorFor = (clientId) => `hsl(${hueFor(clientId)} 75% 60%)`
export const selectionFor = (clientId) => `hsl(${hueFor(clientId)} 75% 60% / 0.3)`

// Monaco theme matching the app palette
export const defineTheme = (monaco) => {
  monaco.editor.defineTheme('codetogether', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#0F2537',
      'editor.lineHighlightBackground': '#152E40',
      'editorLineNumber.foreground': '#4F6D84',
      'editorLineNumber.activeForeground': '#CEFF52',
      'editorCursor.foreground': '#CEFF52',
      'editor.selectionBackground': '#2A4A63',
      'editorWidget.background': '#152E40',
      'editorGutter.background': '#0F2537',
    },
  })
}

export const iconBtn =
  'flex items-center gap-1.5 text-sm rounded-lg px-3 py-1.5 transition'




module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: ['./@(components|content|pages)/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        cover1: '#fdfab8',
        cover2: '#b8ffcb',
        success: '#0070f3',
      },
      spacing: {
        '05': '0.125rem',
      }
    },
  },
}

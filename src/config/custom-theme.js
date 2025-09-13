import { dark } from '@adminjs/themes';

const customTheme = {
  ...dark,
  colors: {
    ...dark.colors,
    primary100: '#4a6da7',
    primary80: '#3e5d8f',
    primary60: '#324e7d',
    primary40: '#273e6a',
    primary20: '#1b2e56',
    accent: '#ff9800',
    love: '#e91e63',
    grey100: '#0e1621',
    grey80: '#1c2733',
    grey60: '#2a3a48',
    grey40: '#3a4c5a',
    white: '#ffffff',
    filterBg: '#1c2733',
    hoverBg: '#2a3a48',
  },
  font: "'Poppins', sans-serif",
  shadows: {
    ...dark.shadows,
    card: '0 1px 6px 0 rgba(0, 0, 0, 0.5)',
    cardHover: '0 4px 12px 0 rgba(0, 0, 0, 0.7)',
  },
};

export default customTheme;

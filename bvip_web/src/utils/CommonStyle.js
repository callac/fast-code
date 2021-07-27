export const ellipsis = {
  style: maxWidth => ({
    maxWidth,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  }),
  str: (str, len) => `${str.slice(0, len)}${str.length < len ? '' : '...'}`,
}

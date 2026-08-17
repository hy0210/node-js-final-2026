export default function isValidUrl(value) {
  return typeof value === 'string' && value.startsWith('https');
}

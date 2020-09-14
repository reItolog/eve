import { qsa } from './selector'

export function preload(el = document.body) {
  const paths = [...qsa('img', el)].map((image) => image.src)
  return Promise.all(paths.map(checkImage))
}

export const checkImage = (path) =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ path, status: 'ok' })
    img.onerror = () => resolve({ path, status: 'error' })
    img.src = path
  })

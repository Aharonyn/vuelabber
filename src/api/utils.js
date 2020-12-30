let urlToId = url => {
  let urlParts = url.split('/')
  return Number(urlParts[urlParts.length - 2])
}

let listToQuery = (name, values) => {
  let vals = values ? values : []
  return vals.map((value) => {
    return `${name}=${value}`
  }).join('&')
}

export { urlToId, listToQuery }

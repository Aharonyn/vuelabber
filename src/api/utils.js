let urlToId = url => {
  let urlParts = url.split('/')
  return Number(urlParts[urlParts.length - 2])
}

let listToQuery = (name, values) => {
  return values && values.length ? `${name}=` + values.join(`&${name}=`) : ''
}

export { urlToId, listToQuery }

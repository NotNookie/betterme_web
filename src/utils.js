export function getProductId(product) {
  return product.url.split("/").filter(Boolean).pop();
}

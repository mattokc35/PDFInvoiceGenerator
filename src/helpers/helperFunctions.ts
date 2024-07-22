export const validateUrl = (url: string): boolean => {
  const regex = /^https:\/\/www\.withgarage\.com\/listing\/[a-f0-9\-]{36}$/i;
  return regex.test(url);
};

export const getListingIdFromUrl = (url: string) => {
  const parts = url.split("/");
  return parts[parts.length - 1];
};

export const formatPrice = (price: number) => {
  return `$${price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

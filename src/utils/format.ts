export const formatEther = (value: number): string => {
  return value.toFixed(4);
};

export const formatUSD = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

export const shortenAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};
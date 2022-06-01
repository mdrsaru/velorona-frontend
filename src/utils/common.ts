export const round = (value: number, decimals: number): number => {
  const temp = parseFloat(value + `e+${decimals}`);
  const result = Math.round(temp)  + `e-${decimals}`;
  return parseFloat(result);
}   


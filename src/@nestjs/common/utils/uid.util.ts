export const iterate = <T>(
  count: number,
  fun: (currentValue: TemplateStringsArray, iteration: number) => T,
  initValue
) => {
  let value = initValue;
  for (let i = 1; i <= count; i++) {
    value = fun(value, i);
  }

  return value;
};

export const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const uid = (length: number, specials = "") => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" + specials;
  return iterate<string>(
    length,
    (acc) => acc + characters.charAt(random(0, characters.length - 1)),
    ""
  );
};

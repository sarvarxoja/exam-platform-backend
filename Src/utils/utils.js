import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export function getUniqueFourDigitNumber() {
  // 0 dan 9 gacha bo'lgan raqamlar
  const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  // Birinchi raqam nol bo'lmagan raqamlar orasidan tanlanadi
  const nonZeroDigits = digits.filter((digit) => digit !== "0");
  const firstDigit =
    nonZeroDigits[Math.floor(Math.random() * nonZeroDigits.length)];

  // Tanlangan raqamni umumiy ro'yxatdan olib tashlaymiz
  const remainingDigits = digits.filter((digit) => digit !== firstDigit);

  // Natijaviy sonni birinchi raqam bilan boshlaymiz
  let result = firstDigit;

  // Qolgan 3 ta raqamni tanlab, natijaga qo'shamiz
  for (let i = 0; i < 3; i++) {
    const index = Math.floor(Math.random() * remainingDigits.length);
    result += remainingDigits[index];
    // Tanlangan raqamni massivdan olib tashlaymiz, shunda u qayta tanlanmaydi
    remainingDigits.splice(index, 1);
  }

  return result;
}

export async function comparePassword(rawPassword, hash) {
  try {
    return bcrypt.compareSync(rawPassword, hash);
  } catch (error) {
    console.log(error.message);
  }
}

export async function jwtSign(id, tokenVersion) {
  const SECRET_KEY = process.env.SECRET_KEY;
  const expiresIn = 15 * 60;

  let jwtData = jwt.sign({ id: id, version: tokenVersion }, SECRET_KEY, {
    expiresIn,
  });

  return jwtData;
}

export async function jwtRefreshSign(id, version) {
  try {
    const SECRET_KEY = process.env.VERIFY_KEY;
    const expiresIn = 30 * 24 * 60 * 60;
    let jwtData = jwt.sign({ id: id, version: version }, SECRET_KEY, {
      expiresIn,
    });

    return jwtData;
  } catch (error) {
    console.log(error);
  }
}
// Create a somewhat random id, hopefully won't overlap with other UIDs.
export function generateUID() {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  let firstPart = (Math.random() * 46656) | 0;
  let secondPart = (Math.random() * 46656) | 0;
  return +`${firstPart}${secondPart}`;
}

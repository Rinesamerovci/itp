export function preventAccidentalEnterSubmit(event) {
  const tagName = event.target.tagName;
  const type = event.target.type;

  if (event.key === "Enter" && tagName !== "TEXTAREA" && type !== "submit" && type !== "button") {
    event.preventDefault();
  }
}

export function addMonths(date, months) {
  const output = new Date(date);
  output.setMonth(output.getMonth() + months);
  return output;
}

export function addDays(date, days) {
  const output = new Date(date);
  output.setDate(output.getDate() + days);
  return output;
}

export function subtractYears(date, years) {
  const output = new Date(date);
  output.setFullYear(output.getFullYear() - years);
  return output;
}

export function subtractMonths(date, months) {
  const output = new Date(date);
  output.setMonth(output.getMonth() - months);
  return output;
}

export function formatDate(dateValue) {
  if (!dateValue) {
    return "--";
  }

  const date = new Date(dateValue);
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}

export function formatDateTime(dateValue) {
  if (!dateValue) {
    return "--";
  }

  const date = new Date(dateValue);
  return `${formatDate(date)} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function toIsoDate(dateValue) {
  const date = new Date(dateValue);
  return date.toISOString().slice(0, 10);
}

export function getAgeInMonths(dob) {
  const birthDate = new Date(dob);
  const now = new Date();
  return (now.getFullYear() - birthDate.getFullYear()) * 12 + now.getMonth() - birthDate.getMonth();
}

export function getAgeLabel(dob) {
  const months = getAgeInMonths(dob);
  if (months < 12) {
    return `${months}m`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths ? `${years}y ${remainingMonths}m` : `${years}y`;
}

export function daysUntil(dateValue) {
  const ms = new Date(dateValue).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
}

export function monthsOverdue(dateValue) {
  const due = new Date(dateValue);
  const now = new Date();
  const totalMonths = (now.getFullYear() - due.getFullYear()) * 12 + now.getMonth() - due.getMonth();
  return due > now ? 0 : Math.max(0, totalMonths);
}

export function timeAgoLabel(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const diff = Date.now() - new Date(dateValue).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) {
    return "today";
  }
  if (days < 30) {
    return `${days}d ago`;
  }
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
